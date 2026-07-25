import os
import sys
import re
import json
from pathlib import Path
from typing import Dict, Any

PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.append(str(PROJECT_ROOT))

from vectorstore.chat_db import ChatDatabaseManager

def generate_rich_intuition(title: str, topic_name: str, subfolder: str, question_text: str, cpp_code: str, existing_app: str) -> str:
    code_upper = cpp_code.upper()
    title_lower = title.lower()

    # 1. Specialized Intuitions for Core DSA Patterns
    if "largest element" in title_lower and "second" not in title_lower:
        return (
            "To find the largest element in an array, we do not need sorting which takes O(N log N). "
            "We can find it in a single pass of O(N) time.\n\n"
            "**Step-by-Step Approach:**\n"
            "1. **Initialize Candidate**: Maintain a variable `largest` initialized to the first element `arr[0]`.\n"
            "2. **Linear Traversal**: Iterate through the array starting from index 1 to N-1.\n"
            "3. **Update State**: Whenever `arr[i] > largest`, update `largest = arr[i]`.\n"
            "4. **Return Result**: After completing the loop, return `largest` as the maximum element."
        )

    if "second largest" in title_lower:
        return (
            "Instead of sorting the array in O(N log N), we can find both the largest and second largest elements in a single O(N) pass.\n\n"
            "**Step-by-Step Approach:**\n"
            "1. **Track Two Variables**: Maintain `largest` and `second_largest` initialized to `-INF` or proper boundary values.\n"
            "2. **Single Pass Comparison**:\n"
            "   - If `arr[i] > largest`: Update `second_largest = largest` and `largest = arr[i]`.\n"
            "   - Else if `arr[i] < largest` and `arr[i] > second_largest`: Update `second_largest = arr[i]`.\n"
            "3. **Edge Case**: If no valid second largest exists (all elements identical), return `-1`.\n"
            "4. **Return Result**: Return `second_largest`."
        )

    if "check if array is sorted" in title_lower or "sorted and rotated" in title_lower:
        return (
            "For an array to be sorted and rotated, there can be at most ONE position where `arr[i] > arr[(i+1)%n]`.\n\n"
            "**Step-by-Step Approach:**\n"
            "1. **Count Drop Points**: Initialize a counter `drop_count = 0`.\n"
            "2. **Circular Comparison**: Iterate through index `0` to `n-1`, comparing `arr[i]` with `arr[(i+1)%n]`.\n"
            "3. **Increment Drops**: Whenever `arr[i] > arr[(i+1)%n]`, increment `drop_count`.\n"
            "4. **Verification**: If `drop_count <= 1`, return `true` (it is a valid sorted & rotated array); otherwise return `false`."
        )

    if "remove duplicates" in title_lower:
        return (
            "Since the input array is already sorted, duplicate elements will be adjacent. We can use the **Two Pointers** technique to modify the array in-place with O(1) extra space.\n\n"
            "**Step-by-Step Approach:**\n"
            "1. **Two Pointers Setup**: Let pointer `i` track the position of unique elements (starts at index 0). Let pointer `j` traverse from index 1 to N-1.\n"
            "2. **In-Place Placement**: Whenever `arr[j] != arr[i]`, increment `i` and set `arr[i] = arr[j]`.\n"
            "3. **Return Count**: After traversal, the first `i+1` elements are unique. Return `i+1`."
        )

    if "move" in title_lower and "zero" in title_lower:
        return (
            "We use the **Two Pointers** pattern to shift non-zero elements forward in a single pass while preserving relative order.\n\n"
            "**Step-by-Step Approach:**\n"
            "1. **First Non-Zero Pointer**: Find the first occurrence of `0` at index `j`.\n"
            "2. **Iterate & Swap**: Iterate pointer `i` from `j+1` to N-1. Whenever `arr[i] != 0`, swap `arr[i]` with `arr[j]` and increment `j`.\n"
            "3. **Result**: All non-zero numbers are packed to the front, pushing zeros to the end in O(N) time and O(1) space."
        )

    if "missing number" in title_lower:
        return (
            "We can use **Sum Difference** or **Bitwise XOR** to find the missing number in O(N) time and O(1) space.\n\n"
            "**Step-by-Step Approach (Bitwise XOR):**\n"
            "1. **XOR Principle**: Recall that `x ^ x = 0` and `x ^ 0 = x`.\n"
            "2. **Compute Dual XOR**: Compute `XOR` of all indices `0` to `N` and `XOR` of all elements in the array.\n"
            "3. **Result**: The XOR result will cancel out all present numbers, leaving only the missing number."
        )

    if "two sum" in title_lower:
        return (
            "Instead of a brute force O(N^2) double loop, we use a **Hash Map** to store each number and its index for O(1) complement lookup.\n\n"
            "**Step-by-Step Approach:**\n"
            "1. **Hash Map Creation**: Create a map `seen` storing `{element: index}`.\n"
            "2. **Complement Lookup**: For each element `num` at index `i`, compute `target - num`.\n"
            "3. **Check Presence**: If `target - num` exists in `seen`, return `[seen[target - num], i]`.\n"
            "4. **Store Element**: Otherwise, insert `seen[num] = i` and continue."
        )

    if "kadane" in title_lower or "maximum subarray" in title_lower or "max subarray sum" in title_lower:
        return (
            "**Kadane's Algorithm** finds the maximum subarray sum in O(N) time by deciding whether to extend the current subarray or start a new one.\n\n"
            "**Step-by-Step Approach:**\n"
            "1. **State Tracking**: Maintain `current_sum = 0` and `max_sum = -INF`.\n"
            "2. **Iterate Array**: For each element `num` in the array:\n"
            "   - Add `num` to `current_sum`.\n"
            "   - Update `max_sum = max(max_sum, current_sum)`.\n"
            "   - If `current_sum < 0`, reset `current_sum = 0` (starting fresh from next element).\n"
            "3. **Return Output**: Return `max_sum`."
        )

    # 2. Extract existing comment approach if clean and multi-line
    cleaned_existing = existing_app.strip()
    if cleaned_existing and len(cleaned_existing.splitlines()) >= 3 and "Standard optimal algorithmic approach" not in cleaned_existing and "Intialize the ans" not in cleaned_existing:
        raw_lines = [line.strip().lstrip('->').lstrip('*').lstrip('-').strip() for line in cleaned_existing.splitlines() if line.strip()]
        lines = [re.sub(r'^\d+[\.\)]\s*', '', line).strip() for line in raw_lines if line.strip()]
        formatted_steps = "\n".join(f"{idx+1}. {line}" for idx, line in enumerate(lines))
        return f"To solve **{title}**, follow the core algorithmic steps below:\n\n**Step-by-Step Approach:**\n{formatted_steps}"

    # 3. Analyze C++ Code Syntax & Topic to build structured breakdown
    tech_list = []
    if 'UNORDERED_MAP' in code_upper or 'MAP<' in code_upper:
        tech_list.append('Hash Map for O(1) frequency & index lookup')
    if 'UNORDERED_SET' in code_upper or 'SET<' in code_upper:
        tech_list.append('Hash Set for O(1) presence verification')
    if 'SORT(' in code_upper:
        tech_list.append('Sorting to order elements efficiently')
    if 'PRIORITY_QUEUE' in code_upper:
        tech_list.append('Priority Queue (Heap) for dynamic min/max tracking')
    if 'STACK<' in code_upper:
        if 'WHILE (!' in code_upper or 'WHILE(!' in code_upper:
            tech_list.append('Monotonic Stack to compute next greater/smaller elements')
        else:
            tech_list.append('Stack LIFO processing')
    if 'QUEUE<' in code_upper:
        tech_list.append('Queue FIFO processing')
    if 'DP[' in code_upper or 'MEMO[' in code_upper or 'VECTOR<VECTOR<INT>>' in code_upper:
        if 'FOR(' in code_upper or 'FOR (' in code_upper:
            tech_list.append('Dynamic Programming (Bottom-Up Tabulation)')
        else:
            tech_list.append('Dynamic Programming (Top-Down Memoization)')
    if 'LOW' in code_upper and 'HIGH' in code_upper and 'MID' in code_upper:
        tech_list.append('Binary Search over search space')
    if ('LEFT' in code_upper and 'RIGHT' in code_upper) or ('I = 0' in code_upper and 'J =' in code_upper):
        tech_list.append('Two Pointers windowing')

    if not tech_list:
        if 'Binary Search' in topic_name:
            tech_list.append('Binary Search logarithmic reduction O(log N)')
        elif 'Strings' in topic_name:
            tech_list.append('Character Frequency Counting & Pattern Matching')
        elif 'Linked List' in topic_name:
            tech_list.append('Linked List Pointer Manipulation & Traversal')
        elif 'Recursion' in topic_name:
            tech_list.append('Recursive Backtracking & Decision Tree Exploration')
        elif 'Bit' in topic_name:
            tech_list.append('Bitwise Operations (&, |, ^, <<, >>)')
        elif 'Trees' in topic_name or 'BST' in topic_name:
            tech_list.append('Tree Node Recursion & Traversal')
        elif 'Graphs' in topic_name:
            tech_list.append('Graph Traversal (DFS/BFS) & Adjacency List Parsing')
        elif 'Dynamic Programming' in topic_name:
            tech_list.append('Optimal Substructure & Overlapping Subproblems Optimization')
        elif 'Greedy' in topic_name:
            tech_list.append('Greedy Choice Property')
        else:
            tech_list.append('Optimal State Iteration & Boundary Traversal')

    primary_tech = tech_list[0]
    sec_tech = f" and {tech_list[1]}" if len(tech_list) > 1 else ""

    return (
        f"To solve **{title}** efficiently, we utilize **{primary_tech}**{sec_tech}.\n\n"
        f"**Step-by-Step Approach:**\n"
        f"1. **Initial Setup**: Define necessary pointers, variables, or data structures ({primary_tech}) to store intermediate state.\n"
        f"2. **Core Algorithm**: Iterate through the input elements. At each step, apply optimal logical decisions, update tracked state, and handle boundary conditions.\n"
        f"3. **State Transition & Termination**: Continuously refine results during traversal, returning the computed optimal output upon completion."
    )

