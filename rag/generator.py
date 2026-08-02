import sys
from pathlib import Path
from typing import List, Dict, Any, Optional

sys.path.append(str(Path(__file__).resolve().parent.parent))
from llm.gemini_client import GeminiClient
from configs import config

# Standard problem cache for offline fallback
OFFLINE_PROBLEMS_DB = {
    "two-sum": {
        "strategy": "Use a Hash Map to store the value and its index. For each number, check if its complement (target - num) exists in the map.",
        "complexity": "Time: O(N) | Space: O(N)",
        "python": "def twoSum(nums: list[int], target: int) -> list[int]:\n    seen = {}\n    for i, num in enumerate(nums):\n        complement = target - num\n        if complement in seen:\n            return [seen[complement], i]\n        seen[num] = i\n    return []",
        "java": "public int[] twoSum(int[] nums, int target) {\n    Map<Integer, Integer> map = new HashMap<>();\n    for (int i = 0; i < nums.length; i++) {\n        int complement = target - nums[i];\n        if (map.containsKey(complement)) {\n            return new int[] { map.get(complement), i };\n        }\n        map.put(nums[i], i);\n    }\n    return new int[0];\n}",
        "cpp": "vector<int> twoSum(vector<int>& nums, int target) {\n    unordered_map<int, int> m;\n    for (int i = 0; i < nums.size(); ++i) {\n        int complement = target - nums[i];\n        if (m.count(complement)) {\n            return {m[complement], i};\n        }\n        m[nums[i]] = i;\n    }\n    return {};\n}"
    },
    "number-of-islands": {
        "strategy": "Traverse the grid. For each '1', increment the count and perform a DFS/BFS to turn all adjacent connected '1's (land) into '0's (water).",
        "complexity": "Time: O(M * N) | Space: O(M * N) (recursive stack)",
        "python": "def numIslands(grid: list[list[str]]) -> int:\n    if not grid: return 0\n    count = 0\n    def dfs(r, c):\n        if r < 0 or c < 0 or r >= len(grid) or c >= len(grid[0]) or grid[r][c] == '0':\n            return\n        grid[r][c] = '0'\n        dfs(r+1, c); dfs(r-1, c); dfs(r, c+1); dfs(r, c-1)\n    \n    for r in range(len(grid)):\n        for c in range(len(grid[0])):\n            if grid[r][c] == '1':\n                count += 1\n                dfs(r, c)\n    return count",
        "java": "public int numIslands(char[][] grid) {\n    if (grid == null || grid.length == 0) return 0;\n    int count = 0;\n    for (int r = 0; r < grid.length; r++) {\n        for (int c = 0; c < grid[r].length; c++) {\n            if (grid[r][c] == '1') {\n                count++;\n                dfs(grid, r, c);\n            }\n        }\n    }\n    return count;\n}\nprivate void dfs(char[][] grid, int r, int c) {\n    if (r < 0 || c < 0 || r >= grid.length || c >= grid[0].length || grid[r][c] == '0') return;\n    grid[r][c] = '0';\n    dfs(grid, r + 1, c); dfs(grid, r - 1, c); dfs(grid, r, c + 1); dfs(grid, r, c - 1);\n}",
        "cpp": "int numIslands(vector<vector<char>>& grid) {\n    if (grid.empty()) return 0;\n    int count = 0;\n    for (int r = 0; r < grid.size(); ++r) {\n        for (int c = 0; c < grid[0].size(); ++c) {\n            if (grid[r][c] == '1') {\n                count++;\n                dfs(grid, r, c);\n            }\n        }\n    }\n    return count;\n}\nvoid dfs(vector<vector<char>>& grid, int r, int c) {\n    if (r < 0 || c < 0 || r >= grid.size() || c >= grid[0].size() || grid[r][c] == '0') return;\n    grid[r][c] = '0';\n    dfs(grid, r + 1, c); dfs(grid, r - 1, c); dfs(grid, r, c + 1); dfs(grid, r, c - 1);\n}"
    },
    "lru-cache": {
        "strategy": "Use a Hash Map paired with a Doubly Linked List. The Map stores key-node mappings for O(1) lookups. The Linked List maintains usage order for O(1) eviction.",
        "complexity": "Time: O(1) for both get and put | Space: O(Capacity)",
        "python": "class Node:\n    def __init__(self, k, v):\n        self.key, self.val = k, v\n        self.prev = self.next = None\n\nclass LRUCache:\n    def __init__(self, capacity: int):\n        self.cap = capacity\n        self.map = {}\n        self.head, self.tail = Node(0, 0), Node(0, 0)\n        self.head.next, self.tail.prev = self.tail, self.head\n\n    def _remove(self, node):\n        p, n = node.prev, node.next\n        p.next, n.prev = n, p\n\n    def _add(self, node):\n        p = self.tail.prev\n        p.next = node\n        node.prev, node.next = p, self.tail\n        self.tail.prev = node\n\n    def get(self, key: int) -> int:\n        if key in self.map:\n            node = self.map[key]\n            self._remove(node); self._add(node)\n            return node.val\n        return -1",
        "java": "class LRUCache {\n    class Node { int key; int value; Node prev; Node next; }\n    private Map<Integer, Node> map = new HashMap<>();\n    private int count, capacity;\n    private Node head, tail;\n    // Implement constructor, get(), put(), addNode(), removeNode(), moveToHead(), popTail() etc.\n}",
        "cpp": "class LRUCache {\n    struct Node { int key; int val; Node* prev; Node* next; };\n    unordered_map<int, Node*> map;\n    int cap;\n    Node* head; Node* tail;\n    // Implement LRUCache structure\n};"
    }
}

