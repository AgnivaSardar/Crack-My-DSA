export const dsaTheoryData = {
  1: {
    title: "01. Arrays",
    summary: "Arrays are contiguous memory blocks storing elements of identical data type. Index-based access is O(1), but searching in unsorted arrays or inserting/deleting elements at arbitrary positions requires shifting elements, leading to O(N) time.",
    basics: [
      {
        op: "1. Memory Layout & Indexing",
        detail: "Elements are allocated sequentially in contiguous RAM addresses: `Address(i) = BaseAddress + (i * ElementSize)`. Because the memory offset is mathematically computed directly, accessing `arr[i]` takes instant O(1) time regardless of array size."
      },
      {
        op: "2. Traversal",
        detail: "Iterating through all N elements sequentially from index `0` to `N-1`. Time Complexity: O(N) | Space Complexity: O(1)."
      },
      {
        op: "3. Insertion Operations",
        detail: "• At End: O(1) amortized (if capacity available).\n• At Beginning: O(N) time because all existing N elements must be shifted 1 position to the right.\n• At Arbitrary Index k: O(N) time because (N - k) elements must be shifted right."
      },
      {
        op: "4. Deletion Operations",
        detail: "• From End: O(1) time by decrementing size.\n• From Beginning: O(N) time because all elements must be shifted 1 position to the left.\n• From Arbitrary Index k: O(N) time because (N - k - 1) elements must be shifted left to fill the gap."
      }
    ],
    patterns: [
      {
        name: "1. Two Pointers Pattern",
        explanation: "Uses two pointer variables (e.g. left/right or slow/fast) traversing the array towards each other or in the same direction to solve range or pair problems in O(N) linear time and O(1) auxiliary space.",
        approach: "1. Place pointers at strategic starting locations (e.g. `left = 0`, `right = N - 1`).\n2. Evaluate condition at current pointers (e.g. `arr[left] + arr[right] == target`).\n3. Increment `left` or decrement `right` based on comparison logic until pointers meet or cross.",
        timeComplexity: "O(N) single pass traversal",
        spaceComplexity: "O(1) auxiliary memory",
        whenToApply: "Sorted arrays, pair sum targets, reversing arrays, or in-place element removals.",
        whenNotToApply: "Unsorted arrays where sorting destroys original index positions needed by output, or when non-contiguous random elements must be accessed."
      },
      {
        name: "2. Prefix Sum & Difference Array",
        explanation: "Precomputes running cumulative sums in an auxiliary array (`prefix[i] = prefix[i-1] + arr[i]`) so that any range sum query between indices L and R can be computed in O(1) time.",
        approach: "1. Construct `prefix` array where `prefix[0] = arr[0]` and `prefix[i] = prefix[i-1] + arr[i]`.\n2. For any range `[L, R]`, return `prefix[R] - prefix[L-1]` (handling L = 0 boundary).\n3. Difference array: To apply range updates `+val` from `L` to `R`, set `diff[L] += val` and `diff[R+1] -= val`, then compute prefix sums at end.",
        timeComplexity: "O(N) precomputation, O(1) per range sum query",
        spaceComplexity: "O(N) for prefix array storage",
        whenToApply: "Static arrays with frequent range sum queries or multiple range updates.",
        whenNotToApply: "Dynamic arrays with frequent individual element updates between queries, as recomputing prefix sums takes O(N)."
      },
      {
        name: "3. Kadane's Algorithm (Maximum Subarray Sum)",
        explanation: "Dynamic programming approach that calculates maximum subarray sum in a single O(N) pass by maintaining a running current sum and deciding whether to extend the existing subarray or start a new one.",
        approach: "1. Initialize `max_sum = -INF` and `curr_sum = 0`.\n2. Iterate through each element `x` in array:\n   - `curr_sum += x`\n   - Update `max_sum = max(max_sum, curr_sum)`\n   - If `curr_sum < 0`, reset `curr_sum = 0`.\n3. Return `max_sum`.",
        timeComplexity: "O(N) single pass",
        spaceComplexity: "O(1) auxiliary space",
        whenToApply: "Finding contiguous subarray with maximum/minimum sum in 1D array.",
        whenNotToApply: "When non-contiguous elements (subsequences) are required, or when negative numbers are not allowed to be reset."
      },
      {
        name: "4. Boyer-Moore Voting Algorithm",
        explanation: "Efficiently finds the majority element (element appearing more than N/2 times) in O(N) time and O(1) space by maintaining a candidate and a counter.",
        approach: "1. Initialize `candidate = None` and `count = 0`.\n2. Iterate through array:\n   - If `count == 0`, set `candidate = arr[i]`.\n   - If `arr[i] == candidate`, `count++`, else `count--`.\n3. Verify if candidate appears > N/2 times in a second pass if presence isn't guaranteed.",
        timeComplexity: "O(N) time",
        spaceComplexity: "O(1) space",
        whenToApply: "Finding majority element that appears > N/2 times (or > N/3 times with two candidates).",
        whenNotToApply: "When looking for general element frequencies or mode in an arbitrary distribution with no guaranteed majority."
      },
      {
        name: "5. Dutch National Flag Algorithm (3-Pointer Partition)",
        explanation: "Sorts an array containing three distinct values (e.g. 0s, 1s, 2s) in a single pass O(N) time and O(1) space using three pointers (`low`, `mid`, `high`).",
        approach: "1. Initialize `low = 0`, `mid = 0`, `high = N - 1`.\n2. While `mid <= high`:\n   - If `arr[mid] == 0`: Swap `arr[low]` and `arr[mid]`, increment `low++` and `mid++`.\n   - If `arr[mid] == 1`: Increment `mid++`.\n   - If `arr[mid] == 2`: Swap `arr[mid]` and `arr[high]`, decrement `high--`.",
        timeComplexity: "O(N) single pass",
        spaceComplexity: "O(1) in-place",
        whenToApply: "Partitioning array into 3 distinct categories or sorting arrays with 3 unique elements.",
        whenNotToApply: "General sorting of arbitrary continuous numbers (use QuickSort/MergeSort)."
      }
    ],
    complexities: [
      { operation: "Access by Index", time: "O(1)", space: "O(1)" },
      { operation: "Linear Search", time: "O(N)", space: "O(1)" },
      { operation: "Insertion / Deletion at End", time: "O(1) amortized", space: "O(1)" },
      { operation: "Insertion / Deletion at Start / Middle", time: "O(N)", space: "O(1)" }
    ],
    strategy: "When tackling Array problems: 1. Check if sorted -> consider Two Pointers or Binary Search. 2. Subarray problem -> consider Kadane's, Prefix Sum, or Sliding Window. 3. Frequency/Duplicate -> consider Hash Map or In-Place Index Marking."
  },

  2: {
    title: "02. Binary Search",
    summary: "Binary Search is a divide-and-conquer algorithm for finding a target in a sorted array or monotonic search space. At each step, it compares target with the middle element and eliminates half of the remaining elements, achieving O(log N) time.",
    basics: [
      {
        op: "1. Search Space Monotonicity",
        detail: "Binary Search requires the underlying domain to be monotonic (strictly increasing, decreasing, or boolean YES/NO threshold). If `arr[mid]` is less than `target`, all elements to the left of `mid` can be safely eliminated."
      },
      {
        op: "2. Midpoint Calculation",
        detail: "Calculate `mid = low + (high - low) / 2` to prevent integer overflow that occurs with `(low + high) / 2` when values exceed 2^31 - 1."
      },
      {
        op: "3. Boundary Maintenance",
        detail: "• Loop condition: `while (low <= high)` for standard search.\n• Range reduction: `low = mid + 1` or `high = mid - 1` to prevent infinite loops."
      }
    ],
    patterns: [
      {
        name: "1. Classic Binary Search",
        explanation: "Reduces search boundary iteratively by evaluating middle element.",
        approach: "1. Set `low = 0`, `high = N - 1`.\n2. While `low <= high`:\n   - `mid = low + (high - low) / 2`\n   - If `arr[mid] == target`: return `mid`.\n   - Else if `arr[mid] < target`: `low = mid + 1`.\n   - Else: `high = mid - 1`.\n3. Return `-1` if not found.",
        timeComplexity: "O(log N)",
        spaceComplexity: "O(1) iterative",
        whenToApply: "Searching target in strictly sorted 1D or 2D array.",
        whenNotToApply: "Unsorted arrays where sorting takes O(N log N) which exceeds linear scan."
      },
      {
        name: "2. Lower Bound & Upper Bound Pattern",
        explanation: "Lower Bound finds first index where `arr[index] >= target`. Upper Bound finds first index where `arr[index] > target`.",
        approach: "1. Set `ans = N`, `low = 0`, `high = N - 1`.\n2. While `low <= high`:\n   - If `arr[mid] >= target`: `ans = mid`, `high = mid - 1` (search left for earlier boundary).\n   - Else: `low = mid + 1`.\n3. Return `ans`.",
        timeComplexity: "O(log N)",
        spaceComplexity: "O(1)",
        whenToApply: "Finding boundary indices, counting duplicate element frequencies in sorted array.",
        whenNotToApply: "Non-monotonic distributions."
      },
      {
        name: "3. Search in Rotated Sorted Array",
        explanation: "Determines which half (left or right) is sorted at `mid`, then checks if target lies within sorted boundaries.",
        approach: "1. Find `mid = low + (high - low) / 2`.\n2. Check if `arr[low] <= arr[mid]` (Left half is sorted):\n   - If `arr[low] <= target < arr[mid]`: `high = mid - 1`, else `low = mid + 1`.\n3. Else (Right half is sorted):\n   - If `arr[mid] < target <= arr[high]`: `low = mid + 1`, else `high = mid - 1`.",
        timeComplexity: "O(log N)",
        spaceComplexity: "O(1)",
        whenToApply: "Rotated sorted arrays with distinct or duplicate values.",
        whenNotToApply: "Array with duplicate values where `arr[low] == arr[mid] == arr[high]` (requires `low++`, `high--` fallback giving O(N) worst case)."
      },
      {
        name: "4. Binary Search on Answer Space (Minimax / Maximin)",
        explanation: "Used when searching for optimal answer `X` within a continuous numeric range `[min_possible, max_possible]` where feasibility function `isPossible(X)` is monotonic.",
        approach: "1. Define range `low = min_val`, `high = max_val`.\n2. While `low <= high`:\n   - Test `mid = low + (high - low) / 2` with helper `isPossible(mid)`.\n   - If valid: Save `ans = mid`, adjust boundary to find better candidate.\n   - If invalid: Adjust boundary to valid side.\n3. Return `ans`.",
        timeComplexity: "O(N * log(range))",
        spaceComplexity: "O(1)",
        whenToApply: "Problems asking to 'minimize the maximum' or 'maximize the minimum' (e.g. Koko Eating Bananas, Book Allocation, Painter Partition).",
        whenNotToApply: "When feasibility function `isPossible(X)` is non-monotonic."
      }
    ],
    complexities: [
      { operation: "Binary Search 1D", time: "O(log N)", space: "O(1)" },
      { operation: "Binary Search 2D Matrix", time: "O(log(M * N))", space: "O(1)" }
    ],
    strategy: "Identify monotonic properties. If array is sorted or if answer domain has a clear boolean YES/NO threshold, use Binary Search."
  },

  3: {
    title: "03. Strings",
    summary: "Strings are sequences of characters stored as character arrays.",
    basics: [
      {
        op: "1. Mutability Differences",
        detail: "In C++, `std::string` is mutable and allows O(1) character modification. In Java/Python, strings are immutable, meaning string concatenation in loops takes O(N^2) time unless using `StringBuilder`."
      },
      {
        op: "2. ASCII & Unicode Encoding",
        detail: "Standard ASCII uses 8-bit codepoints (0-255). Lowercase letters `'a'` to `'z'` map to 97 to 122. Index offset formula: `index = ch - 'a'`."
      }
    ],
    patterns: [
      {
        name: "1. Character Frequency Array Pattern",
        explanation: "Uses fixed-size array of 26 (lowercase) or 256 (ASCII) to count character occurrences in O(N) time and O(1) space.",
        approach: "1. Initialize `freq[26] = {0}`.\n2. Iterate through string: `freq[ch - 'a']++`.\n3. Use frequency array for anagram checks, palindrome construction, or character matching.",
        timeComplexity: "O(N)",
        spaceComplexity: "O(1) auxiliary space",
        whenToApply: "Anagram checking, character counting, string permutation validation.",
        whenNotToApply: "When character set contains arbitrary Unicode codepoints across huge ranges (use Hash Map instead)."
      },
      {
        name: "2. KMP Pattern Matching Algorithm (LPS Array)",
        explanation: "Avoids redundant backtracking in pattern matching by precomputing Longest Prefix Suffix (LPS) array.",
        approach: "1. Build `lps` array of pattern `P` where `lps[i]` is length of longest proper prefix that is also suffix for `P[0..i]`.\n2. Scan text `T` with pointer `i` and pattern `P` with pointer `j`.\n3. On mismatch, set `j = lps[j-1]` without decrementing `i`.",
        timeComplexity: "O(N + M) linear time",
        spaceComplexity: "O(M) for LPS array",
        whenToApply: "Exact pattern searching in long text strings without quadratic worst case.",
        whenNotToApply: "Simple single character searches or small fixed length substring lookups."
      }
    ],
    complexities: [
      { operation: "Character Access", time: "O(1)", space: "O(1)" },
      { operation: "KMP Pattern Search", time: "O(N + M)", space: "O(M)" }
    ],
    strategy: "Use Frequency Arrays for anagrams. Use Two Pointers for palindromes. Use KMP or Z-algorithm for linear pattern matching."
  },

  4: {
    title: "04. Linked List",
    summary: "Non-contiguous linear structure linked via pointers. Allows O(1) dynamic insertions/deletions at known nodes.",
    basics: [
      {
        op: "1. Node Architecture",
        detail: "Each node contains data payload and pointer to next node: `struct ListNode { int val; ListNode* next; }`. Doubly Linked Lists include `prev` pointer."
      },
      {
        op: "2. Insertion Operations",
        detail: "• At Head: `newNode->next = head; head = newNode;` -> O(1) time.\n• At Tail: Traverse to end `O(N)` or use tail pointer `O(1)`, then `tail->next = newNode`.\n• At Known Node p: `newNode->next = p->next; p->next = newNode;` -> O(1) time."
      },
      {
        op: "3. Deletion Operations",
        detail: "• At Head: `temp = head; head = head->next; delete temp;` -> O(1) time.\n• At Known Node p: `temp = p->next; p->next = p->next->next; delete temp;` -> O(1) time."
      }
    ],
    patterns: [
      {
        name: "1. Floyd's Cycle Detection (Tortoise and Hare)",
        explanation: "Detects cycles and finds cycle starting node using fast (2 steps) and slow (1 step) pointers.",
        approach: "1. Initialize `slow = head`, `fast = head`.\n2. Move `slow = slow.next`, `fast = fast.next.next`.\n3. If `slow == fast`, cycle exists.\n4. To find start: Reset `slow = head`. Move both `slow` and `fast` 1 step at a time; meeting node is cycle start.",
        timeComplexity: "O(N)",
        spaceComplexity: "O(1)",
        whenToApply: "Detecting loops, finding cycle start node, finding middle node.",
        whenNotToApply: "Arrays or trees where child links are explicit."
      },
      {
        name: "2. Dummy Head Sentinel Pattern",
        explanation: "Creates a temporary sentinel node before `head` to eliminate edge cases when modifying or removing the real head node.",
        approach: "1. `dummy = new ListNode(0); dummy.next = head`.\n2. Perform list operations using `curr = dummy`.\n3. Return `dummy.next` as new head.",
        timeComplexity: "O(1) setup",
        spaceComplexity: "O(1)",
        whenToApply: "Merging lists, removing head/nodes, partition operations.",
        whenNotToApply: "Read-only traversals."
      }
    ],
    complexities: [
      { operation: "Insertion at Head", time: "O(1)", space: "O(1)" },
      { operation: "Traversal / Access", time: "O(N)", space: "O(1)" }
    ],
    strategy: "Dummy heads eliminate 90% of null pointer bugs. Fast & Slow pointers solve cycle and middle node problems cleanly."
  },

  5: {
    title: "05. Recursion",
    summary: "Function calling itself to break down problems into base cases and subproblems.",
    basics: [
      {
        op: "1. Call Stack Execution",
        detail: "Each recursive function call pushes a frame onto system call stack storing parameters, local variables, and return address. Maximum depth equals stack memory."
      },
      {
        op: "2. Base Case & Unwinding",
        detail: "Base cases stop infinite recursion and start unwinding return values back up the call stack."
      }
    ],
    patterns: [
      {
        name: "1. Pick / Non-Pick Pattern (Subsequence / Subset)",
        explanation: "Explores all 2^N subsets by deciding whether to include or exclude each element.",
        approach: "1. Base Case: `if (index == N)` process current subset and return.\n2. Pick: Add `arr[index]`, recurse `solve(index + 1)`.\n3. Backtrack: Remove `arr[index]`.\n4. Non-Pick: Recurse `solve(index + 1)`.",
        timeComplexity: "O(2^N)",
        spaceComplexity: "O(N) stack",
        whenToApply: "Generating all subsets, combination sums, power set.",
        whenNotToApply: "When N > 25 (requires Dynamic Programming or Greedy)."
      }
    ],
    complexities: [
      { operation: "Subsets Generation", time: "O(2^N)", space: "O(N)" }
    ],
    strategy: "Identify (1) Base Case, (2) Work done in current call, (3) Subproblem recursive calls."
  },

  6: {
    title: "06. Bit Manipulation",
    summary: "Manipulates binary bits directly using bitwise operators (`&`, `|`, `^`, `~`, `<<`, `>>`).",
    basics: [
      {
        op: "1. Binary Representation",
        detail: "Numbers stored in 32-bit or 64-bit 2's complement binary form. Sign bit is most significant bit (MSB)."
      }
    ],
    patterns: [
      {
        name: "1. Bit Manipulation Formulas",
        explanation: "Direct bit arithmetic for checking, setting, and clearing bits.",
        approach: "Check bit k: `(n & (1 << k)) != 0` | Set bit k: `n | (1 << k)` | Clear bit k: `n & ~(1 << k)` | Clear lowest bit: `n & (n - 1)`.",
        timeComplexity: "O(1)",
        spaceComplexity: "O(1)",
        whenToApply: "Bitmasks, set representation, single number lookup.",
        whenNotToApply: "Floating point or large multi-precision numbers exceeding bit length."
      }
    ],
    complexities: [
      { operation: "Bitwise Operators", time: "O(1)", space: "O(1)" }
    ],
    strategy: "Remember operator precedence and always wrap bitwise expressions in parentheses."
  },

  7: {
    title: "07. Stack and Queues",
    summary: "Stack (LIFO) and Queue (FIFO) linear data structures.",
    basics: [
      {
        op: "1. Stack Mechanics (LIFO)",
        detail: "Last-In-First-Out. Operations: `push(x)` at top, `pop()` from top, `top()` / `peek()` in O(1) time."
      },
      {
        op: "2. Queue Mechanics (FIFO)",
        detail: "First-In-First-Out. Operations: `enqueue(x)` at rear, `dequeue()` from front in O(1) time."
      }
    ],
    patterns: [
      {
        name: "1. Monotonic Stack Pattern",
        explanation: "Maintains elements in strictly increasing/decreasing order to find Next Greater / Smaller Element in O(N) total time.",
        approach: "1. Traverse array.\n2. While `stack` not empty and `arr[i] > stack.top()`: Pop element and record `arr[i]` as its next greater element.\n3. Push `arr[i]` to stack.",
        timeComplexity: "O(N)",
        spaceComplexity: "O(N)",
        whenToApply: "Next Greater Element, Next Smaller Element, Histogram Area, Stock Span.",
        whenNotToApply: "Random index access problems."
      }
    ],
    complexities: [
      { operation: "Push / Pop", time: "O(1)", space: "O(N)" }
    ],
    strategy: "For Next Greater/Smaller Element, use Monotonic Stack immediately."
  },

  8: {
    title: "08. Sliding Window",
    summary: "Transforms O(N^2) subarray checks into O(N) linear scans using expanding and shrinking boundaries.",
    basics: [
      {
        op: "1. Window Mechanics",
        detail: "Maintains contiguous range `[left, right]`. `right` expands window by 1 element, `left` shrinks window when constraint is violated."
      }
    ],
    patterns: [
      {
        name: "1. Variable Size Sliding Window",
        explanation: "Expand `right` pointer to include elements, shrink `left` when window condition is violated.",
        approach: "1. Set `left = 0`.\n2. Loop `right` from 0 to N-1:\n   - Add `arr[right]` to window state.\n   - While window condition invalid: Remove `arr[left]` from state, `left++`.\n   - Update max/min window result.",
        timeComplexity: "O(N)",
        spaceComplexity: "O(1) or O(K)",
        whenToApply: "Subarray / Substring problems asking for longest/shortest window under constraints.",
        whenNotToApply: "Arrays containing negative numbers where window sum is non-monotonic (use Hash Map + Prefix Sum)."
      }
    ],
    complexities: [
      { operation: "Window Traversal", time: "O(N)", space: "O(1)" }
    ],
    strategy: "If non-negative elements and subarray condition is monotonic, use Sliding Window."
  },

  9: {
    title: "09. Heaps",
    summary: "Tree structure with O(1) access to min/max and O(log N) insertion/deletion.",
    basics: [
      {
        op: "1. Heap Array Storage",
        detail: "Complete binary tree stored as flat array. For index i: `left_child = 2i + 1`, `right_child = 2i + 2`, `parent = (i - 1) / 2`."
      }
    ],
    patterns: [
      {
        name: "1. Top K Elements Pattern",
        explanation: "Use Min-Heap of size K to find K largest elements in O(N log K) time.",
        approach: "1. Maintain Min-Heap.\n2. Push element `x` into heap.\n3. If `heap.size() > K`, pop smallest.\n4. Top of heap holds K-th largest element.",
        timeComplexity: "O(N log K)",
        spaceComplexity: "O(K)",
        whenToApply: "K-th largest/smallest, Top K Frequent elements.",
        whenNotToApply: "When full array sorting is needed."
      }
    ],
    complexities: [
      { operation: "Insert / Extract Min-Max", time: "O(log N)", space: "O(N)" }
    ],
    strategy: "For K-th largest, use Min-Heap of size K."
  },

  10: {
    title: "10. Greedy Approach",
    summary: "Makes locally optimal choice at each step hoping for global optimum.",
    basics: [
      {
        op: "1. Greedy Choice Property",
        detail: "Locally optimal choice leads to globally optimal solution without backtracking."
      }
    ],
    patterns: [
      {
        name: "1. Interval Scheduling",
        explanation: "Sort by finish times to maximize non-overlapping meetings.",
        approach: "1. Sort intervals by `end_time`.\n2. Pick first interval.\n3. For next intervals, pick if `start >= last_end_time`.",
        timeComplexity: "O(N log N)",
        spaceComplexity: "O(1)",
        whenToApply: "Activity selection, N meetings in one room.",
        whenNotToApply: "When local choice compromises global optimum (use DP)."
      }
    ],
    complexities: [
      { operation: "Greedy Choice + Sorting", time: "O(N log N)", space: "O(1)" }
    ],
    strategy: "Verify greedy choice property before applying."
  },

  11: {
    title: "11. Binary Trees",
    summary: "Hierarchical tree structure where nodes have at most 2 children.",
    basics: [
      {
        op: "1. Node Architecture",
        detail: "`struct TreeNode { int val; TreeNode* left; TreeNode* right; }`."
      },
      {
        op: "2. Traversal Mechanics",
        detail: "• Preorder: Root -> Left -> Right\n• Inorder: Left -> Root -> Right\n• Postorder: Left -> Right -> Root\n• Level Order: BFS using Queue level by level."
      }
    ],
    patterns: [
      {
        name: "1. Tree Height & Diameter Pattern",
        explanation: "Compute height recursively and track max `left_height + right_height`.",
        approach: "1. Helper returns height `1 + max(lh, rh)`.\n2. Global `max_diameter = max(max_diameter, lh + rh)`.",
        timeComplexity: "O(N)",
        spaceComplexity: "O(H)",
        whenToApply: "Tree height, diameter, path sum.",
        whenNotToApply: "Non-tree graph structures with cycles."
      }
    ],
    complexities: [
      { operation: "DFS / BFS Traversal", time: "O(N)", space: "O(H)" }
    ],
    strategy: "Use recursion to ask what left and right subtrees return."
  },

  12: {
    title: "12. Binary Search Trees",
    summary: "Binary Tree where `left < node < right`. Inorder traversal yields sorted order.",
    basics: [
      {
        op: "1. BST Inorder Property",
        detail: "Inorder traversal of BST produces strictly sorted ascending values."
      }
    ],
    patterns: [
      {
        name: "1. BST Inorder Sorted Traversal",
        explanation: "Inorder traversal processes elements in strictly sorted ascending order.",
        approach: "1. Recurse `inorder(node.left)`.\n2. Process `node`.\n3. Recurse `inorder(node.right)`.",
        timeComplexity: "O(N)",
        spaceComplexity: "O(H)",
        whenToApply: "Validate BST, Kth smallest in BST, two sum in BST.",
        whenNotToApply: "Unbalanced trees (AVL/Red-Black needed)."
      }
    ],
    complexities: [
      { operation: "BST Search", time: "O(H) = O(log N) balanced", space: "O(H)" }
    ],
    strategy: "Leverage sorted Inorder property."
  },

  13: {
    title: "13. Graphs",
    summary: "Vertices and Edges structure representing networks and relationships.",
    basics: [
      {
        op: "1. Graph Representations",
        detail: "• Adjacency Matrix: `adj[V][V]` matrix. Space O(V^2), lookup O(1).\n• Adjacency List: `vector<int> adj[V]`. Space O(V + E), lookup O(deg(V))."
      }
    ],
    patterns: [
      {
        name: "1. Topological Sort (Kahn's Algorithm)",
        explanation: "Generates linear ordering of vertices in DAG using indegrees and BFS.",
        approach: "1. Calculate indegree of all vertices.\n2. Push 0-indegree nodes to Queue.\n3. While queue not empty: Pop `u`, add to topo list, decrement indegree of neighbors. If neighbor indegree becomes 0, push to Queue.",
        timeComplexity: "O(V + E)",
        spaceComplexity: "O(V)",
        whenToApply: "Course schedule, task dependency ordering, DAG cycle detection.",
        whenNotToApply: "Graphs containing cycles (Kahn's detects cycle if result size < V)."
      }
    ],
    complexities: [
      { operation: "BFS / DFS", time: "O(V + E)", space: "O(V)" },
      { operation: "Dijkstra", time: "O(E log V)", space: "O(V)" }
    ],
    strategy: "Identify graph representation and whether weights/cycles exist."
  },

  14: {
    title: "14. Dynamic Programming",
    summary: "Optimizes recursion by caching solutions to overlapping subproblems.",
    basics: [
      {
        op: "1. DP Principles",
        detail: "1. Overlapping Subproblems: Same subproblem solved multiple times.\n2. Optimal Substructure: Optimal solution constructed from optimal subproblem solutions."
      }
    ],
    patterns: [
      {
        name: "1. 0/1 Knapsack Pattern",
        explanation: "Subproblem choice: include or exclude item `i` with remaining capacity `w`.",
        approach: "1. `dp[i][w] = max(dp[i-1][w], val[i] + dp[i-1][w - wt[i]])`.\n2. Space optimize by iterating capacity backwards in 1D array.",
        timeComplexity: "O(N * W)",
        spaceComplexity: "O(W) 1D array",
        whenToApply: "Subset sum, partition equal subset, target sum, coin change.",
        whenNotToApply: "When capacity W is non-integer or extremely large (10^9)."
      }
    ],
    complexities: [
      { operation: "DP Tabulation", time: "O(States * Transitions)", space: "O(States)" }
    ],
    strategy: "Define state, base cases, and transition equation."
  },

  15: {
    title: "15. Tries",
    summary: "Tree structure storing character prefixes for fast string lookup.",
    basics: [
      {
        op: "1. Node Architecture",
        detail: "`struct TrieNode { TrieNode* children[26]; bool isEnd; }`."
      }
    ],
    patterns: [
      {
        name: "1. Prefix Tree Search & Insert",
        explanation: "Store character links in array of size 26 at each node.",
        approach: "1. `struct TrieNode { TrieNode* child[26]; bool isWord; }`.\n2. Insert: Traverse/create nodes for each character of word.\n3. Search: Traverse nodes; return true if `isWord` is true at end.",
        timeComplexity: "O(L) where L is word length",
        spaceComplexity: "O(N * L * 26)",
        whenToApply: "Autocomplete, prefix matching, word search dictionary.",
        whenNotToApply: "Simple single string equality checks."
      }
    ],
    complexities: [
      { operation: "Trie Insert / Search", time: "O(L)", space: "O(N * L * 26)" }
    ],
    strategy: "Use Tries for prefix-based string searches and Bitwise XOR maximum queries."
  },

  16: {
    title: "16. Strings (Hard)",
    summary: "Advanced string pattern matching and string transformation algorithms.",
    basics: [
      {
        op: "1. Advanced Matching Concepts",
        detail: "Linear time string matching algorithms avoid quadratic worst-case fallback using state arrays."
      }
    ],
    patterns: [
      {
        name: "1. KMP Algorithm (LPS Array)",
        explanation: "Avoids backtracking text pointer during pattern search by building LPS array.",
        approach: "1. Build `lps` array for pattern `P`.\n2. Scan text `T`. On mismatch, update `j = lps[j-1]` without rewinding text pointer.",
        timeComplexity: "O(N + M)",
        spaceComplexity: "O(M)",
        whenToApply: "Linear time exact pattern matching.",
        whenNotToApply: "Simple short string lookups."
      }
    ],
    complexities: [
      { operation: "KMP Pattern Match", time: "O(N + M)", space: "O(M)" }
    ],
    strategy: "Use KMP or Z-algorithm for O(N+M) guaranteed pattern matching."
  }
}
