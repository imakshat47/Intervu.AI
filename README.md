# Intervu.AI
A voice first, context aware,  agentic interview coach  powered by LangChain and  LLMs

This is a FastAPI-based backend for conducting intelligent interviews using an LLM-powered agent. The agent evaluates user responses, provides feedback, assigns scores, and generates the next interview question dynamically.

---

## 🚀 Setup Instructions

### Clone the Repository

```bash
git clone https://github.com/imakshat47/Intervu.AI
cd interview-agent
```
1. Create a Virtual Environment
```bash
python -m venv venv
```
2. Activate the virtual environment:

On macOS/Linux:

```bash
source venv/bin/activate 
```
On Windows:

```bash
venv\Scripts\activate
```
3. Install Dependencies
```bash
pip install -r requirements.txt
```
4. Set Up Environment Variables
Create a .env file in the root directory with your LLM credentials:

```env

GROQ_OPENAI_BASE_URL=https://api.groq.com/openai/v1
GROQ_API_KEY=your_groq_api_key_here
```
You can adjust this to work with any OpenAI-compatible endpoint.

5. Run the Server
```bash
python app.py
```
The server will start at:
http://localhost:8000


### To run front end go to 'project' folder