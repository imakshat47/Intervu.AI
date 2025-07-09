import requests

# Make a GET request
response = requests.get("http://localhost:8000/")
print(response.status_code)  # 200
print(response.json()) 

headers = {
    "Authorization": "Bearer your_token_here",
    "Content-Type": "application/json"
}

# POST with form data
queries = [
    "I am a software engineer working at ST. ",
    "I am good at developing web applications and have experience with Python, JavaScript, and React. ",
    "I have worked on several projects, including a web-based inventory management system and a real-time chat application. ",
]

for query in queries:
    form_data = {"session_id": "john1", "user_input": str(query)}
    response = requests.post("http://localhost:8000/interview", json=form_data, headers=headers)
    print(response.json()) 