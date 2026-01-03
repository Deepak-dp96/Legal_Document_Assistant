import os
from groq import Groq

def get_groq_client():
    api_key = os.getenv("GROQ_API_KEY")
    return Groq(api_key=api_key)
