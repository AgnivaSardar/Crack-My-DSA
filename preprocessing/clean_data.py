import os
import re
import pandas as pd
import json
from pathlib import Path
import sys

# Add parent dir to path so we can import configs
sys.path.append(str(Path(__file__).resolve().parent.parent))
from configs import config

def extract_slug(link: str, title: str) -> str:
    """Extracts a unique, normalized slug for a question from its URL or title."""
    if not isinstance(link, str):
        link = ""
    link = link.strip().lower()
    
    # Try to extract from leetcode URL (e.g., https://leetcode.com/problems/two-sum)
    match = re.search(r'leetcode\.com/problems/([^/]+)', link)
    if match:
        return match.group(1).strip()
    
    # Fallback to normalizing the title
    if not isinstance(title, str):
        title = "unknown-question"
    clean_title = re.sub(r'[^a-zA-Z0-9\s-]', '', title).strip().lower()
    return re.sub(r'[\s_]+', '-', clean_title)

def slug_to_title(slug: str) -> str:
    """Converts a slug (e.g. 'two-sum') back into a clean title ('Two Sum')."""
    words = slug.split('-')
    return " ".join(w.capitalize() for w in words if w)

def clean_difficulty(diff: str) -> str:
    """Normalizes difficulty strings to Easy, Medium, or Hard."""
    if not isinstance(diff, str):
        return "Medium"
    diff_lower = diff.strip().lower()
    if "easy" in diff_lower:
        return "Easy"
    elif "hard" in diff_lower:
        return "Hard"
    else:
        return "Medium"

def clean_topics(topics_str: str) -> list:
    """Normalizes topics to a list of clean strings."""
    if not isinstance(topics_str, str) or pd.isna(topics_str):
        return []
    # Split by comma and strip whitespace
    topics = [t.strip() for t in topics_str.split(",") if t.strip()]
    return topics

def get_companies_list() -> list:
    """Scans raw data directory to find all companies and ranks them by problem count."""
    data_dir = config.DATA_DIR
    if not data_dir.exists():
        print(f"Error: Data directory '{data_dir}' does not exist.")
        return []
    
    company_counts = []
    
    # Each subfolder in data_dir represents a company
    for item in data_dir.iterdir():
        if item.is_dir() and not item.name.startswith("."):
            # Check for All.csv file
            csv_files = [item / "5. All.csv", item / "All.csv"]
            csv_path = None
            for p in csv_files:
                if p.exists():
                    csv_path = p
                    break
            
            if csv_path:
                try:
                    # Quick row count estimate without loading whole file
                    with open(csv_path, 'r', encoding='utf-8', errors='ignore') as f:
                        row_count = sum(1 for _ in f) - 1 # exclude header
                    company_counts.append({
                        "company": item.name,
                        "path": csv_path,
                        "problem_count": row_count
                    })
                except Exception as e:
                    print(f"Error counting rows in {csv_path}: {e}")
    
    # Sort companies by problem count descending (a proxy for company popularity/size)
    company_counts.sort(key=lambda x: x["problem_count"], reverse=True)
    return company_counts

def clean_all_csvs() -> list:
    """Reads all company CSVs, cleans rows, filters by config, and aggregates them."""
    companies = get_companies_list()
    if not companies:
        print("No company data found to clean.")
        return []
    
    total_companies = len(companies)
    print(f"Found {total_companies} companies with data.")
    
    # Apply filtering limits
    if config.TOP_COMPANIES_ONLY:
        limit = config.LIMIT_COMPANIES_COUNT
        companies = companies[:limit]
        print(f"Limiting ingestion to Top {limit} companies by problem count.")
    
    all_records = []
    
    for idx, comp_info in enumerate(companies):
        comp_name = comp_info["company"]
        csv_path = comp_info["path"]
        print(f"[{idx+1}/{len(companies)}] Cleaning data for {comp_name} ({comp_info['problem_count']} rows)...")
        
        try:
            # Load other CSVs to identify timeframe
            comp_dir = csv_path.parent
            
            def load_slugs(filename: str) -> set:
                file_path = comp_dir / filename
                if not file_path.exists():
                    return set()
                try:
                    temp_df = pd.read_csv(file_path)
                    temp_df.columns = [c.strip() for c in temp_df.columns]
                    slugs = set()
                    for _, r in temp_df.iterrows():
                        l = r.get("Link", "")
                        t = r.get("Title", "")
                        if (isinstance(l, str) and l.strip()) or (isinstance(t, str) and t.strip()):
                            slugs.add(extract_slug(l, str(t)))
                    return slugs
                except Exception:
                    return set()

            slugs_30_days = load_slugs("1. Thirty Days.csv")
            slugs_3_months = load_slugs("2. Three Months.csv")
            slugs_6_months = load_slugs("3. Six Months.csv")

            # Load CSV
            df = pd.read_csv(csv_path)
            
            # Map column names to lowercase/standard format
            # Expected columns: Difficulty, Title, Frequency, Acceptance Rate, Link, Topics
            df.columns = [c.strip() for c in df.columns]
            
            # Clean and normalize each row
            for _, row in df.iterrows():
                title = row.get("Title", "")
                link = row.get("Link", "")
                if pd.isna(title) or not isinstance(title, str) or not title.strip():
                    if pd.isna(link) or not isinstance(link, str) or not link.strip():
                        continue  # Skip row if both title and link are missing
                
                slug = extract_slug(link, str(title))
                norm_title = slug_to_title(slug)
                
                difficulty = clean_difficulty(row.get("Difficulty", "Medium"))
                
                # Normalize Frequency to float
                raw_freq = row.get("Frequency", 0.0)
                try:
                    frequency = float(raw_freq) if not pd.isna(raw_freq) else 0.0
                except (ValueError, TypeError):
                    frequency = 0.0
                
                # Normalize Acceptance Rate
                raw_acc = row.get("Acceptance Rate", 0.0)
                try:
                    acceptance_rate = float(raw_acc) if not pd.isna(raw_acc) else 0.0
                except (ValueError, TypeError):
                    acceptance_rate = 0.0
                
                topics = clean_topics(row.get("Topics", ""))
                
                # Identify timeframe
                if slug in slugs_30_days:
                    timeframe = "30 days"
                elif slug in slugs_3_months:
                    timeframe = "3 months"
                elif slug in slugs_6_months:
                    timeframe = "6 months"
                else:
                    timeframe = "6+ months"
                
                record = {
                    "company": comp_name,
                    "slug": slug,
                    "title": norm_title,
                    "difficulty": difficulty,
                    "frequency": frequency,
                    "acceptance_rate": acceptance_rate,
                    "timeframe": timeframe,
                    "topics": topics,
                    "link": link if isinstance(link, str) else ""
                }
                
                all_records.append(record)
                
        except Exception as e:
            print(f"Error processing CSV for {comp_name}: {e}")
            
    print(f"Cleaned {len(all_records)} total company-problem associations.")
    
    # Save the consolidated records
    output_path = config.PROCESSED_DATA_DIR / "cleaned_problems.json"
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(all_records, f, indent=2, ensure_ascii=False)
        
    print(f"Saved aggregated clean data to: {output_path}")
    return all_records

if __name__ == "__main__":
    clean_all_csvs()
