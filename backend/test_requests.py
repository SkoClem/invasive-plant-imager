import requests

response = requests.post(
    "https://language-practice-web.onrender.com/api/chat",
    json={"message": "Create 12 question SAT english exam"}
)
print(response.json())