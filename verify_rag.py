import sys
from pathlib import Path
import json

# Add project root to python path
sys.path.append(str(Path(__file__).resolve().parent))

from configs import config

def test_data_cleaning():
    print("\n--- Testing Data Cleaning ---")
    from preprocessing.clean_data import get_companies_list, clean_all_csvs
    
    companies = get_companies_list()
    print(f"Total companies found: {len(companies)}")
    if companies:
        print(f"Top 5 companies by size:")
        for idx, c in enumerate(companies[:5]):
            print(f"  {idx+1}. {c['company']} (Approx {c['problem_count']} problems)")
            
    # Try cleaning just the top 2 companies first to see if it works without hitting any exceptions
    print("\nSimulating data cleaning (will run in memory)...")
    try:
        from preprocessing.clean_data import extract_slug, slug_to_title, clean_difficulty, clean_topics
        # Test basic cleaning helper functions
        assert extract_slug("https://leetcode.com/problems/two-sum", "Two Sum") == "two-sum"
        assert slug_to_title("add-two-numbers") == "Add Two Numbers"
        assert clean_difficulty("MEDIUM") == "Medium"
        assert clean_topics("Array, Hash Table, Stack") == ["Array", "Hash Table", "Stack"]
        print("[PASS] Cleaning helper functions passed unit tests.")
    except Exception as e:
        print(f"[FAIL] Cleaning helper functions failed: {e}")
        return False
        
    return True

def test_embeddings_and_chroma():
    print("\n--- Testing Embeddings and ChromaDB connection ---")
    if not config.GEMINI_API_KEY:
        print("[FAIL] Error: GEMINI_API_KEY is not set. Cannot run embedding tests.")
        return False
        
    try:
        from embeddings.embed_data import EmbeddingManager
        from vectorstore.chroma_manager import ChromaManager
        
        print("Initializing Embedding Manager...")
        emb_mgr = EmbeddingManager()
        print(f"Embedding Manager initialized. Dimension: {emb_mgr.get_dim()}")
        
        test_text = "Verify ChromaDB connection and embedding generator."
        emb = emb_mgr.get_embedding(test_text)
        print(f"[PASS] Successfully generated vector embedding. Vector length: {len(emb)}")
        
        print("Connecting to ChromaDB...")
        chroma_mgr = ChromaManager()
        stats = chroma_mgr.get_stats()
        print(f"[PASS] ChromaDB connection established. Existing records count: {stats.get('total_records')}")
        
    except Exception as e:
        print(f"[FAIL] Embeddings or ChromaDB test failed: {e}")
        return False
        
    return True

def test_rag_pipeline():
    print("\n--- Testing RAG Retriever & Generator ---")
    if not config.GEMINI_API_KEY:
        print("[FAIL] Error: GEMINI_API_KEY is not set. Skipping RAG tests.")
        return False
        
    try:
        from embeddings.embed_data import EmbeddingManager
        from vectorstore.chroma_manager import ChromaManager
        from rag.retriever import LeetCodeRetriever
        from rag.generator import LeetCodeGenerator
        
        emb_mgr = EmbeddingManager()
        chroma_mgr = ChromaManager()
        retriever = LeetCodeRetriever(emb_mgr, chroma_mgr)
        generator = LeetCodeGenerator()
        
        query = "Google Graph questions"
        print(f"Testing retriever with query: '{query}'...")
        results = retriever.retrieve(query, limit=3)
        
        print(f"Retrieved {len(results)} items:")
        for idx, r in enumerate(results):
            print(f"  {idx+1}. {r['company']} | {r['title']} ({r['difficulty']})")
            
        if results:
            print("\nTesting generator response (calling LLM)...")
            response = generator.generate_response(query, results)
            print("--- LLM Output (first 300 chars) ---")
            print(response[:300] + "...")
            print("-------------------------------------")
            print("[PASS] RAG Pipeline test completed.")
        else:
            print("[WARN] DB is empty, skipping generator test. Run data ingestion first.")
            
    except Exception as e:
        print(f"[FAIL] RAG Pipeline test failed: {e}")
        return False
        
    return True

def main():
    print("=========================================")
    print("     CodePrep AI Verification Script     ")
    print("=========================================")
    
    clean_ok = test_data_cleaning()
    embed_ok = test_embeddings_and_chroma()
    
    if clean_ok and embed_ok:
        test_rag_pipeline()

if __name__ == "__main__":
    main()
