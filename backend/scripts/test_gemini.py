
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.config import get_settings
import google.generativeai as genai

def test_gemini():
    settings = get_settings()
    api_key = settings.gemini_api_key
    
    print(f"API Key present: {bool(api_key)}")
    if api_key:
        print(f"API Key prefix: {api_key[:5]}...")
    else:
        print("ERROR: No API Key found in settings")
        return

    try:
        genai.configure(api_key=api_key)
        
        print("\nTesting generation with 'gemini-1.5-flash'...")
        model = genai.GenerativeModel('gemini-1.5-flash')
        response = model.generate_content("Hello, say 'AI is working' in Chinese")
        print(f"Response: {response.text}")
        print("\n✅ Gemini API is working correctly!")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")

if __name__ == "__main__":
    test_gemini()
