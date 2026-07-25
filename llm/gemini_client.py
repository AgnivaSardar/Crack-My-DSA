from google import genai
from google.genai import types
import sys
from pathlib import Path
from typing import Dict, Any, Type, Optional
from pydantic import BaseModel

sys.path.append(str(Path(__file__).resolve().parent.parent))
from configs import config

import os

class GeminiClient:
    def __init__(self):
        if not config.GEMINI_API_KEY:
            raise ValueError("GEMINI_API_KEY is not set in environment variables.")
        self.client = genai.Client(api_key=config.GEMINI_API_KEY)
        self.model = os.getenv("GEMINI_MODEL", "gemini-2.0-flash-lite") # Gemini Flash Lite model (1500 RPM / 1M TPM free quota)

    def generate_text(self, prompt: str, system_instruction: Optional[str] = None) -> str:
        """Generates standard text output from a prompt."""
        config_args = {}
        if system_instruction:
            config_args["system_instruction"] = system_instruction
            
        try:
            response = self.client.models.generate_content(
                model=self.model,
                contents=prompt,
                config=types.GenerateContentConfig(**config_args) if config_args else None
            )
            return response.text
        except Exception as e:
            print(f"Error generating text via Gemini API: {e}")
            raise e

    def generate_structured(self, prompt: str, response_schema: Type[BaseModel], system_instruction: Optional[str] = None) -> BaseModel:
        """Generates a structured Pydantic response from a prompt."""
        config_args = {
            "response_mime_type": "application/json",
            "response_schema": response_schema
        }
        if system_instruction:
            config_args["system_instruction"] = system_instruction
            
        try:
            response = self.client.models.generate_content(
                model=self.model,
                contents=prompt,
                config=types.GenerateContentConfig(**config_args)
            )
            # Parse the JSON response back into Pydantic model
            # response.text is guaranteed to be matching the schema structure
            return response_schema.model_validate_json(response.text)
        except Exception as e:
            print(f"Error generating structured content via Gemini API: {e}")
            raise e

if __name__ == "__main__":
    client = GeminiClient()
    print("Gemini client successfully initialized.")
