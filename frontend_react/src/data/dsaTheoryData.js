export const dsaTheoryData = {
  1: {
    title: "01. Arrays",
    summary: "Arrays are contiguous memory blocks storing elements of the same type. Operations at index are O(1), while searching in unsorted arrays is O(N).",
    patterns: [
      {
        name: "Two Pointers Pattern",
        desc: "Uses two pointers (left/right or slow/fast) moving toward each other or in the same direction to solve problems in O(N) time and O(1) space."
      },
      {
        name: "Prefix Sum & Difference Array",
        desc: "Precomputes cumulative sums (`prefix[i] = prefix[i-1] + arr[i]`) to answer range sum queries in O(1) time."
      },
      {
        name: "Kadane's Algorithm",
        desc: "Dynamic programming approach for finding maximum subarray sum in O(N) time by resetting current sum to zero whenever it drops below zero."
      },
      {
        name: "Boyer-Moore Voting Algorithm",
        desc: "Finds majority element (> N/2 times) in O(N) time and O(1) space by maintaining a candidate and a counter."
      },
      {
        name: "Dutch National Flag Algorithm",
        desc: "3-pointer approach (low, mid, high) to sort an array of 0s, 1s, and 2s in a single pass O(N) time."
      }
    ],
    complexities: [
      { operation: "Access by Index", time: "O(1)", space: "O(1)" },
      { operation: "Linear Search", time: "O(N)", space: "O(1)" },
      { operation: "Insertion / Deletion at End", time: "O(1) amortized", space: "O(1)" },
      { operation: "Insertion / Deletion at Start/Middle", time: "O(N)", space: "O(1)" }
    ],
    strategy: "Always check if the array is sorted. If sorted, consider Binary Search or Two Pointers. If asking for subarrays, consider Prefix Sums, Kadane's, or Sliding Window."
  },

  2: {
    title: "02. Binary Search",
    summary: "Divide-and-conquer algorithm operating on sorted arrays or monotonic search spaces. Reduces search space by half at each step, achieving O(log N) time.",
    patterns: [
      {
        name: "Classic Binary Search",
        desc: "Maintain `low` and `high`. Calculate `mid = low + (high - low)/2`. Adjust boundaries based on target comparison."
      },
      {
        name: "Lower Bound & Upper Bound",
        desc: "Lower Bound finds first element >= target. Upper Bound finds first element > target. Crucial for range queries."
      },
      {
        name: "Search in Rotated Sorted Array",
        desc: "Identify which half (left or right) is sorted at `mid`, then check if target lies within the sorted half's boundaries."
      },
      {
        name: "Binary Search on Answer / Search Space",
        desc: "Used when searching for minimum or maximum value satisfying a boolean condition `isPossible(mid)` (e.g. Koko Eating Bananas, Book Allocation)."
      }
    ],
    complexities: [
      { operation: "Binary Search", time: "O(log N)", space: "O(1) iterative / O(log N) recursive" },
      { operation: "Matrix Binary Search", time: "O(log(M * N))", space: "O(1)" }
    ],
    strategy: "If a problem asks to 'minimize maximum' or 'maximize minimum' value, or if problem array is sorted/rotated, apply Binary Search."
  },

  3: {
    title: "03. Strings",
    summary: "Strings are sequences of characters. In C++, strings are mutable (`std::string`), whereas in Java/Python, strings are immutable.",
    patterns: [
      {
        name: "Character Frequency Hashing",
        desc: "Use a fixed size array of 26 (lowercase) or 256 (ASCII) to count character frequencies in O(N) time and O(1) auxiliary space."
      },
      {
        name: "Two Pointers (Palindrome Check)",
        desc: "Compare characters from start (`left`) and end (`right`) moving inward."
      },
      {
        name: "Sliding Window for Substrings",
        desc: "Expand right pointer to include characters and shrink left pointer when constraint is violated."
      },
      {
        name: "KMP & Z-Algorithm Pattern Matching",
        desc: "Precomputes Longest Prefix Suffix (LPS) array to perform pattern matching in linear O(N + M) time without backtracking."
      }
    ],
    complexities: [
      { operation: "Character Access", time: "O(1)", space: "O(1)" },
      { operation: "Substring Extraction", time: "O(K)", space: "O(K)" },
      { operation: "Anagram / Frequency Check", time: "O(N)", space: "O(26) = O(1)" }
    ],
    strategy: "For substring problems, think Sliding Window or Hash Map. For anagrams, think Frequency Array. For pattern matching, think KMP or Rolling Hash."
  },

  4: {
    title: "04. Linked List",
    summary: "Linear data structure where nodes contain data and pointers to the next (and optionally previous) node. Allows O(1) dynamic insertions without reallocating contiguous memory.",
    patterns: [
      {
        name: "Floyd's Cycle Detection (Tortoise and Hare)",
        desc: "Use `slow` (moves 1 step) and `fast` (moves 2 steps) pointers. If fast meets slow, a cycle exists. To find cycle start, reset slow to head and move both 1 step at a time."
      },
      {
        name: "Dummy Head Technique",
        desc: "Create a sentinel `Dummy` node before the head to simplify edge cases when inserting/deleting the true head node."
      },
      {
        name: "Iterative Pointer Reversal",
        desc: "Maintain `prev = nullptr`, `curr = head`, and `next = nullptr`. In a loop: `next = curr->next; curr->next = prev; prev = curr; curr = next;`"
      },
      {
        name: "Middle Node & Merging",
        desc: "Find middle node using slow/fast pointers, split list into halves, and merge sorted lists recursively or iteratively."
      }
    ],
    complexities: [
      { operation: "Head Insertion / Deletion", time: "O(1)", space: "O(1)" },
      { operation: "Traversal / Access by Index", time: "O(N)", space: "O(1)" },
      { operation: "Reversal", time: "O(N)", space: "O(1)" }
    ],
    strategy: "Always handle null pointers (`head == null` or `head.next == null`). Dummy nodes eliminate 90% of null pointer checks."
  },

  5: {
    title: "05. Recursion & Backtracking",
    summary: "Recursion breaks a problem into smaller subproblems until reaching base cases. Backtracking builds candidates incrementally and abandons ('backtracks') as soon as a candidate cannot yield a valid solution.",
    patterns: [
      {
        name: "Pick / Non-Pick Subsequence Pattern",
        desc: "At index `i`, make two decisions: (1) Include element in current subset, (2) Exclude element from current subset. Generates all 2^N subsets."
      },
      {
        name: "Permutations Pattern (Swapping)",
        desc: "Loop index `j` from `index` to `N-1`, swap `arr[index]` with `arr[j]`, recurse for `index + 1`, and swap back (backtrack)."
      },
      {
        name: "Constraint Validation (N-Queens & Sudoku)",
        desc: "Place a value, check if valid via helper `isValid()`, recurse to next cell/row. If recursion returns false, un-place value."
      }
    ],
    complexities: [
      { operation: "Subsets Generation", time: "O(2^N)", space: "O(N) recursion stack" },
      { operation: "Permutations Generation", time: "O(N!)", space: "O(N)" }
    ],
    strategy: "Define (1) Base Case, (2) Work in current call, and (3) Recursive Calls. Always undo modifications when returning from recursion."
  },

  6: {
    title: "06. Bit Manipulation",
    summary: "Manipulates binary bits directly using bitwise operators (`&`, `|`, `^`, `~`, `<<`, `>>`). Extremely fast and memory efficient.",
    patterns: [
      {
        name: "Core Bit Formulas",
        desc: "Check K-th bit set: `(n & (1 << k)) != 0` | Set K-th bit: `n | (1 << k)` | Clear K-th bit: `n & ~(1 << k)` | Toggle K-th bit: `n ^ (1 << k)`"
      },
      {
        name: "Clear Lowest Set Bit",
        desc: "`n & (n - 1)` clears the rightmost set bit of `n`. Used to count set bits (Brian Kernighan's Algorithm) and check if power of 2 (`(n & (n-1)) == 0`)."
      },
      {
        name: "XOR Properties",
        desc: "`x ^ x = 0` and `x ^ 0 = x`. XOR is commutative and associative. Finds single non-repeating number."
      }
    ],
    complexities: [
      { operation: "Bitwise Operators", time: "O(1)", space: "O(1)" },
      { operation: "Count Set Bits", time: "O(number of set bits)", space: "O(1)" }
    ],
    strategy: "Remember operator precedence (`<<` and `>>` have lower precedence than `+` and `-`). Always use parentheses around bitwise expressions."
  },

  7: {
    title: "07. Stack and Queues",
    summary: "Stack is a Last-In-First-Out (LIFO) structure. Queue is a First-In-First-Out (FIFO) structure.",
    patterns: [
      {
        name: "Monotonic Stack Pattern",
        desc: "Maintains elements in strictly increasing or decreasing order. Answers 'Next Greater Element' or 'Next Smaller Element' in O(N) total time."
      },
      {
        name: "Histogram & Rainwater Trapping",
        desc: "Uses monotonic stack or two-pointer boundary tracking to compute trapped water volume or largest rectangle area."
      },
      {
        name: "LRU Cache Design",
        desc: "Combines a Hash Map (O(1) key lookups) with a Doubly Linked List (O(1) node removal and insertion at head/tail)."
      }
    ],
    complexities: [
      { operation: "Push / Pop / Top", time: "O(1)", space: "O(N)" },
      { operation: "Monotonic Stack Pass", time: "O(N)", space: "O(N)" }
    ],
    strategy: "If problem asks for nearest previous/next greater or smaller element, think Monotonic Stack immediately."
  },

  8: {
    title: "08. Sliding Window & Two Pointers",
    summary: "Technique to transform O(N^2) subarray/substring brute-force checks into O(N) linear scans by maintaining a sliding boundary window.",
    patterns: [
      {
        name: "Fixed Size Sliding Window",
        desc: "Maintain window of size `K`. Slide by adding `arr[i]` and removing `arr[i-K]` at each step."
      },
      {
        name: "Variable Size Sliding Window",
        desc: "Expand `right` pointer to include elements. When condition is violated, shrink `left` pointer until condition is valid again."
      },
      {
        name: "At Most K -> Exactly K Reduction",
        desc: "`Exactly(K) = AtMost(K) - AtMost(K-1)`. Simplifies counting subarrays with exact conditions."
      }
    ],
    complexities: [
      { operation: "Sliding Window Traversal", time: "O(N)", space: "O(1) or O(K) for frequency hash" }
    ],
    strategy: "If problem asks for contiguous subarray/substring with optimal sum, length, or count, use Sliding Window."
  },

  9: {
    title: "09. Heaps & Priority Queue",
    summary: "Tree-based structure allowing O(1) access to minimum (Min-Heap) or maximum (Max-Heap) element, with O(log N) insertion and extraction.",
    patterns: [
      {
        name: "Top K Elements / K-th Largest",
        desc: "Use a Min-Heap of size `K`. Push elements into heap; if size exceeds `K`, pop the smallest element. Top of heap is K-th largest."
      },
      {
        name: "Two Heaps (Median Finder)",
        desc: "Maintain a Max-Heap for lower half of numbers and a Min-Heap for upper half. Balance sizes so top elements give median in O(1)."
      },
      {
        name: "K-Way Merge",
        desc: "Push first element of each of K sorted lists into Min-Heap with pointer. Pop min, push next element from that list."
      }
    ],
    complexities: [
      { operation: "Insert / Extract Min-Max", time: "O(log N)", space: "O(N)" },
      { operation: "Get Min-Max", time: "O(1)", space: "O(N)" },
      { operation: "Build Heap (Heapify)", time: "O(N)", space: "O(1)" }
    ],
    strategy: "For K-th smallest, use Max-Heap. For K-th largest, use Min-Heap of size K."
  },

  10: {
    title: "10. Greedy Approach",
    summary: "Makes the locally optimal choice at each step with the assumption that local optimums lead to a global optimal solution.",
    patterns: [
      {
        name: "Sorting + Greedy Choice",
        desc: "Sort items by key criteria (e.g. finish time, ratio `value/weight`, deadline) then greedily pick items."
      },
      {
        name: "Interval Scheduling / N Meetings",
        desc: "Sort intervals by end time. Pick meeting if start time >= end time of last picked meeting."
      },
      {
        name: "Jump Game & Reachability",
        desc: "Maintain `maxReachable` index. Iterate through array updating `maxReachable = max(maxReachable, i + nums[i])`."
      }
    ],
    complexities: [
      { operation: "Greedy Choice + Sorting", time: "O(N log N)", space: "O(1) or O(N)" }
    ],
    strategy: "Always verify if greedy choice holds. If counterexamples exist, fallback to Dynamic Programming."
  },

  11: {
    title: "11. Binary Trees",
    summary: "Hierarchical structure where every node has at most two children (`left` and `right`).",
    patterns: [
      {
        name: "Depth-First Traversals (DFS)",
        desc: "Preorder (Root-Left-Right), Inorder (Left-Root-Right), Postorder (Left-Right-Root)."
      },
      {
        name: "Breadth-First Traversal (BFS / Level Order)",
        desc: "Use a Queue to process tree level by level. Ideal for shortest path or level-wise operations."
      },
      {
        name: "Tree Height & Diameter Pattern",
        desc: "Compute height recursively: `1 + max(height(left), height(right))`. Track maximum `left_height + right_height` for diameter."
      },
      {
        name: "Lowest Common Ancestor (LCA)",
        desc: "If root matches node `p` or `q`, return root. Recursively search left and right. If both return non-null, root is LCA."
      }
    ],
    complexities: [
      { operation: "Tree Traversal (DFS/BFS)", time: "O(N)", space: "O(H) recursion stack / O(W) queue" }
    ],
    strategy: "Most tree problems are solved using recursion. Ask: 'What information do I need from my left and right subtrees?'"
  },

  12: {
    title: "12. Binary Search Trees",
    summary: "Binary Tree property: `left.val < node.val < right.val`. Inorder traversal yields strictly sorted numbers.",
    patterns: [
      {
        name: "BST Search & Insertion",
        desc: "If `val < node.val`, search left. If `val > node.val`, search right. Takes O(H) time."
      },
      {
        name: "BST Validation (Range Check)",
        desc: "Validate node using `min_val < node.val < max_val`. Pass range down recursively."
      },
      {
        name: "Kth Smallest / Inorder Traversal",
        desc: "Perform Inorder traversal (Left-Root-Right) and decrement K at each step."
      }
    ],
    complexities: [
      { operation: "Search / Insert / Delete in Balanced BST", time: "O(log N)", space: "O(H)" },
      { operation: "Search / Insert in Skewed BST", time: "O(N)", space: "O(N)" }
    ],
    strategy: "Leverage the sorted property of Inorder traversal whenever solving BST problems."
  },

  13: {
    title: "13. Graphs",
    summary: "Collection of Vertices (V) connected by Edges (E). Represented as Adjacency Matrix or Adjacency List.",
    patterns: [
      {
        name: "BFS & Connected Components",
        desc: "Queue-based traversal. Visits neighbors level by level. Finds shortest path in unweighted graphs."
      },
      {
        name: "DFS & Cycle Detection",
        desc: "Stack/recursive traversal. Detects cycles using visited & path visited arrays (or color states)."
      },
      {
        name: "Topological Sort (Kahn's Algorithm)",
        desc: "For Directed Acyclic Graphs (DAG). Track indegrees. Push 0-indegree nodes to Queue. Decrement neighbor indegrees."
      },
      {
        name: "Shortest Path (Dijkstra & Bellman-Ford)",
        desc: "Dijkstra: Min-Heap for non-negative weights O(E log V). Bellman-Ford: Relaxes all edges V-1 times, handles negative edges."
      },
      {
        name: "Disjoint Set Union (DSU / Union-Find)",
        desc: "Find parent with Path Compression and Union by Rank/Size in O(alpha(N)) amortized O(1) time."
      }
    ],
    complexities: [
      { operation: "BFS / DFS Traversal", time: "O(V + E)", space: "O(V)" },
      { operation: "Dijkstra Algorithm", time: "O(E log V)", space: "O(V)" },
      { operation: "Floyd-Warshall (All Pairs)", time: "O(V^3)", space: "O(V^2)" }
    ],
    strategy: "Identify graph type (Directed vs Undirected, Weighted vs Unweighted, Cyclic vs DAG). Use DSU for dynamic connectivity."
  },

  14: {
    title: "14. Dynamic Programming",
    summary: "Optimization method for recursive problems possessing (1) Overlapping Subproblems and (2) Optimal Substructure.",
    patterns: [
      {
        name: "1D / 2D Grid DP",
        desc: "Define `dp[i][j]` as optimal answer for subproblem at grid position `(i, j)`. Build table from base cases."
      },
      {
        name: "Subsets & Knapsack Pattern",
        desc: "At index `i` with capacity `w`: `dp[i][w] = max(dp[i-1][w], val[i] + dp[i-1][w-wt[i]])`."
      },
      {
        name: "DP on Strings (LCS & Edit Distance)",
        desc: "If `s1[i] == s2[j]`: `dp[i][j] = 1 + dp[i-1][j-1]`. Else: `max(dp[i-1][j], dp[i][j-1])`."
      },
      {
        name: "Matrix Chain Multiplication (MCM) / Partition DP",
        desc: "Loop partition index `k` from `i` to `j-1`. Solve `solve(i, k) + solve(k+1, j) + cost`."
      }
    ],
    complexities: [
      { operation: "Top-Down Memoization", time: "O(States * Transitions)", space: "O(States) + O(Recursion Depth)" },
      { operation: "Bottom-Up Tabulation", time: "O(States * Transitions)", space: "O(States) [Can be space-optimized to O(1 row)]" }
    ],
    strategy: "1. Define DP state `dp[i]`. 2. Express base cases. 3. Write transition recurrence relation. 4. Optimize space by storing only previous rows."
  },

  15: {
    title: "15. Tries (Prefix Trees)",
    summary: "Tree structure storing characters at nodes. Provides superfast O(L) prefix search and word insertion.",
    patterns: [
      {
        name: "Standard Trie Node Structure",
        desc: "Each node contains `TrieNode* children[26]` and `bool isEndOfWord` (or word count)."
      },
      {
        name: "Prefix Search (startsWith)",
        desc: "Traverse child pointer for each character. If pointer is null, prefix doesn't exist."
      },
      {
        name: "Bitwise Trie for Maximum XOR",
        desc: "Store binary representation (31 bits). For each bit of target number, try to traverse opposite bit (`1-bit`) to maximize XOR sum."
      }
    ],
    complexities: [
      { operation: "Insert / Search / StartsWith", time: "O(L) where L is string length", space: "O(N * L * 26)" }
    ],
    strategy: "Use Tries whenever dealing with prefix lookups, dictionary word autocomplete, or Bitwise Maximum XOR queries."
  },

  16: {
    title: "16. Strings (Hard)",
    summary: "Advanced string pattern matching and string analysis algorithms.",
    patterns: [
      {
        name: "KMP Algorithm (LPS Array)",
        desc: "Constructs Longest Prefix Suffix (LPS) array in O(M) time. Enables string matching in O(N) time without back-tracking text pointer."
      },
      {
        name: "Z-Algorithm",
        desc: "Constructs Z-array where `Z[i]` is length of longest substring starting at `i` matching prefix of string. Matches pattern in O(N + M)."
      },
      {
        name: "Rabin-Karp Rolling Hash",
        desc: "Calculates hash value of pattern and current window substring using modular arithmetic. Avoids character comparison unless hashes match."
      }
    ],
    complexities: [
      { operation: "KMP Pattern Matching", time: "O(N + M)", space: "O(M) for LPS array" },
      { operation: "Z-Algorithm Pattern Search", time: "O(N + M)", space: "O(N + M) for Z-array" }
    ],
    strategy: "For linear time pattern matching without quadratic worst-case fallback, implement KMP (LPS array) or Z-algorithm."
  }
}
