
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.config import get_settings
import google.generativeai as genai

def list_models():
    settings = get_settings()
    api_key = settings.gemini_api_key
    
    genai.configure(api_key=api_key)
    
    print("Listing models...")
    try:
        for m in genai.list_models():
            print(f"Model: {m.name}")
            print(f"Supported methods: {m.supported_generation_methods}")
    except Exception as e:
        print(f"Error listing models: {e}")

if __name__ == "__main__":
    list_models()
