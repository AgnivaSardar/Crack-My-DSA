import json
from pathlib import Path
import sys

sys.path.append(str(Path(__file__).resolve().parent.parent))
from configs import config

def build_enriched_chunk(record: dict) -> str:
    """Builds a rich, text-heavy description of a company-problem association.
    More context and descriptive phrasing helps vector search find matches.
    """
    company = record.get("company", "Unknown")
    title = record.get("title", "Unknown")
    difficulty = record.get("difficulty", "Medium")
    frequency = record.get("frequency", 0.0)
    acc_rate = record.get("acceptance_rate", 0.0)
    timeframe = record.get("timeframe", "6+ months")
    topics_list = record.get("topics", [])
    topics_str = ", ".join(topics_list) if topics_list else "General DSA"
    link = record.get("link", "")

    # Formatting acceptance rate nicely if it looks like a small ratio
    if 0.0 < acc_rate <= 1.0:
        acc_pct = f"{acc_rate * 100:.2f}%"
    else:
        acc_pct = f"{acc_rate:.2f}%"

    timeframe_desc = {
        "30 days": "in the last 30 days (extremely recent trend)",
        "3 months": "in the last 3 months (very recent)",
        "6 months": "in the last 6 months (recent)",
        "6+ months": "more than 6 months ago"
    }.get(timeframe, "recently")

    chunk_text = (
        f"Company: {company}\n"
        f"Question: {title}\n"
        f"Difficulty: {difficulty}\n"
        f"Frequency: {frequency:.1f}\n"
        f"Timeframe: {timeframe}\n"
        f"Acceptance Rate: {acc_pct}\n"
        f"Topics: {topics_str}\n"
        f"Link: {link}\n\n"
        f"Description:\n"
        f"This coding problem '{title}' is frequently asked in technical interviews at {company}. "
        f"This question was reported as asked {timeframe_desc}. "
        f"The problem is classified as {difficulty} difficulty. It covers the following concepts and DSA topics: {topics_str}. "
        f"Candidates preparing for {company} should practice this question to master {topics_str} patterns."
    )
    return chunk_text

def build_metadata(record: dict) -> dict:
    """Creates a flat metadata dictionary for ChromaDB filtering."""
    topics_list = record.get("topics", [])
    return {
        "company": record.get("company", "Unknown"),
        "slug": record.get("slug", ""),
        "title": record.get("title", "Unknown"),
        "difficulty": record.get("difficulty", "Medium"),
        "frequency": float(record.get("frequency", 0.0)),
        "acceptance_rate": float(record.get("acceptance_rate", 0.0)),
        "timeframe": record.get("timeframe", "6+ months"),
        "topics": ", ".join(topics_list) if topics_list else "",
        "link": record.get("link", "")
    }

def process_metadata_and_chunks() -> list:
    """Loads cleaned problems and creates structured chunks and metadata."""
    input_path = config.PROCESSED_DATA_DIR / "cleaned_problems.json"
    if not input_path.exists():
        print(f"Error: Cleaned data file '{input_path}' not found. Run clean_data.py first.")
        return []

    with open(input_path, "r", encoding="utf-8") as f:
        problems = json.load(f)

    processed_chunks = []
    for item in problems:
        chunk_text = build_enriched_chunk(item)
        metadata = build_metadata(item)
        
        processed_chunks.append({
            "chunk_text": chunk_text,
            "metadata": metadata,
            "id": f"{metadata['company'].lower()}_{metadata['slug']}"
        })

    output_path = config.PROCESSED_DATA_DIR / "chunks_and_metadata.json"
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(processed_chunks, f, indent=2, ensure_ascii=False)

    print(f"Created {len(processed_chunks)} enriched chunks and metadata structures.")
    print(f"Saved to: {output_path}")
    return processed_chunks

if __name__ == "__main__":
    process_metadata_and_chunks()
