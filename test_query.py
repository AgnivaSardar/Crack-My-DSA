import sys
from pathlib import Path

# Add project root to path
sys.path.append(str(Path(__file__).resolve().parent))

from embeddings.embed_data import EmbeddingManager
from vectorstore.chroma_manager import ChromaManager
from rag.retriever import LeetCodeRetriever
from rag.generator import LeetCodeGenerator

def main():
    print("=========================================")
    print("       Testing User's Query Live         ")
    print("=========================================")
    
    emb_mgr = EmbeddingManager()
    chroma_mgr = ChromaManager()
    retriever = LeetCodeRetriever(emb_mgr, chroma_mgr)
    generator = LeetCodeGenerator()
    
    query = "Give me recursion questions on leetcode problem numbers for google company"
    
    print(f"Query: '{query}'")
    
    # 1. Retrieve
    results = retriever.retrieve(query, limit=5)
    print("\n--- Retrieved Problems ---")
    for idx, r in enumerate(results):
        print(f"  {idx+1}. {r['company']} | {r['title']} ({r['difficulty']}) | Topics: {r['topics']}")
        
    # 2. Generate
    if results:
        print("\n--- Calling Gemini for Live Explanation & Solutions ---")
        response = generator.generate_response(query, results)
        print(response)
    else:
        print("\nNo results found. Double check database records.")

if __name__ == "__main__":
    main()
