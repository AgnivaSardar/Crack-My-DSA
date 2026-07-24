import chromadb
from pathlib import Path
import sys
from typing import List, Dict, Any, Optional

sys.path.append(str(Path(__file__).resolve().parent.parent))
from configs import config

class ChromaManager:
    def __init__(self):
        self.db_path = config.CHROMA_DB_DIR
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        
        print(f"Connecting to persistent ChromaDB at: {self.db_path}")
        self.client = chromadb.PersistentClient(path=str(self.db_path))
        
        # Get or create the collection. Cosine similarity is good for text embeddings.
        self.collection = self.client.get_or_create_collection(
            name="leetcode_problems",
            metadata={"hnsw:space": "cosine"}
        )
        print("ChromaDB collection 'leetcode_problems' initialized.")

    def add_problems_batch(self, ids: List[str], embeddings: List[List[float]], metadatas: List[Dict[str, Any]], documents: List[str]):
        """Adds a batch of problem chunks to the collection."""
        if not ids:
            return
        
        print(f"Adding batch of {len(ids)} items to ChromaDB...")
        # ChromaDB allows bulk insert
        self.collection.add(
            ids=ids,
            embeddings=embeddings,
            metadatas=metadatas,
            documents=documents
        )
        print("Batch add complete.")

    def build_where_clause(self, filters: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Constructs a ChromaDB-compliant 'where' dictionary from simple key-value filters."""
        if not filters:
            return None
            
        clean_filters = {}
        for k, v in filters.items():
            if v is not None and v != "":
                clean_filters[k] = v
                
        if not clean_filters:
            return None
            
        # If there's only one filter, return it directly
        if len(clean_filters) == 1:
            k, v = list(clean_filters.items())[0]
            return {k: v}
            
        # For multiple filters, use $and operator
        conditions = [{k: v} for k, v in clean_filters.items()]
        return {"$and": conditions}

    def search(self, query_embedding: List[float], filters: Dict[str, Any] = None, limit: int = 10) -> List[Dict[str, Any]]:
        """Queries the vector database using embedding similarity and optional metadata filters."""
        where_clause = self.build_where_clause(filters) if filters else None
        
        # We fetch more results than the limit if we need to do topic post-filtering in the retriever
        fetch_limit = max(limit * 3, 50) 
        
        try:
            results = self.collection.query(
                query_embeddings=[query_embedding],
                n_results=fetch_limit,
                where=where_clause
            )
            
            # Format results into a list of dictionaries
            formatted_results = []
            if results and results["ids"] and len(results["ids"][0]) > 0:
                for idx in range(len(results["ids"][0])):
                    formatted_results.append({
                        "id": results["ids"][0][idx],
                        "document": results["documents"][0][idx],
                        "metadata": results["metadatas"][0][idx],
                        "distance": results["distances"][0][idx] if "distances" in results else 0.0
                    })
            return formatted_results
        except Exception as e:
            print(f"Error querying ChromaDB: {e}")
            return []

    def get_all_records(self, filters: Dict[str, Any] = None, limit: int = 100) -> List[Dict[str, Any]]:
        """Gets records from the collection using metadata filtering only (no vector search)."""
        where_clause = self.build_where_clause(filters) if filters else None
        
        try:
            results = self.collection.get(
                where=where_clause,
                limit=limit
            )
            
            formatted_results = []
            if results and results["ids"]:
                for idx in range(len(results["ids"])):
                    formatted_results.append({
                        "id": results["ids"][idx],
                        "document": results["documents"][idx] if results["documents"] else "",
                        "metadata": results["metadatas"][idx]
                    })
            return formatted_results
        except Exception as e:
            print(f"Error fetching from ChromaDB: {e}")
            return []

    def delete_collection(self):
        """Clears all data by deleting and recreating the collection."""
        try:
            self.client.delete_collection("leetcode_problems")
            self.collection = self.client.get_or_create_collection(
                name="leetcode_problems",
                metadata={"hnsw:space": "cosine"}
            )
            print("Collection 'leetcode_problems' has been reset.")
        except Exception as e:
            print(f"Error resetting collection: {e}")

    def get_stats(self) -> Dict[str, Any]:
        """Returns statistics about the vector store."""
        try:
            count = self.collection.count()
            # Sample a few records to see what we have
            samples = self.collection.get(limit=10)
            
            companies = set()
            difficulties = set()
            
            if samples and samples["metadatas"]:
                for meta in samples["metadatas"]:
                    if "company" in meta:
                        companies.add(meta["company"])
                    if "difficulty" in meta:
                        difficulties.add(meta["difficulty"])
                        
            return {
                "total_records": count,
                "sample_companies": list(companies),
                "sample_difficulties": list(difficulties)
            }
        except Exception as e:
            print(f"Error getting ChromaDB stats: {e}")
            return {"total_records": 0, "error": str(e)}

if __name__ == "__main__":
    db = ChromaManager()
    stats = db.get_stats()
    print(f"Vector Database Stats: {stats}")
