import time
import sys
from pathlib import Path
from typing import List, Union

sys.path.append(str(Path(__file__).resolve().parent.parent))
from configs import config

class EmbeddingManager:
    def __init__(self):
        self.provider = config.EMBEDDING_PROVIDER
        self.local_model = None
        self.gemini_client = None
        self.is_offline = False
        self.embedding_dim = 384  # Default to 384 (all-MiniLM-L6-v2 size)
        
        # Detect offline environment to prevent long timeouts/retries
        import socket
        try:
            socket.setdefaulttimeout(1.5)
            socket.gethostbyname("huggingface.co")
        except Exception:
            print("Offline Environment Detected: Bypassing network calls.")
            self.is_offline = True
            
        print(f"Initializing EmbeddingManager with provider: {self.provider} (Offline: {self.is_offline})")
        
        if self.is_offline:
            self.embedding_dim = 384
            return
        
        if self.provider == "local":
            self.embedding_dim = 384
            print("Local embedding manager initialized. Will query http://localhost:8001/embed microservice.")
                
        elif self.provider == "gemini":
            if not config.GEMINI_API_KEY:
                print("Warning: GEMINI_API_KEY not set. Operating in offline fallback mode.")
                self.is_offline = True
                self.embedding_dim = 384
            else:
                try:
                    from google import genai
                    print("Initializing Gemini Client...")
                    self.gemini_client = genai.Client(api_key=config.GEMINI_API_KEY)
                    self.embedding_dim = 768
                    print("Gemini Client initialized successfully.")
                except Exception as e:
                    print(f"Offline Warning: Failed to initialize Gemini Client: {e}")
                    print("Switching to offline fallback mode (dummy embeddings).")
                    self.is_offline = True
                    self.embedding_dim = 384

    def get_embedding(self, text: str) -> List[float]:
        """Gets vector embedding for a single string."""
        return self.get_embeddings([text])[0]

    def get_embeddings(self, texts: List[str]) -> List[List[float]]:
        """Gets vector embeddings for a list of strings."""
        if not texts:
            return []

        if self.is_offline:
            # Return dummy zero-vectors of appropriate dimension
            return [[0.0] * self.embedding_dim for _ in texts]

        if self.provider == "local":
            import urllib.request
            import json
            
            url = "http://localhost:8001/embed"
            payload = json.dumps({"texts": texts}).encode("utf-8")
            req = urllib.request.Request(
                url, 
                data=payload, 
                headers={"Content-Type": "application/json"},
                method="POST"
            )
            
            try:
                with urllib.request.urlopen(req, timeout=3) as response:
                    res_data = json.loads(response.read().decode("utf-8"))
                    return res_data["embeddings"]
            except Exception as e:
                # Do not load heavy PyTorch model in-process on cloud to avoid 512MB RAM OOM crash
                print(f"[EmbeddingManager] Local embedding microservice unreachable. Using lightweight fallback retrieval.")
                return [[0.0] * self.embedding_dim for _ in texts]
            
        elif self.provider == "gemini":
            embeddings = []
            batch_size = 100
            for i in range(0, len(texts), batch_size):
                batch_texts = texts[i:i + batch_size]
                retries = 2
                success = False
                while retries > 0:
                    try:
                        response = self.gemini_client.models.embed_content(
                            model="text-embedding-004",
                            contents=batch_texts
                        )
                        for emb in response.embeddings:
                            embeddings.append(emb.values)
                        success = True
                        break
                    except Exception as e:
                        print(f"Gemini embedding API failed: {e}. Retrying...")
                        retries -= 1
                        time.sleep(1)
                if not success:
                    print("Gemini embedding calls failed. Switching to offline mode for this batch.")
                    return [[0.0] * self.embedding_dim for _ in batch_texts]
            return embeddings
            
        return [[0.0] * self.embedding_dim for _ in texts]

    def get_dim(self) -> int:
        """Returns the embedding dimensions."""
        return self.embedding_dim

if __name__ == "__main__":
    manager = EmbeddingManager()
    test_text = "Two Sum is an easy LeetCode problem."
    emb = manager.get_embedding(test_text)
    print(f"Success! Generated embedding of length: {len(emb)}")
