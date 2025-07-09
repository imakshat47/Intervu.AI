from __future__ import annotations as _annotations
import uvicorn
import asyncio
import os
import uuid
from dotenv import load_dotenv
import json
from pydantic import BaseModel
from openai import AsyncOpenAI
from fastapi import FastAPI
from agents import (
    OpenAIChatCompletionsModel, Agent,
    HandoffOutputItem, ItemHelpers, MessageOutputItem,
    RunContextWrapper, Runner,
    ToolCallItem, ToolCallOutputItem, TResponseInputItem,
    function_tool, handoff, trace,
    set_tracing_disabled
)
from agents.extensions.handoff_prompt import RECOMMENDED_PROMPT_PREFIX

# Load environment variables
load_dotenv()
set_tracing_disabled(disabled=True)

groq_base_url = os.environ.get("GROQ_OPENAI_BASE_URL")
groq_api_key = os.environ.get("GROQ_API_KEY")

model = "deepseek-r1-distill-llama-70b"

custom_model = OpenAIChatCompletionsModel(
    model=model,
    openai_client=AsyncOpenAI(base_url=groq_base_url, api_key=groq_api_key)
)

# Context
class InterviewAgentContext(BaseModel):
    candidate_name: str | None = None
    current_stage: str = "introduction"
    past_answers: list[str] = []

class InterviewRequest(BaseModel):
    session_id: str
    user_input: str

class InterviewResponse(BaseModel):
    refined_answer: str
    next_question: str

session_contexts: dict[str, InterviewAgentContext] = {}
session_inputs: dict[str, list[TResponseInputItem]] = {}

### TOOLS

@function_tool(name_override="interview_feedback_tool",
               description_override="Analyze user response and suggest next interview question.")
async def interview_feedback_tool(answer: str, stage: str) -> str:
    """
    Suggest the next question based on the current stage and user response.
    """
    if stage == "introduction":
        return "Why are you interested in this position?"
    elif stage == "experience":
        return "Can you describe a project where you solved a difficult problem?"
    elif stage == "skills":
        return "What is your experience with Python and system design?"
    else:
        return "Do you have any questions for us?"


### AGENT
interview_agent = Agent[InterviewAgentContext](
    name="Interview Agent",
    model=custom_model,
    handoff_description="An intelligent agent that conducts interviews by asking relevant questions.",
    instructions=f"""{RECOMMENDED_PROMPT_PREFIX}
    You are a professional interviewer. Start the session with 'Tell me about yourself'.
    For each response, use the interview_feedback_tool to generate the next question.
    Maintain the context of the conversation including previous responses.
    Format your reply as a JSON object with two keys:
    - refined_answer: A clearer and professional version of the user's answer.
    - next_question: The next follow-up or related a question to ask the candidate.
    Ensure the JSON is parsable and concise. json response should look like:
    {{
        "refined_answer": "A clearer and professional version of the user's answer.",
        "next_question": "The next follow-up or related question."
    }}
    """,
    tools=[interview_feedback_tool],
)

### FASTAPI APP
app = FastAPI()
@app.get("/")
async def root():
    return {"message": "Hello there!!"}
@app.post("/interview", response_model=InterviewResponse)
async def interview_endpoint(req: InterviewRequest):
    session_id = req.session_id
    user_input = req.user_input
    res = {
    "refined_answer": "I have contributed to several projects, including a web-based inventory management system and a real-time chat application, utilizing technologies such as Python, JavaScript, and React.",        
    "next_question": "Can you elaborate on the web-based inventory management system? What were some of the key technologies and challenges you encountered?"
}
    return InterviewResponse(**res)
    # Initialize context and history
    context = session_contexts.get(session_id, InterviewAgentContext())
    input_items = session_inputs.get(session_id, [])

    if not input_items:
        # First message in the session
        input_items.append({"content": "Tell me about yourself", "role": "assistant"})

    context.past_answers.append(user_input)
    input_items.append({"content": user_input, "role": "user"})

    # Run the agent
    with trace("Interview", group_id=session_id):
        result = await Runner.run(interview_agent, input_items, context=context, max_turns=20)

    # Extract final response
    for new_item in result.new_items:
        if isinstance(new_item, MessageOutputItem):
            try:
                print(f"New item: {new_item}")
                res = ItemHelpers.text_message_output(new_item)
                print(f"Response: {res}")
                parsed = json.loads(res)
                output_text = {
                    "refined_answer": parsed.get("refined_answer", ""),
                    "next_question": parsed.get("next_question", "")
                }
            except Exception:
                output_text = {
                    "refined_answer": "(Failed to parse refined_answer)",
                    "next_question": "(Failed to parse next_question)"
                }
            break
        else:
            output_text = {
                "refined_answer": "(No valid response)",
                "next_question": "(No question generated)"
            }

    # Persist session state
    session_contexts[session_id] = context
    session_inputs[session_id] = result.to_input_list()
    
    return InterviewResponse(**output_text)
    return InterviewResponse(agent_output=output_text)

if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8000 , reload=True, log_level="info")

# python app.py