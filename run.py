import argparse
import sys
import os
import json
from pathlib import Path

# Add project root to python path
sys.path.append(str(Path(__file__).resolve().parent))

from configs import config
from preprocessing.clean_data import clean_all_csvs
from preprocessing.metadata_builder import process_metadata_and_chunks
from embeddings.embed_data import EmbeddingManager
from vectorstore.chroma_manager import ChromaManager

def run_ingestion():
    print("=========================================")
    print("       STARTING DATA INGESTION           ")
    print("=========================================")
    
    # Step 1: Clean CSVs
    print("\n--- Step 1: Cleaning Company CSVs ---")
    clean_all_csvs()
    
    # Step 2: Build chunks and metadata
    print("\n--- Step 2: Creating Chunks & Metadata ---")
    chunks = process_metadata_and_chunks()
    if not chunks:
        print("No chunks to embed. Ingestion aborted.")
        return
        
    # Step 3: Initialize Vector Database & Embeddings
    print("\n--- Step 3: Initializing Embeddings & ChromaDB ---")
    try:
        embedder = EmbeddingManager()
        db = ChromaManager()
    except Exception as e:
        print(f"Failed to initialize components: {e}")
        print("Please verify that your GEMINI_API_KEY is correctly set in the .env file.")
        return

    # Reset collection to avoid duplicate accumulation
    print("Resetting database collection to ensure fresh ingestion...")
    db.delete_collection()
    
    # Step 4: Generate Embeddings and Save to ChromaDB
    print("\n--- Step 4: Generating Embeddings & Storing in DB ---")
    
    batch_size = 256
    total_chunks = len(chunks)
    print(f"Total chunks to process: {total_chunks}")
    
    ids_batch = []
    texts_batch = []
    metadatas_batch = []
    
    for idx, item in enumerate(chunks):
        ids_batch.append(item["id"])
        texts_batch.append(item["chunk_text"])
        metadatas_batch.append(item["metadata"])
        
        # When batch is full or we are at the end, process it
        if len(ids_batch) == batch_size or idx == total_chunks - 1:
            current_batch_size = len(ids_batch)
            print(f"Embedding batch of {current_batch_size} (Progress: {idx+1}/{total_chunks})...")
            
            try:
                # Generate embeddings for the batch of texts
                embeddings_batch = embedder.get_embeddings(texts_batch)
                
                # Write to database
                db.add_problems_batch(
                    ids=ids_batch,
                    embeddings=embeddings_batch,
                    metadatas=metadatas_batch,
                    documents=texts_batch
                )
            except Exception as e:
                print(f"Error processing batch starting at index {idx - current_batch_size + 1}: {e}")
                print("Skipping this batch...")
                
            # Clear batch lists
            ids_batch = []
            texts_batch = []
            metadatas_batch = []
            
    print("\n=========================================")
    print("      INGESTION COMPLETED SUCCESSFULLY   ")
    print(f"      Total records stored: {db.collection.count()} ")
    print("=========================================")

def main():
    parser = argparse.ArgumentParser(description="CodePrep AI RAG Pipeline Controller")
    parser.add_argument("--ingest", action="store_true", help="Run the full data ingestion and embedding pipeline")
    parser.add_argument("--api", action="store_true", help="Run the FastAPI backend server")
    parser.add_argument("--frontend", action="store_true", help="Run the Streamlit frontend client")
    parser.add_argument("--embedding", action="store_true", help="Run the embedding microservice")
    
    args = parser.parse_args()
    
    if len(sys.argv) == 1:
        parser.print_help()
        sys.exit(1)
        
    if args.ingest:
        run_ingestion()
        
    if args.api:
        import uvicorn
        print("Starting FastAPI backend...")
        uvicorn.run("api.app:app", host="0.0.0.0", port=8000, reload=True)
        
    if args.frontend:
        import subprocess
        print("Starting React frontend (Vite) on http://localhost:5173 ...")
        react_path = Path("frontend_react")
        subprocess.run(["npm", "run", "dev"], cwd=str(react_path), shell=True)

    if args.embedding:
        import uvicorn
        print("Starting Embedding Service microservice...")
        uvicorn.run("services.embedding_service:app", host="0.0.0.0", port=8001, reload=True)

if __name__ == "__main__":
    main()