def enrich_roadmap_approaches():
    print("Starting DSA Roadmap complete approaches enrichment...")
    db = ChatDatabaseManager()
    
    if db.is_postgres:
        import psycopg2.extras
        with db.conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
            cursor.execute("SELECT p.*, t.title as topic_title FROM dsa_roadmap_problems p JOIN dsa_roadmap_topics t ON p.topic_id = t.topic_id;")
            problems = [dict(r) for r in cursor.fetchall()]
    else:
        cursor = db.conn.cursor()
        cursor.execute("SELECT p.*, t.title as topic_title FROM dsa_roadmap_problems p JOIN dsa_roadmap_topics t ON p.topic_id = t.topic_id;")
        rows = cursor.fetchall()
        problems = [dict(r) for r in rows]

    print(f"Loaded {len(problems)} problems. Regenerating clean, structured step-by-step intuitive approaches...")

    updated_count = 0
    for p in problems:
        current_app = p.get("approach_text") or ""
        new_app = generate_rich_intuition(
            title=p.get("title", ""),
            topic_name=p.get("topic_title", ""),
            subfolder=p.get("subfolder", ""),
            question_text=p.get("question_text", ""),
            cpp_code=p.get("cpp_code", ""),
            existing_app=current_app
        )
        
        pid = p["problem_id"]
        if db.is_postgres:
            with db.conn.cursor() as cursor:
                cursor.execute("UPDATE dsa_roadmap_problems SET approach_text = %s WHERE problem_id = %s;", (new_app, pid))
        else:
            cursor = db.conn.cursor()
            cursor.execute("UPDATE dsa_roadmap_problems SET approach_text = ? WHERE problem_id = ?;", (new_app, pid))
        
        updated_count += 1

    db.conn.commit()
    print(f"Successfully enriched and updated all {updated_count} problem approaches in database!")

if __name__ == "__main__":
    enrich_roadmap_approaches()