class LeetCodeGenerator:
    def __init__(self):
        self.is_offline_mode = False
        if not config.GEMINI_API_KEY or config.GEMINI_API_KEY.strip() == "":
            self.is_offline_mode = True
        else:
            try:
                self.llm_client = GeminiClient()
            except Exception as e:
                print(f"[Generator] Failed to initialize Gemini Client: {e}")
                self.is_offline_mode = True
            
        self.system_instruction = (
            "You are Crack My DSA, an elite software engineering interview coach and FAANG technical interviewer.\n"
            "Your objective is to help the user prepare for coding interviews by answering their queries precisely and concisely.\n\n"
            "Guidelines:\n"
            "1. ONLY answer exactly what is asked. Do not add unsolicited strategies, complexities, or code solutions unless explicitly requested.\n"
            "2. If the user asks for a list of questions, output a clean Markdown table containing EXACTLY the questions provided in the 'Retrieved Company Question Context'. Format the Markdown table with columns: | LeetCode # | Problem Title | Difficulty | Frequency Score | Topics |. In the 'LeetCode #' column, place the exact LeetCode question number (e.g. #1, #15, #22, #79, or Premium/SQL). In the 'Problem Title' column, place the problem title AND right next to it, append a YouTube solution link e.g. '[Solution](https://www.youtube.com/results?search_query=LeetCode+<Title>+<Company>+solution)'. Match the exact Titles, Company, Difficulty, Frequency, and Topics from the context. Do NOT invent, substitute, or replace questions outside of the provided context.\n"
            "3. If the user asks about a specific question or asks 'how to implement' a problem, DO NOT output code solutions immediately. First, ask the candidate which programming language they prefer (Java, Python, C, or C++). Once they specify the language in the next turn, provide the clean code implementation and complexity analysis ONLY in that selected language.\n"
            "4. At the end of every response, provide 2-3 dynamic, highly relevant recommended follow-up questions/suggestions for what they should ask next, based on their previous questions and current progress.\n"
            "5. If a question number is not standard (e.g., SQL/Database or custom premium), represent it as 'SQL' or 'Premium'.\n"
            "6. ACCURATE DATABASE COUNTS & STATS: When the user asks 'how many questions do you have for [Company]', 'total count', or 'where do they ask from', ALWAYS quote the exact 'Total Matching Database Questions Count' provided in the prompt context (e.g., 261 questions for Goldman Sachs). NEVER claim or imply that the database only has 10 questions when the Total Count is larger! Clarify how many questions are shown in the current table (e.g., showing 10 or showing all N).\n"
            "7. CONVERSATION CONTEXT: Continuously preserve conversation context from history. If the user asks follow-up queries like 'topics', 'where do they mostly ask from', or 'show all', answer specifically for the company/filters established in previous turns (e.g. Goldman Sachs).\n"
            "8. EXPLAIN ONE BY ONE: If the user asks to 'explain one by one', 'explain each question', or 'one by one', provide an explicit, clear algorithmic breakdown, core intuition, and complexity analysis for each problem listed in context sequentially."
        )

    def format_retrieved_questions(self, questions: List[Dict[str, Any]]) -> str:
        """Converts retrieved database records into a clean text block for prompt injection."""
        if not questions:
            return "No matching questions were found in the database."
            
        import urllib.parse
        formatted_list = []
        
        # If question list is large, use concise single-line format to keep prompt lean and prevent LLM API timeouts
        if len(questions) > 25:
            for idx, q in enumerate(questions):
                title = q.get('title', 'Unknown')
                company = q.get('company', '')
                diff = q.get('difficulty', 'Medium')
                freq = float(q.get('frequency', 0.0))
                topics = q.get('topics', '')
                yt_query = urllib.parse.quote_plus(f"LeetCode {title} {company} solution")
                yt_link = f"https://www.youtube.com/results?search_query={yt_query}"
                q_str = f"{idx + 1}. Title: {title} [Solution]({yt_link}) | Company: {company} | Difficulty: {diff} | Freq: {freq:.1f}% | Topics: {topics}"
                formatted_list.append(q_str)
            return "\n".join(formatted_list)

        for idx, q in enumerate(questions):
            title = q.get('title', 'Unknown')
            company = q.get('company', '')
            yt_query = urllib.parse.quote_plus(f"LeetCode {title} {company} solution")
            yt_link = f"https://www.youtube.com/results?search_query={yt_query}"
            
            q_str = (
                f"{idx + 1}. Title: {title} [Solution]({yt_link})\n"
                f"   Company: {company}\n"
                f"   Difficulty: {q['difficulty']}\n"
                f"   Frequency Score: {q['frequency']:.1f}\n"
                f"   Acceptance Rate: {q['acceptance_rate']:.4f}\n"
                f"   Topics: {q['topics']}\n"
                f"   LeetCode Link: {q['link']}\n"
            )
            formatted_list.append(q_str)
            
        return "\n".join(formatted_list)

    def generate_offline_response(self, query: str, retrieved_questions: List[Dict[str, Any]]) -> str:
        """Generates a high-quality response offline using static rules and template databases."""
        if not retrieved_questions:
            return (
                "### [Offline Mode] No problems retrieved\n\n"
                "I am currently operating in **Local/Offline Mode** because the Gemini API is unreachable or network access is disabled.\n\n"
                "I couldn't find any questions matching your query in the local metadata database. Please try a different query or expand your search filters."
            )
            
        import urllib.parse
        response = [
            "### Crack My DSA (Local/Offline Fallback Mode)\n",
            "> **Note**: The Gemini LLM API is unreachable (likely due to sandbox network restrictions or missing API keys). I am serving this request using local data templates.\n",
            f"Here are the **Top {len(retrieved_questions)}** questions matching your search:\n"
        ]
        
        # 1. Print question list table
        response.append("| LeetCode # | Company | Problem Title | Difficulty | Frequency | Links |")
        response.append("|------------|---------|---------------|------------|-----------|-------|")
        for idx, q in enumerate(retrieved_questions):
            link_md = f"[Solve ↗]({q['link']})" if q['link'] else "No Link"
            yt_query = urllib.parse.quote_plus(f"LeetCode {q['title']} {q['company']} solution")
            yt_md = f"[YouTube Solution](https://www.youtube.com/results?search_query={yt_query})"
            response.append(f"| #{idx+1} | **{q['company']}** | **{q['title']}** | `{q['difficulty']}` | {q['frequency']:.1f}% | {link_md} · {yt_md} |")
            
        response.append("\n---\n")
        
        # 2. Add algorithmic details for top 1-2 questions
        response.append("### Problem Explanations & Implementations\n")
        
        for idx, q in enumerate(retrieved_questions[:2]):
            title_slug = q['title'].lower().replace(" ", "-")
            response.append(f"#### {idx+1}. {q['title']} (`{q['difficulty']}`) - Asked by {q['company']}")
            response.append(f"*DSA Topics: {q['topics']}*\n")
            
            # Check cache
            if title_slug in OFFLINE_PROBLEMS_DB:
                cache = OFFLINE_PROBLEMS_DB[title_slug]
                response.append(f"**Optimal Algorithmic Strategy:**\n{cache['strategy']}\n")
                response.append(f"**Complexity Analysis:**\n`{cache['complexity']}`\n")
                
                response.append("##### Python Solution")
                response.append(f"```python\n{cache['python']}\n```\n")
                
                response.append("##### Java Solution")
                response.append(f"```java\n{cache['java']}\n```\n")
                
                response.append("##### C++ Solution")
                response.append(f"```cpp\n{cache['cpp']}\n```\n")
            else:
                # Dynamic default template based on topics
                topics_str = q['topics'].lower()
                strategy = "Utilize standard " + q['topics'] + " patterns. Identify the optimal base case and define the transition equations."
                complexity = "Time: O(N) | Space: O(N)"
                
                if "graph" in topics_str or "depth-first search" in topics_str or "breadth-first search" in topics_str:
                    strategy = "Represent the problem as a graph traversal. Perform Breadth-First Search (BFS) using a Queue to find shortest path, or Depth-First Search (DFS) recursively with a visited hashset to explore path existence."
                    complexity = "Time: O(V + E) | Space: O(V) for recursion stack or visited queue."
                elif "dynamic programming" in topics_str or "dp" in topics_str:
                    strategy = "Solve using Dynamic Programming. Define state representation `dp[i]`, identify subproblem recurrence relations, and optimize memory from O(N) to O(1) space if possible using rolling variables."
                    complexity = "Time: O(N) or O(N^2) | Space: O(N) or O(1)."
                elif "binary search" in topics_str:
                    strategy = "Establish search space parameters (low, high). Compute mid-point and adjust bounds based on target value comparison. Runs in logarithmic time."
                    complexity = "Time: O(log N) | Space: O(1)."
                elif "sliding window" in topics_str:
                    strategy = "Use two pointers (left, right) representing a window. Expand right pointer to add elements, and shrink left pointer to maintain window constraints, recording optimal criteria."
                    complexity = "Time: O(N) | Space: O(K) where K is distinct elements."
                    
                response.append(f"**Optimal Algorithmic Strategy:**\n{strategy}\n")
                response.append(f"**Complexity Analysis:**\n`{complexity}`\n")
                
                response.append("##### Python Template")
                response.append(f"```python\n# [Offline Mode Template]\ndef solveProblem(data):\n    # TODO: Implement optimal {q['topics']} approach\n    pass\n```\n")
                
                response.append("##### Java Template")
                response.append(f"```java\n// [Offline Mode Template]\nclass Solution {{\n    public void solve(Object data) {{\n        // TODO: Implement optimal {q['topics']} approach\n    }}\n}}\n```\n")
                
                response.append("##### C++ Template")
                response.append(f"```cpp\n// [Offline Mode Template]\nclass Solution {{\npublic:\n    void solve(auto data) {{\n        // TODO: Implement optimal {q['topics']} approach\n    }}\n}};\n```\n")
                
            response.append("\n---\n")
            
        response.append("Tip: Connect this machine to the internet and input a valid API key in your .env to see full dynamic AI explanations and code dry-runs.")
        return "\n".join(response)

    def generate_response(
        self, 
        query: str, 
        retrieved_questions: List[Dict[str, Any]], 
        chat_history: Optional[List[Dict[str, str]]] = None, 
        solved_titles: Optional[List[str]] = None,
        total_matching_count: Optional[int] = None,
        difficulty_breakdown: Optional[Dict[str, int]] = None,
        topic_breakdown: Optional[Dict[str, int]] = None,
        wants_one_by_one: bool = False
    ) -> str:
        """Builds prompt, appends context, and generates final response. Falls back to offline templates if needed."""
        if self.is_offline_mode:
            return self.generate_offline_response(query, retrieved_questions)
            
        retrieved_context = self.format_retrieved_questions(retrieved_questions)
        
        prompt = ""
        if chat_history:
            prompt += "Conversation History:\n"
            for msg in chat_history[-6:]:
                role = "Candidate" if msg["role"] == "user" else "Coach"
                prompt += f"{role}: {msg['content']}\n"
            prompt += "\n"

        if solved_titles:
            prompt += (
                f"CRITICAL DIRECTIVE: The candidate has ALREADY SOLVED the following problems:\n"
                f"{', '.join(solved_titles[:60])}\n"
                f"DO NOT include or recommend ANY of these already-solved problems in your recommended response or table!\n\n"
            )
            
        if total_matching_count is not None:
            prompt += f"Total Matching Database Questions Count: {total_matching_count}\n"
            if difficulty_breakdown:
                prompt += f"Difficulty Distribution in DB: {difficulty_breakdown}\n"
            if topic_breakdown:
                sorted_topics = sorted(topic_breakdown.items(), key=lambda x: x[1], reverse=True)[:10]
                prompt += f"Top Topics Distribution in DB: {dict(sorted_topics)}\n"
            prompt += f"Number of retrieved questions listed in context below: {len(retrieved_questions)}\n\n"

        q_lower = query.lower()
        if wants_one_by_one or any(w in q_lower for w in ["one by one", "explain each", "explain one by one", "step by step"]):
            prompt += (
                "CRITICAL DIRECTIVE: The candidate explicitly requested to EXPLAIN EACH QUESTION ONE BY ONE.\n"
                "After outputting the summary table, provide a detailed step-by-step breakdown for EACH problem listed in the context below.\n"
                "For every problem, explain: 1) Core Algorithmic Intuition & Strategy, 2) Key Edge Cases, and 3) Time & Space Complexity.\n\n"
            )

        prompt += (
            f"Candidate Query: \"{query}\"\n\n"
            f"Retrieved Company Question Context:\n"
            f"----------------------------------------\n"
            f"{retrieved_context}\n"
            f"----------------------------------------\n\n"
            f"Please generate the response based on the query and retrieved metadata and questions."
        )
        
        try:
            response_text = self.llm_client.generate_text(
                prompt=prompt,
                system_instruction=self.system_instruction
            )
            return response_text
        except Exception as e:
            print(f"[Generator] Gemini API Call failed: {e}. Switching to offline fallback generator.")
            return self.generate_offline_response(query, retrieved_questions)

if __name__ == "__main__":
    generator = LeetCodeGenerator()
    dummy_questions = [
        {
            "title": "Two Sum",
            "company": "Google",
            "difficulty": "Easy",
            "frequency": 100.0,
            "acceptance_rate": 0.0057,
            "topics": "Array, Hash Table",
            "link": "https://leetcode.com/problems/two-sum"
        }
    ]
    resp = generator.generate_response("Give me Google Easy questions", dummy_questions)
    print(resp[:400] + "...")
