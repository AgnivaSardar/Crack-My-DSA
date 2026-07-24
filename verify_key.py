import os
import sys
from pathlib import Path
from dotenv import load_dotenv

# Add project root to python path
sys.path.append(str(Path(__file__).resolve().parent))

# Load .env file
load_dotenv()

key = os.getenv("GEMINI_API_KEY", "")
if not key:
    print("❌ Error: GEMINI_API_KEY is not set in your .env file.")
    sys.exit(1)

print(f"Loaded key: {key[:6]}...{key[-6:] if len(key) > 12 else ''}")
print("Testing Google GenAI client connectivity...")

try:
    from google import genai
    client = genai.Client(api_key=key)
    print("Client initialized. Testing text generation with 'gemini-3.5-flash-lite'...")
    
    response = client.models.generate_content(
        model="gemini-3.5-flash-lite",
        contents="Please say: 'Gemini API connection is active and working!'"
    )
    
    print("\n✅ API Connection Success!")
    print("Response from Gemini:")
    print(response.text)
    
except Exception as e:
    print("\n❌ API Call Failed!")
    print("Exact error message:")
    print(e)
