import sys
from pathlib import Path
import json
from typing import List, Dict, Any, Optional

sys.path.append(str(Path(__file__).resolve().parent.parent))
from configs import config
from embeddings.embed_data import EmbeddingManager
from vectorstore.chroma_manager import ChromaManager
from rag.query_parser import QueryParameters, QueryParser

class LeetCodeRetriever:
    def __init__(self, embedding_manager: EmbeddingManager, chroma_manager: ChromaManager):
        self.embedder = embedding_manager
        self.db = chroma_manager
        self.query_parser = QueryParser()
        
        # Build a case-insensitive company name mapping from raw folders
        self.company_map = {}
        try:
            from configs import config
            data_dir = config.DATA_DIR
            if data_dir.exists():
                for item in data_dir.iterdir():
                    if item.is_dir() and not item.name.startswith("."):
                        self.company_map[item.name.lower()] = item.name
        except Exception as e:
            print(f"[Retriever] Error building company map: {e}")

    def is_dsa_problem(self, title: str, slug: str, topics: List[str]) -> bool:
        """Helper to determine if a problem is a classic DSA question (excluding SQL, Pandas, JS syntax)."""
        title_lower = title.lower()
        slug_lower = slug.lower()
        topics_lower = [t.lower().strip() for t in topics]
        
        # 1. Non-DSA Topics
        non_dsa_topics = {"database", "shell", "concurrency"}
        if any(t in non_dsa_topics for t in topics_lower):
            return False
            
        # 2. Non-DSA Slug Keywords
        if "dataframe" in slug_lower or "pandas" in slug_lower:
            return False
        if "javascript" in slug_lower or "prototype" in slug_lower or "hello-world" in slug_lower:
            return False
            
        # 3. Check for SQL database questions that might not be tagged
        sql_keywords = {"salary", "department", "employee", "customer", "orders", "invoice", "product-table", "reformat-department"}
        if any(k in slug_lower for k in sql_keywords) and ("table" in slug_lower or "salary" in slug_lower or "employee" in slug_lower):
            return False
            
        return True

    def retrieve_offline(self, parsed_params: QueryParameters, limit: int, wants_non_dsa: bool = False) -> Dict[str, Any]:
        """Performs a direct keyword/metadata search on the cleaned JSON file without vector store or internet."""
        # Map company case-insensitively to database value
        if parsed_params.company:
            comp_lower = parsed_params.company.lower()
            if comp_lower in self.company_map:
                parsed_params.company = self.company_map[comp_lower]
                
        print("[Retriever] Performing offline JSON keyword search fallback...")
        cleaned_file = config.PROCESSED_DATA_DIR / "cleaned_problems.json"
        
        if not cleaned_file.exists():
            print(f"[Retriever] Offline Error: Cleaned problems file not found at {cleaned_file}")
            return {"results": [], "total_count": 0, "difficulty_breakdown": {}, "topic_breakdown": {}}
            
        try:
            with open(cleaned_file, "r", encoding="utf-8") as f:
                problems = json.load(f)
        except Exception as e:
            print(f"[Retriever] Error loading JSON file offline: {e}")
            return {"results": [], "total_count": 0, "difficulty_breakdown": {}, "topic_breakdown": {}}
            
        filtered_results = []
        
        # Extract filters
        target_company = parsed_params.company.lower() if parsed_params.company else None
        target_difficulty = parsed_params.difficulty.lower() if parsed_params.difficulty else None
        target_topic = parsed_params.topic.lower() if parsed_params.topic else None
        target_timeframe = parsed_params.timeframe
        
        valid_timeframes = [target_timeframe] if target_timeframe else []
        if target_timeframe == "3 months":
            valid_timeframes = ["30 days", "3 months"]
        elif target_timeframe == "6 months":
            valid_timeframes = ["30 days", "3 months", "6 months"]
        
        query_words = [w.lower() for w in parsed_params.semantic_query.split() if len(w) > 2]
        
        for p in problems:
            # 1. Filter by Company
            if target_company and p.get("company", "").lower() != target_company:
                continue
                
            # 2. Filter by Difficulty
            if target_difficulty and p.get("difficulty", "").lower() != target_difficulty:
                continue
                
            # 3. Filter by Topic
            topics_list = [t.lower() for t in p.get("topics", [])]
            topic_match = False
            if target_topic:
                for t in topics_list:
                    if target_topic in t or t in target_topic:
                        topic_match = True
                        break
                if not topic_match:
                    continue
            
            # Exclude non-DSA if wants_non_dsa is False
            if not wants_non_dsa and not self.is_dsa_problem(p.get("title", ""), p.get("slug", ""), p.get("topics", [])):
                continue
                
            # Exclude by timeframe if specified
            if target_timeframe:
                p_timeframe = p.get("timeframe", "6+ months")
                if p_timeframe not in valid_timeframes:
                    continue
                    
            # 4. Rank by Keyword Similarity + Frequency
            title_lower = p.get("title", "").lower()
            keyword_score = 0.0
            if query_words:
                matches = sum(1 for w in query_words if w in title_lower)
                keyword_score = matches / len(query_words)
                
            frequency = float(p.get("frequency", 0.0))
            freq_boost = (frequency / 100.0) * 0.5
            topic_boost = 0.2 if (target_topic and topic_match) else 0.0
            
            total_score = keyword_score + freq_boost + topic_boost
            
            topics_str = ", ".join(p.get("topics", []))
            link = p.get("link", "")
            timeframe_val = p.get("timeframe", "6+ months")
            
            doc_text = (
                f"Company: {p.get('company')}\n"
                f"Question: {p.get('title')}\n"
                f"Difficulty: {p.get('difficulty')}\n"
                f"Timeframe: {timeframe_val}\n"
                f"Topics: {topics_str}\n"
                f"Link: {link}"
            )
            
            filtered_results.append({
                "id": f"{p.get('company').lower()}_{p.get('slug')}",
                "title": p.get("title"),
                "company": p.get("company"),
                "difficulty": p.get("difficulty"),
                "frequency": frequency,
                "acceptance_rate": p.get("acceptance_rate", 0.0),
                "timeframe": timeframe_val,
                "topics": topics_str,
                "link": link,
                "document": doc_text,
                "score": total_score
            })
            
        # Compute total matching count and breakdown
        total_matching_count = len(filtered_results)
        diff_counts = {}
        topic_counts = {}
        for r in filtered_results:
            d = r.get("difficulty", "Medium")
            diff_counts[d] = diff_counts.get(d, 0) + 1
            t_list = [t.strip() for t in r.get("topics", "").split(",") if t.strip()]
            for t in t_list:
                topic_counts[t] = topic_counts.get(t, 0) + 1

        # Sort by requested metric or by score descending
        if parsed_params.sort_by == "frequency":
            filtered_results.sort(key=lambda x: x["frequency"], reverse=True)
        elif parsed_params.sort_by == "acceptance_rate":
            filtered_results.sort(key=lambda x: x["acceptance_rate"], reverse=True)
        else:
            filtered_results.sort(key=lambda x: x["score"], reverse=True)
            
        effective_limit = total_matching_count if (parsed_params.wants_all or limit >= 100) else min(limit, total_matching_count)
        return {
            "results": filtered_results[:effective_limit],
            "total_count": total_matching_count,
            "difficulty_breakdown": diff_counts,
            "topic_breakdown": topic_counts
        }

    def extract_custom_list_from_history(self, chat_history: Optional[List[Dict[str, str]]]) -> List[Dict[str, Any]]:
        """Scans conversation history for user-provided custom problem lists or tier roadmaps."""
        if not chat_history:
            return []
            
        import re
        if not hasattr(self, "_title_map"):
            self._title_map = {}
            cleaned_file = config.PROCESSED_DATA_DIR / "cleaned_problems.json"
            if cleaned_file.exists():
                try:
                    with open(cleaned_file, "r", encoding="utf-8") as f:
                        for p in json.load(f):
                            t_clean = p.get('title', '').lower().replace(' ', '').replace('-', '')
                            if t_clean and t_clean not in self._title_map:
                                self._title_map[t_clean] = p
                except Exception as e:
                    print(f"[Retriever] Warning: Could not load title_map for custom lists: {e}")

        for msg in reversed(chat_history):
            content = msg.get('content', '')
            role = msg.get('role', '')
            if not content or role != 'user':
                continue
                
            current_tier = 'General'
            found_in_msg = []
            for line in content.splitlines():
                line_str = line.strip()
                if not line_str: continue
                tier_m = re.search(r'(Tier\s*\d+)', line_str, re.IGNORECASE)
                if tier_m:
                    current_tier = tier_m.group(1).title()
                    continue
                m = re.match(r'^(?:LC\s*#?|#)?(\d+)[\t\s\.\,\-]+(.+)$', line_str, re.IGNORECASE)
                if m and m.group(2).strip().lower() != 'problem':
                    raw_title = m.group(2).strip()
                    t_key = raw_title.lower().replace(' ', '').replace('-', '')
                    db_match = self._title_map.get(t_key)
                    slug = raw_title.lower().replace(' ', '-')
                    item = {
                        'lc_num': int(m.group(1)),
                        'title': db_match['title'] if db_match else raw_title,
                        'tier': current_tier,
                        'company': db_match.get('company', 'LeetCode') if db_match else 'LeetCode',
                        'difficulty': db_match.get('difficulty', 'Medium') if db_match else 'Medium',
                        'frequency': db_match.get('frequency', 50.0) if db_match else 50.0,
                        'acceptance_rate': db_match.get('acceptance_rate', 0.5) if db_match else 0.5,
                        'topics': ",".join(db_match.get('topics', [])) if db_match and isinstance(db_match.get('topics'), list) else (db_match.get('topics', '') if db_match else ''),
                        'link': db_match.get('link', f'https://leetcode.com/problems/{slug}') if db_match else f'https://leetcode.com/problems/{slug}'
                    }
                    found_in_msg.append(item)
            if len(found_in_msg) >= 3:
                return found_in_msg
        return []

    def retrieve_with_meta(self, query: str, limit: Optional[int] = None, history: Optional[List[Dict[str, str]]] = None) -> Dict[str, Any]:
        """Parses query with history and returns retrieved matching problems + total dataset metadata."""
        is_offline = self.embedder.is_offline
        
        parsed_params = None
        if not is_offline:
            try:
                parsed_params = self.query_parser.parse_query(query, chat_history=history)
            except Exception as e:
                print(f"[Retriever] Query parser API failed: {e}. Falling back to regex parser.")
                is_offline = True

        if not parsed_params:
            parsed_params = self._fallback_parse_query(query, history=history)
            
        if parsed_params.company:
            comp_lower = parsed_params.company.lower()
            if comp_lower in self.company_map:
                parsed_params.company = self.company_map[comp_lower]
                
        search_limit = limit if limit is not None else parsed_params.limit
        if parsed_params.wants_all:
            search_limit = 250
            
        q_lower = query.lower()
        wants_non_dsa = any(w in q_lower for w in ["sql", "database", "pandas", "dataframe", "javascript", "js", "db", "shell", "concurrency"])

        # Check if conversation history has a custom problem list stored
        custom_list = self.extract_custom_list_from_history(history)
        if custom_list and (parsed_params.batch_count or "solution" in q_lower or "algo" in q_lower or "one by one" in q_lower or "explain" in q_lower or "next" in q_lower or "give" in q_lower):
            import re
            start_idx = parsed_params.batch_start_index or 1
            if "next" in q_lower and not parsed_params.batch_start_index:
                last_end = 0
                if history:
                    for m in reversed(history):
                        if m.get("role") == "assistant":
                            content_text = m.get("content", "")
                            match_range = re.search(r'(?:items?|problems?|questions?)\s+\d+\s+to\s+(\d+)', content_text, re.IGNORECASE)
                            if match_range:
                                last_end = int(match_range.group(1))
                                break
                            lc_matches = re.findall(r'LC\s*#\d+', content_text)
                            if lc_matches:
                                last_end = len(lc_matches)
                                break
                start_idx = max(1, last_end + 1)

            count = parsed_params.batch_count or 10
            end_idx = start_idx - 1 + count
            sliced_items = custom_list[start_idx - 1 : end_idx]
            
            diff_counts = {}
            topic_counts = {}
            for r in sliced_items:
                d = r.get("difficulty", "Medium")
                diff_counts[d] = diff_counts.get(d, 0) + 1
                t_list = [t.strip() for t in r.get("topics", "").split(",") if t.strip()]
                for t in t_list:
                    topic_counts[t] = topic_counts.get(t, 0) + 1

            print(f"[Retriever] Custom memory list active: serving items {start_idx} to {start_idx - 1 + len(sliced_items)} of {len(custom_list)}.")
            return {
                "results": sliced_items,
                "total_count": len(custom_list),
                "parsed_params": parsed_params,
                "difficulty_breakdown": diff_counts,
                "topic_breakdown": topic_counts,
                "is_custom_batch": True,
                "batch_start": start_idx,
                "batch_end": start_idx - 1 + len(sliced_items)
            }
        
        db_count = 0
        try:
            if self.db and self.db.collection:
                db_count = self.db.collection.count()
        except Exception:
            db_count = 0

        if is_offline or db_count == 0:
            res_meta = self.retrieve_offline(parsed_params, search_limit, wants_non_dsa=wants_non_dsa)
            res_meta["parsed_params"] = parsed_params
            return res_meta

        print(f"\n[Retriever] Parsed Query with Meta: {parsed_params}")
        
        filters = {}
        if parsed_params.company:
            filters["company"] = parsed_params.company
        if parsed_params.difficulty:
            diff_list = [d.strip().capitalize() for d in parsed_params.difficulty.split(",") if d.strip()]
            if len(diff_list) > 1:
                filters["difficulty"] = {"$in": diff_list}
            else:
                filters["difficulty"] = diff_list[0]

        target_timeframe = parsed_params.timeframe
        valid_timeframes = [target_timeframe] if target_timeframe else []
        if target_timeframe == "3 months":
            valid_timeframes = ["30 days", "3 months"]
        elif target_timeframe == "6 months":
            valid_timeframes = ["30 days", "3 months", "6 months"]
            
        if target_timeframe:
            filters["timeframe"] = {"$in": valid_timeframes}

        sq_clean = parsed_params.semantic_query.lower().strip()
        for noise in ["give me", "show me", "question", "questions", "leetcode", "problem", "problems", "numbers", "number", "top", "list", "of", "on", "for"]:
            sq_clean = sq_clean.replace(noise, "")
        sq_clean = sq_clean.strip()
        
        is_pure_structural = (
            parsed_params.sort_by in ["frequency", "acceptance_rate"] 
            and (sq_clean == "" or len(sq_clean) < 3)
        )
        
        # Always fetch broad candidate pool from DB to compute exact total_matching_count
        raw_records = self.db.get_all_records(filters=filters, limit=10000)
        processed_results = []
        target_topic = parsed_params.topic.lower() if parsed_params.topic else None
        
        for res in raw_records:
            metadata = res["metadata"]
            topics_str = metadata.get("topics", "")
            topics_list = [t.strip().lower() for t in topics_str.split(",") if t.strip()]
            frequency = float(metadata.get("frequency", 0.0))
            
            if target_topic:
                topic_match = False
                for t in topics_list:
                    if target_topic in t or t in target_topic:
                        topic_match = True
                        break
                if not topic_match:
                    continue
            
            if not wants_non_dsa and not self.is_dsa_problem(metadata.get("title", ""), metadata.get("slug", ""), topics_list):
                continue
                
            if parsed_params.difficulty:
                diff_list = [d.strip().lower() for d in parsed_params.difficulty.split(",") if d.strip()]
                if metadata.get("difficulty", "").lower() not in diff_list:
                    continue
                
            if target_timeframe:
                p_timeframe = metadata.get("timeframe", "6+ months")
                if p_timeframe not in valid_timeframes:
                    continue
                    
            processed_results.append({
                "id": res["id"],
                "title": metadata.get("title", "Unknown"),
                "company": metadata.get("company", "Unknown"),
                "difficulty": metadata.get("difficulty", "Medium"),
                "frequency": frequency,
                "acceptance_rate": metadata.get("acceptance_rate", 0.0),
                "timeframe": metadata.get("timeframe", "6+ months"),
                "topics": topics_str,
                "link": metadata.get("link", ""),
                "document": res.get("document", ""),
                "score": frequency if parsed_params.sort_by == "frequency" else metadata.get("acceptance_rate", 0.0)
            })
        
        total_matching_count = len(processed_results)
        diff_counts = {}
        topic_counts = {}
        for r in processed_results:
            d = r.get("difficulty", "Medium")
            diff_counts[d] = diff_counts.get(d, 0) + 1
            t_list = [t.strip() for t in r.get("topics", "").split(",") if t.strip()]
            for t in t_list:
                topic_counts[t] = topic_counts.get(t, 0) + 1

        if parsed_params.sort_by == "frequency":
            processed_results.sort(key=lambda x: x["frequency"], reverse=True)
        elif parsed_params.sort_by == "acceptance_rate":
            processed_results.sort(key=lambda x: x["acceptance_rate"], reverse=True)
        else:
            processed_results.sort(key=lambda x: x["score"], reverse=True)
            
        effective_limit = total_matching_count if parsed_params.wants_all else min(search_limit, total_matching_count)
        final_results = processed_results[:effective_limit]
        
        print(f"[Retriever] Total matching: {total_matching_count}, returning top {len(final_results)}.")
        return {
            "results": final_results,
            "total_count": total_matching_count,
            "parsed_params": parsed_params,
            "difficulty_breakdown": diff_counts,
            "topic_breakdown": topic_counts
        }
        custom_list = self.extract_custom_list_from_history(history)
        q_lower = query.lower()
        if custom_list and (parsed_params.batch_count or "solution" in q_lower or "algo" in q_lower or "one by one" in q_lower or "explain" in q_lower or "next" in q_lower or "give" in q_lower):
            import re
            start_idx = parsed_params.batch_start_index or 1
            if "next" in q_lower and not parsed_params.batch_start_index:
                prev_count = 0
                if history:
                    for m in history:
                        if m.get("role") == "assistant":
                            matches = re.findall(r'LC\s*#\d+', m.get("content", ""))
                            prev_count += len(matches)
                start_idx = max(1, prev_count + 1)

            count = parsed_params.batch_count or 10
            end_idx = start_idx - 1 + count
            sliced_items = custom_list[start_idx - 1 : end_idx]
            
            diff_counts = {}
            topic_counts = {}
            for r in sliced_items:
                d = r.get("difficulty", "Medium")
                diff_counts[d] = diff_counts.get(d, 0) + 1
                t_list = [t.strip() for t in r.get("topics", "").split(",") if t.strip()]
                for t in t_list:
                    topic_counts[t] = topic_counts.get(t, 0) + 1

            print(f"[Retriever] Custom memory list active: serving items {start_idx} to {start_idx - 1 + len(sliced_items)} of {len(custom_list)}.")
            return {
                "results": sliced_items,
                "total_count": len(custom_list),
                "parsed_params": parsed_params,
                "difficulty_breakdown": diff_counts,
                "topic_breakdown": topic_counts,
                "is_custom_batch": True,
                "batch_start": start_idx,
                "batch_end": start_idx - 1 + len(sliced_items)
            }

    def _fallback_parse_query(self, query: str, history: Optional[List[Dict[str, str]]] = None) -> QueryParameters:
        """Lightweight offline regex parser to extract filters without calling LLM."""
        import re
        q_lower = query.lower()
        
        # Clean dataset/storage location phrases so "in database" does NOT trigger topic="Database"
        clean_q = re.sub(r'\b(in|from|the|ur|your|main)\s+(database|dataset|db|system|collection)\b', '', q_lower)
        clean_q = clean_q.strip()

        company = None
        difficulty = None
        topic = None
        timeframe = None
        
        # Check against company map dynamically
        for comp_name in self.company_map.values():
            if comp_name.lower() in clean_q:
                company = comp_name
                break

        # If company missing, inherit company from recent history
        if not company and history:
            for msg in reversed(history[-6:]):
                content_lower = msg.get("content", "").lower()
                for comp_name in self.company_map.values():
                    if comp_name.lower() in content_lower:
                        company = comp_name
                        break
                if company:
                    break
                
        # Parse difficulties
        found_diffs = []
        if "easy" in clean_q: found_diffs.append("Easy")
        if "medium" in clean_q: found_diffs.append("Medium")
        if "hard" in clean_q: found_diffs.append("Hard")
        
        if len(found_diffs) > 0 and len(found_diffs) < 3:
            difficulty = ",".join(found_diffs)
        else:
            difficulty = None
            
        # Expanded topics map
        topics_map = {
            "backtracking": "Backtracking",
            "graph": "Graph",
            "dynamic programming": "Dynamic Programming",
            "dp": "Dynamic Programming",
            "array": "Array",
            "string": "String",
            "tree": "Tree",
            "binary tree": "Tree",
            "hash table": "Hash Table",
            "hashmap": "Hash Table",
            "binary search": "Binary Search",
            "sliding window": "Sliding Window",
            "two pointers": "Two Pointers",
            "stack": "Stack",
            "recursion": "Recursion",
            "linked list": "Linked List",
            "bit manipulation": "Bit Manipulation",
            "trie": "Trie",
            "matrix": "Matrix",
            "heap": "Heap (Priority Queue)",
            "priority queue": "Heap (Priority Queue)",
            "greedy": "Greedy"
        }
        for k, v in topics_map.items():
            if k in clean_q:
                topic = v
                break
                
        # Extract timeframe
        if "30 days" in clean_q or "last month" in clean_q:
            timeframe = "30 days"
        elif "3 months" in clean_q or "recent" in clean_q or "recently" in clean_q:
            timeframe = "3 months"
        elif "6 months" in clean_q:
            timeframe = "6 months"
            
        # Detect wants_all and is_count_query
        wants_all = any(w in clean_q for w in ["retrieve all", "show all", "all questions", "all of them", "everything", "all in database", "all problems", "get all", "all"])
        is_count_query = any(w in clean_q for w in ["how many", "total count", "count of", "number of questions", "how many questions", "how many problems"])

        limit = 250 if wants_all else 10
        limit_match = re.search(r'\b(top|get|show)\s+(\d+)\b', clean_q)
        if limit_match and not wants_all:
            limit = int(limit_match.group(2))
            
        sort_by = None
        if any(w in clean_q for w in ["top", "popular", "most frequent", "frequent", "frequency"]):
            sort_by = "frequency"
        elif any(w in clean_q for w in ["acceptance", "easiest"]):
            sort_by = "acceptance_rate"
            
        return QueryParameters(
            company=company,
            difficulty=difficulty,
            topic=topic,
            semantic_query=query,
            limit=limit,
            sort_by=sort_by,
            timeframe=timeframe,
            is_count_query=is_count_query,
            wants_all=wants_all
        )

if __name__ == "__main__":
    emb_mgr = EmbeddingManager()
    chroma_mgr = ChromaManager()
    retriever = LeetCodeRetriever(emb_mgr, chroma_mgr)
    test_results = retriever.retrieve("Google Hard Graph questions")
    for r in test_results:
        print(f"- {r['company']} | {r['title']} ({r['difficulty']})")


if __name__ == "__main__":
    emb_mgr = EmbeddingManager()
    chroma_mgr = ChromaManager()
    retriever = LeetCodeRetriever(emb_mgr, chroma_mgr)
    test_results = retriever.retrieve("Google Hard Graph questions")
    for r in test_results:
        print(f"- {r['company']} | {r['title']} ({r['difficulty']})")
