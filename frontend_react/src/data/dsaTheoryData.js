export const dsaTheoryData = {
  1: {
    title: "01. Arrays",
    summary: "Arrays are contiguous memory blocks storing elements of identical data type. Index-based access takes O(1) time because memory offsets are mathematically computed. Inserting or deleting elements at arbitrary positions requires shifting elements, resulting in O(N) worst-case time.",
    topicVideo: {
      id: "8B_x4o8T1P8",
      title: "Arrays Data Structure & Memory Operations Tutorial",
      channel: "Abdul Bari",
      duration: "35 mins"
    },
    basics: [
      {
        op: "1. Memory Layout & Index Access",
        detail: "Elements are placed in contiguous memory locations. Address formula: `Address(i) = BaseAddress + (i * ElementSize)`.",
        code: "// Accessing element at index i\nint arr[5] = {10, 20, 30, 40, 50};\nint val = arr[2]; // O(1) time direct address lookup (val = 30)"
      },
      {
        op: "2. Linear Traversal",
        detail: "Iterating through all elements from index 0 to N-1 to read or update values.",
        code: "// Sequential Traversal\nfor (int i = 0; i < n; i++) {\n    cout << arr[i] << \" \";\n}\n// Time: O(N) | Space: O(1)"
      },
      {
        op: "3. Insertion (Start, End, & Arbitrary Position k)",
        detail: "Inserting at the end is O(1) amortized. Inserting at index k requires shifting all subsequent elements right by 1 position.",
        code: "// Insert element 'val' at index 'k'\nfor (int i = n; i > k; i--) {\n    arr[i] = arr[i - 1]; // Shift elements right\n}\narr[k] = val;\nn++;\n// Time: O(N) due to shifting"
      },
      {
        op: "4. Deletion (Start, End, & Arbitrary Position k)",
        detail: "Deleting at the end is O(1). Deleting from index k requires shifting all subsequent elements left by 1 position to fill the gap.",
        code: "// Delete element at index 'k'\nfor (int i = k; i < n - 1; i++) {\n    arr[i] = arr[i + 1]; // Shift elements left\n}\nn--;\n// Time: O(N) due to shifting"
      }
    ],
    patterns: [
      {
        name: "1. Two Pointers Pattern",
        video: {
          id: "gCfcfAsRwfY",
          title: "Two Pointer Technique - Two Sum Solution",
          channel: "NeetCode",
          duration: "14 mins"
        },
        explanation: "Uses two pointer variables (`left` and `right`) traversing the array towards each other or in tandem to eliminate nested O(N^2) loops into a single O(N) pass.",
        code: "int left = 0, right = n - 1;\nwhile (left < right) {\n    int sum = arr[left] + arr[right];\n    if (sum == target) return {left, right};\n    else if (sum < target) left++; // Increase sum\n    else right--; // Decrease sum\n}",
        codeWalkthrough: "• Line 1: Place left at index 0 and right at last index n-1.\n• Line 2: Continue while pointers have not met.\n• Line 4-6: If current sum is smaller than target, advance left pointer to get a larger value. If sum is greater, decrement right pointer to get a smaller value.",
        approach: "1. Initialize `left = 0`, `right = N - 1`.\n2. Calculate current metric at `(left, right)`.\n3. Adjust pointers based on sorting logic until pointers meet.",
        timeComplexity: "O(N) single pass",
        spaceComplexity: "O(1) auxiliary space",
        whenToApply: "Sorted arrays, pair sum targets, reversing arrays, or in-place element removals.",
        whenNotToApply: "Unsorted arrays where sorting destroys original index positions required by problem statement."
      },
      {
        name: "2. Prefix Sum & Difference Array",
        video: {
          id: "kQ-8yRUk11A",
          title: "Prefix Sum Array & Range Query Applications",
          channel: "Kunal Kushwaha",
          duration: "16 mins"
        },
        explanation: "Precomputes running cumulative sums (`prefix[i] = prefix[i-1] + arr[i]`) to answer range sum queries `[L, R]` in O(1) constant time.",
        code: "// Build Prefix Sum Array\nvector<int> prefix(n);\nprefix[0] = arr[0];\nfor (int i = 1; i < n; i++) {\n    prefix[i] = prefix[i - 1] + arr[i];\n}\n// Query range sum [L, R] in O(1)\nint rangeSum = (L == 0) ? prefix[R] : (prefix[R] - prefix[L - 1]);",
        codeWalkthrough: "• Line 3-5: Build running sum where prefix[i] stores sum of arr[0...i].\n• Line 7: Range sum from L to R is calculated by subtracting prefix[L-1] from prefix[R].",
        approach: "1. Construct `prefix` array in O(N) precomputation.\n2. For query `(L, R)`, return `prefix[R] - prefix[L-1]` in O(1).",
        timeComplexity: "O(N) precomputation, O(1) per query",
        spaceComplexity: "O(N) space for prefix array",
        whenToApply: "Frequent range sum queries on static arrays.",
        whenNotToApply: "Dynamic arrays with frequent element updates between queries."
      },
      {
        name: "3. Kadane's Algorithm (Maximum Subarray Sum)",
        video: {
          id: "AHZpyENo7k4",
          title: "Kadane's Algorithm | Maximum Subarray Sum | Finding and Printing",
          channel: "take U forward",
          duration: "20 mins"
        },
        explanation: "Dynamic programming method that finds maximum subarray sum in O(N) time by deciding at each element whether to extend the current subarray or start a new subarray.",
        code: "int max_sum = INT_MIN, curr_sum = 0;\nfor (int i = 0; i < n; i++) {\n    curr_sum += arr[i];\n    max_sum = max(max_sum, curr_sum);\n    if (curr_sum < 0) {\n        curr_sum = 0; // Reset negative sum\n    }\n}",
        codeWalkthrough: "• Line 3: Add current element to running subarray sum.\n• Line 4: Update global maximum sum.\n• Line 5-7: If running sum becomes negative, reset it to 0 because a negative sum will only diminish subsequent subarray sums.",
        approach: "1. Track `curr_sum` and `max_sum`.\n2. Add `arr[i]` to `curr_sum` and update `max_sum`.\n3. Reset `curr_sum = 0` if `curr_sum < 0`.",
        timeComplexity: "O(N) single pass",
        spaceComplexity: "O(1) auxiliary space",
        whenToApply: "Finding maximum/minimum contiguous subarray sum.",
        whenNotToApply: "When non-contiguous subsequences are required."
      },
      {
        name: "4. Dutch National Flag Algorithm (3-Way Partitioning)",
        video: {
          id: "0jRj9f4N4Kk",
          title: "Sort Colors - Dutch National Flag Algorithm",
          channel: "NeetCode",
          duration: "12 mins"
        },
        explanation: "Sorts an array containing 0s, 1s, and 2s in a single pass O(N) time and O(1) space using 3 pointers (`low`, `mid`, `high`).",
        code: "int low = 0, mid = 0, high = n - 1;\nwhile (mid <= high) {\n    if (arr[mid] == 0) {\n        swap(arr[low++], arr[mid++]);\n    } else if (arr[mid] == 1) {\n        mid++;\n    } else {\n        swap(arr[mid], arr[high--]);\n    }\n}",
        codeWalkthrough: "• 0s placed in range [0 ... low-1]\n• 1s placed in range [low ... mid-1]\n• 2s placed in range [high+1 ... n-1]",
        approach: "1. `low = 0`, `mid = 0`, `high = n - 1`.\n2. Process `arr[mid]` and swap to `low` or `high` boundaries.",
        timeComplexity: "O(N) single pass",
        spaceComplexity: "O(1) in-place",
        whenToApply: "Sorting 3 distinct values or 3-way array partitioning.",
        whenNotToApply: "General sorting of arbitrary continuous numbers."
      }
    ],
    complexities: [
      { operation: "Access by Index", time: "O(1)", space: "O(1)" },
      { operation: "Linear Search", time: "O(N)", space: "O(1)" },
      { operation: "Insertion / Deletion at End", time: "O(1) amortized", space: "O(1)" },
      { operation: "Insertion / Deletion at Start/Middle", time: "O(N)", space: "O(1)" }
    ],
    strategy: "When tackling Array problems: 1. Check if sorted -> consider Two Pointers or Binary Search. 2. Subarray problem -> consider Kadane's, Prefix Sum, or Sliding Window. 3. Frequency/Duplicate -> consider Hash Map or In-Place Index Marking."
  },

  2: {
    title: "02. Binary Search",
    summary: "Binary Search is a divide-and-conquer algorithm operating on sorted arrays or monotonic search spaces. At each step, it compares target with the middle element and eliminates half of the remaining elements, achieving O(log N) time.",
    topicVideo: {
      id: "C2apEw9pgtw",
      title: "2.6.1 Binary Search Iterative Method Explanation & Implementation",
      channel: "Abdul Bari",
      duration: "18 mins"
    },
    basics: [
      {
        op: "1. Search Space Monotonicity",
        detail: "Binary Search requires the search space to be monotonic (strictly sorted or boolean YES/NO threshold).",
        code: "int low = 0, high = n - 1;\nwhile (low <= high) {\n    int mid = low + (high - low) / 2;\n    if (arr[mid] == target) return mid;\n    else if (arr[mid] < target) low = mid + 1;\n    else high = mid - 1;\n}\nreturn -1;"
      }
    ],
    patterns: [
      {
        name: "1. Classic Binary Search",
        video: {
          id: "P3YID7895DA",
          title: "Binary Search Algorithm in 100 Seconds",
          channel: "Fireship",
          duration: "10 mins"
        },
        explanation: "Eliminates half the search space at each iteration by checking `mid` element.",
        code: "int low = 0, high = n - 1;\nwhile (low <= high) {\n    int mid = low + (high - low) / 2;\n    if (arr[mid] == target) return mid;\n    else if (arr[mid] < target) low = mid + 1;\n    else high = mid - 1;\n}",
        codeWalkthrough: "• Line 3: Compute mid avoiding integer overflow.\n• Line 5: Search right half if target > arr[mid].\n• Line 6: Search left half if target < arr[mid].",
        approach: "1. `low = 0`, `high = n - 1`.\n2. Compute `mid` and adjust boundaries.",
        timeComplexity: "O(log N)",
        spaceComplexity: "O(1)",
        whenToApply: "Searching target in sorted arrays.",
        whenNotToApply: "Unsorted arrays."
      }
    ],
    complexities: [
      { operation: "Binary Search 1D", time: "O(log N)", space: "O(1)" }
    ],
    strategy: "If problem array is sorted or search space has boolean YES/NO threshold, use Binary Search."
  },

  3: {
    title: "03. Strings",
    summary: "Strings are sequence of characters stored as character arrays or string objects. Character hashing and pattern matching algorithms optimize search queries.",
    topicVideo: {
      id: "zL9_9P-yTng",
      title: "String Algorithms & Character Frequency Hashing",
      channel: "Gate Smashers",
      duration: "25 mins"
    },
    basics: [],
    patterns: [
      {
        name: "1. KMP Pattern Matching Algorithm",
        video: {
          id: "V5-7GzOfADQ",
          title: "9.1 Knuth-Morris-Pratt KMP String Matching Algorithm",
          channel: "Abdul Bari",
          duration: "24 mins"
        },
        explanation: "Uses Longest Prefix Suffix (LPS) array to avoid text pointer backtracking.",
        code: "vector<int> computeLPS(string p) {\n    int m = p.length(), len = 0;\n    vector<int> lps(m, 0);\n    for (int i = 1; i < m;) {\n        if (p[i] == p[len]) lps[i++] = ++len;\n        else if (len != 0) len = lps[len - 1];\n        else lps[i++] = 0;\n    }\n    return lps;\n}",
        codeWalkthrough: "• Precomputes longest proper prefix that is also suffix.",
        approach: "1. Build `lps` array in O(M).",
        timeComplexity: "O(N + M)",
        spaceComplexity: "O(M)",
        whenToApply: "Linear time exact pattern matching.",
        whenNotToApply: "Simple short string lookups."
      }
    ],
    complexities: [
      { operation: "KMP Search", time: "O(N + M)", space: "O(M)" }
    ],
    strategy: "Use KMP or Z-algorithm for linear pattern matching."
  },

  4: {
    title: "04. Linked List",
    summary: "Non-contiguous linear structure linked via pointers. Allows O(1) dynamic insertions/deletions at known nodes.",
    topicVideo: {
      id: "Nq7ok-OyEpg",
      title: "L1. Introduction to LinkedList | Traversal | Length | Search an Element",
      channel: "take U forward",
      duration: "50 mins"
    },
    basics: [
      {
        op: "1. Node Memory Structure",
        detail: "Nodes consist of data payload and pointer link: `struct Node { int data; Node* next; }`.",
        code: "struct Node {\n    int data;\n    Node* next;\n    Node(int val) : data(val), next(nullptr) {}\n};"
      }
    ],
    patterns: [
      {
        name: "1. Floyd's Cycle Detection (Tortoise and Hare)",
        video: {
          id: "wiOo4DC5GGA",
          title: "Detect Loop / Cycle in Linked List - Tortoise & Hare Algorithm",
          channel: "take U forward",
          duration: "16 mins"
        },
        explanation: "Detects loops using fast (2 steps) and slow (1 step) pointers.",
        code: "Node *slow = head, *fast = head;\nwhile (fast && fast->next) {\n    slow = slow->next;\n    fast = fast->next->next;\n    if (slow == fast) return true;\n}\nreturn false;",
        codeWalkthrough: "• Line 3: Move slow 1 step.\n• Line 4: Move fast 2 steps.",
        approach: "1. `slow = head`, `fast = head`.\n2. Move slow by 1, fast by 2.",
        timeComplexity: "O(N)",
        spaceComplexity: "O(1)",
        whenToApply: "Cycle detection, finding middle node.",
        whenNotToApply: "Arrays."
      },
      {
        name: "2. Reverse Linked List Pattern",
        video: {
          id: "G0_I-ZF0S38",
          title: "Reverse Linked List - Iterative & Recursive Tutorial",
          channel: "NeetCode",
          duration: "10 mins"
        },
        explanation: "Reverses pointer direction of each node in O(N) time and O(1) auxiliary space.",
        code: "Node* prev = nullptr, *curr = head;\nwhile (curr) {\n    Node* nextTemp = curr->next;\n    curr->next = prev;\n    prev = curr;\n    curr = nextTemp;\n}\nreturn prev;",
        codeWalkthrough: "• Save next node, flip curr->next to prev, advance prev and curr.",
        approach: "1. Pointer swapping pass.",
        timeComplexity: "O(N)",
        spaceComplexity: "O(1)",
        whenToApply: "Reversing linked lists or checking palindromes.",
        whenNotToApply: "Arrays."
      }
    ],
    complexities: [
      { operation: "Head Insertion", time: "O(1)", space: "O(1)" }
    ],
    strategy: "Dummy heads eliminate null pointer checks."
  },

  5: {
    title: "05. Recursion & Backtracking",
    summary: "Recursive call stack execution exploring subproblems and backtracking on invalid state branches.",
    topicVideo: {
      id: "yVdKa8dnKiE",
      title: "Recursion & Backtracking Series Masterclass",
      channel: "take U forward",
      duration: "40 mins"
    },
    basics: [],
    patterns: [
      {
        name: "1. Subsequences Pick / Non-Pick Pattern",
        video: {
          id: "K4xS-_f2n2E",
          title: "Print all Subsequences - Pick & Non-Pick Pattern",
          channel: "take U forward",
          duration: "20 mins"
        },
        explanation: "Explores inclusion vs exclusion choice branches for every element generating 2^N total subsets.",
        code: "void solve(int idx, vector<int>& ds, vector<int>& nums) {\n    if (idx == nums.size()) { print(ds); return; }\n    ds.push_back(nums[idx]); solve(idx + 1, ds, nums); // Pick\n    ds.pop_back(); solve(idx + 1, ds, nums); // Non-Pick\n}",
        codeWalkthrough: "• Pick element, recurse, then pop_back to backtrack and explore non-pick choice.",
        approach: "1. Base case when `idx == n`.\n2. Recurse with element included, then excluded.",
        timeComplexity: "O(2^N)",
        spaceComplexity: "O(N) recursion stack",
        whenToApply: "Generating all subsets, combinations, permutation trees.",
        whenNotToApply: "Large N where 2^N exceeds execution time limits."
      }
    ],
    complexities: [
      { operation: "Subsequence Generation", time: "O(2^N)", space: "O(N)" }
    ],
    strategy: "Draw state decision tree to identify base cases."
  },

  6: {
    title: "06. Bit Manipulation",
    summary: "Manipulating binary bit representation of integers directly using bitwise AND, OR, XOR, NOT, and bit shifts.",
    topicVideo: {
      id: "5rtVTYAk967",
      title: "Bit Manipulation Masterclass & Bitwise Operations",
      channel: "take U forward",
      duration: "35 mins"
    },
    basics: [],
    patterns: [
      {
        name: "1. Fundamental Bitwise Operations & Bit Masking",
        video: {
          id: "bC7o8P_Steg",
          title: "Check, Set, Clear Bit & Power of 2 Operations",
          channel: "take U forward",
          duration: "15 mins"
        },
        explanation: "Direct bitwise operations: Check k-th bit (`n & (1 << k)`), Set k-th bit (`n | (1 << k)`), Clear k-th bit (`n & ~(1 << k)`), Toggle k-th bit (`n ^ (1 << k)`), Check power of 2 (`(n & (n - 1)) == 0`).",
        code: "bool isKthBitSet(int n, int k) { return (n & (1 << k)) != 0; }\nint setKthBit(int n, int k) { return n | (1 << k); }\nbool isPowerOfTwo(int n) { return n > 0 && (n & (n - 1)) == 0; }",
        codeWalkthrough: "• Bit shift 1 by k positions to create a bitmask, then apply bitwise operations.",
        approach: "1. Create mask `1 << k`.\n2. Apply bitwise operation.",
        timeComplexity: "O(1)",
        spaceComplexity: "O(1)",
        whenToApply: "Bitwise subsets, checking parity, fast power of 2 checks.",
        whenNotToApply: "Continuous real numbers."
      }
    ],
    complexities: [
      { operation: "Bitwise Operations", time: "O(1)", space: "O(1)" }
    ],
    strategy: "Use `n & (n - 1)` to remove lowest set bit in O(1)."
  },

  7: {
    title: "07. Stack and Queues",
    summary: "Stack (LIFO) and Queue (FIFO) linear data structures.",
    topicVideo: {
      id: "rU2T-jZJ8s4",
      title: "Stack & Queue Data Structure Complete Series",
      channel: "take U forward",
      duration: "45 mins"
    },
    basics: [],
    patterns: [
      {
        name: "1. Monotonic Stack Pattern",
        video: {
          id: "V51KBEj8wXE",
          title: "Monotonic Stack - Next Greater Element I & II",
          channel: "take U forward",
          duration: "20 mins"
        },
        explanation: "Maintains stack elements in strictly increasing/decreasing order.",
        code: "stack<int> st;\nfor (int i = 0; i < n; i++) {\n    while (!st.empty() && arr[i] > arr[st.top()]) {\n        nextGreater[st.top()] = arr[i];\n        st.pop();\n    }\n    st.push(i);\n}",
        codeWalkthrough: "• Pop elements smaller than current element.",
        approach: "1. Maintain stack of indices.",
        timeComplexity: "O(N)",
        spaceComplexity: "O(N)",
        whenToApply: "Next Greater Element, Stock Span.",
        whenNotToApply: "Random index access."
      }
    ],
    complexities: [
      { operation: "Push / Pop", time: "O(1)", space: "O(N)" }
    ],
    strategy: "For Next Greater/Smaller element, use Monotonic Stack."
  },

  8: {
    title: "08. Sliding Window & Two Pointers",
    summary: "Subarray window optimization over sequential data structures avoiding nested O(N^2) loops.",
    topicVideo: {
      id: "97oMk6g-Urg",
      title: "Sliding Window & Two Pointers Masterclass",
      channel: "take U forward",
      duration: "40 mins"
    },
    basics: [],
    patterns: [
      {
        name: "1. Variable Size Sliding Window",
        video: {
          id: "pBYXb6_KzY4",
          title: "Longest Substring Without Repeating Characters",
          channel: "NeetCode",
          duration: "15 mins"
        },
        explanation: "Expands right window boundary until condition breaks, then shrinks left boundary to restore valid window.",
        code: "unordered_set<char> charSet;\nint left = 0, maxLen = 0;\nfor (int right = 0; right < s.length(); right++) {\n    while (charSet.count(s[right])) {\n        charSet.erase(s[left++]);\n    }\n    charSet.insert(s[right]);\n    maxLen = max(maxLen, right - left + 1);\n}",
        codeWalkthrough: "• Expand right index, shrink left index on duplicate character until window is valid.",
        approach: "1. Expand `right`.\n2. Shrink `left` on duplicate.",
        timeComplexity: "O(N)",
        spaceComplexity: "O(K)",
        whenToApply: "Longest/Shortest subarray with constraint.",
        whenNotToApply: "Non-contiguous subsets."
      }
    ],
    complexities: [
      { operation: "Sliding Window Pass", time: "O(N)", space: "O(K)" }
    ],
    strategy: "Track left and right window pointers."
  },

  9: {
    title: "09. Heaps & Priority Queue",
    summary: "Complete binary tree representation maintaining min-heap or max-heap property for fast O(1) top access and O(log N) insert/delete.",
    topicVideo: {
      id: "HqPJF2L5h9U",
      title: "Heap Data Structure - Insertion, Deletion & Heapify",
      channel: "Abdul Bari",
      duration: "35 mins"
    },
    basics: [],
    patterns: [
      {
        name: "1. Top-K Elements / Min-Heap Pattern",
        video: {
          id: "yAs3tO6i_Hk",
          title: "Kth Largest Element in an Array - Priority Queue",
          channel: "NeetCode",
          duration: "12 mins"
        },
        explanation: "Maintains a Min-Heap of size K. If heap size exceeds K, pop top element, leaving the K largest elements in heap.",
        code: "priority_queue<int, vector<int>, greater<int>> minHeap;\nfor (int num : nums) {\n    minHeap.push(num);\n    if (minHeap.size() > k) minHeap.pop();\n}\nreturn minHeap.top();",
        codeWalkthrough: "• Keep heap size <= K. Top of min-heap gives K-th largest element.",
        approach: "1. Push elements into min-heap.\n2. Pop when size > K.",
        timeComplexity: "O(N log K)",
        spaceComplexity: "O(K)",
        whenToApply: "Top K largest/smallest elements, median streaming.",
        whenNotToApply: "Entire array sorting required."
      }
    ],
    complexities: [
      { operation: "Push / Pop", time: "O(log N)", space: "O(N)" }
    ],
    strategy: "Use Min-Heap for Top-K Largest, Max-Heap for Top-K Smallest."
  },

  10: {
    title: "10. Greedy Approach",
    summary: "Making locally optimal choices at each step to reach a global optimum.",
    topicVideo: {
      id: "HzeK7g8cD0k",
      title: "Greedy Method - Knapsack & Activity Selection",
      channel: "Abdul Bari",
      duration: "30 mins"
    },
    basics: [],
    patterns: [
      {
        name: "1. Activity Selection / Interval Scheduling",
        video: {
          id: "II6ziNypg0I",
          title: "N Meetings in One Room - Activity Selection",
          channel: "take U forward",
          duration: "15 mins"
        },
        explanation: "Sorts activities by finish time to greedily select maximum non-overlapping intervals.",
        code: "sort(meetings.begin(), meetings.end(), [](auto& a, auto& b) { return a.end < b.end; });\nint count = 1, limit = meetings[0].end;\nfor (int i = 1; i < n; i++) {\n    if (meetings[i].start > limit) {\n        count++;\n        limit = meetings[i].end;\n    }\n}",
        codeWalkthrough: "• Sort by end time, pick meeting if start time > previous limit.",
        approach: "1. Sort by end time.\n2. Greedily pick valid next interval.",
        timeComplexity: "O(N log N)",
        spaceComplexity: "O(1)",
        whenToApply: "Non-overlapping interval selection, scheduling.",
        whenNotToApply: "When local choice breaks global optimum (use DP instead)."
      }
    ],
    complexities: [
      { operation: "Greedy Sort & Pass", time: "O(N log N)", space: "O(1)" }
    ],
    strategy: "Prove greedy choice property before implementing."
  },

  11: {
    title: "11. Binary Trees",
    summary: "Hierarchical structure where each node has at most 2 children.",
    topicVideo: {
      id: "_ANrF3FJm7I",
      title: "L1. Introduction to Trees | Types of Trees & Traversals",
      channel: "take U forward",
      duration: "45 mins"
    },
    basics: [],
    patterns: [
      {
        name: "1. Tree Traversals & Depth Calculation",
        video: {
          id: "fAAZ2rJGFTM",
          title: "Binary Tree Data Structure Tutorial & Traversals",
          channel: "freeCodeCamp.org",
          duration: "30 mins"
        },
        explanation: "Computes tree height recursively and tracks max depth (`1 + max(lh, rh)`).",
        code: "int maxDepth(TreeNode* root) {\n    if (!root) return 0;\n    return 1 + max(maxDepth(root->left), maxDepth(root->right));\n}",
        codeWalkthrough: "• Base case null return 0. Return 1 + max of left and right subtree depth.",
        approach: "1. Recurse on left and right children.",
        timeComplexity: "O(N)",
        spaceComplexity: "O(H)",
        whenToApply: "Tree height, diameter, balance checks.",
        whenNotToApply: "Graphs with cycles."
      }
    ],
    complexities: [
      { operation: "DFS Traversal", time: "O(N)", space: "O(H)" }
    ],
    strategy: "Use recursion to ask left and right subtrees."
  },

  12: {
    title: "12. Binary Search Trees",
    summary: "Binary tree with invariant `Left < Node < Right` for all nodes.",
    topicVideo: {
      id: "pYT9F8_LFTM",
      title: "Binary Search Trees (BST) Introduction & Invariant",
      channel: "take U forward",
      duration: "30 mins"
    },
    basics: [],
    patterns: [
      {
        name: "1. BST Search & Insert Pattern",
        video: {
          id: "cySVml6e_Fc",
          title: "Binary Search Tree - Implementation & Search",
          channel: "mycodeschool",
          duration: "25 mins"
        },
        explanation: "Traverses left subtree if target < node->val else right subtree in O(log N) average time.",
        code: "TreeNode* searchBST(TreeNode* root, int val) {\n    while (root && root->val != val) {\n        root = (val < root->val) ? root->left : root->right;\n    }\n    return root;\n}",
        codeWalkthrough: "• Traverse left if smaller, right if larger.",
        approach: "1. Compare val with node.",
        timeComplexity: "O(log N) avg, O(N) worst",
        spaceComplexity: "O(1)",
        whenToApply: "Searching, inserting in sorted BST.",
        whenNotToApply: "Unbalanced general trees."
      }
    ],
    complexities: [
      { operation: "BST Search", time: "O(log N)", space: "O(1)" }
    ],
    strategy: "Inorder traversal of BST yields strictly sorted values."
  },

  13: {
    title: "13. Graphs",
    summary: "Vertices and Edges structure representing networks and relationships.",
    topicVideo: {
      id: "M3_pLsDdeuU",
      title: "G-1. Introduction to Graph | Types & Conventions",
      channel: "take U forward",
      duration: "35 mins"
    },
    basics: [],
    patterns: [
      {
        name: "1. BFS Traversal & Shortest Path",
        video: {
          id: "-tgVpUgsQ5k",
          title: "G-5. Breadth-First Search (BFS) | Traversal Technique",
          channel: "take U forward",
          duration: "22 mins"
        },
        explanation: "Level-order queue traversal finding shortest path in unweighted graphs.",
        code: "queue<int> q;\nq.push(startNode);\nvis[startNode] = 1;\nwhile (!q.empty()) {\n    int node = q.front(); q.pop();\n    for (int neighbor : adj[node]) {\n        if (!vis[neighbor]) {\n            vis[neighbor] = 1;\n            q.push(neighbor);\n        }\n    }\n}",
        codeWalkthrough: "• Enqueue start node and process level by level.",
        approach: "1. Enqueue root and mark visited.",
        timeComplexity: "O(V + E)",
        spaceComplexity: "O(V)",
        whenToApply: "Unweighted shortest path.",
        whenNotToApply: "Weighted graphs with varying edge costs."
      }
    ],
    complexities: [
      { operation: "BFS / DFS", time: "O(V + E)", space: "O(V)" }
    ],
    strategy: "Use BFS for unweighted shortest path."
  },

  14: {
    title: "14. Dynamic Programming",
    summary: "Optimizes recursion by caching solutions to overlapping subproblems.",
    topicVideo: {
      id: "oBt53YbR9Kk",
      title: "Dynamic Programming Course for Beginners - Memoization & Tabulation",
      channel: "freeCodeCamp.org",
      duration: "65 mins"
    },
    basics: [],
    patterns: [
      {
        name: "1. 0/1 Knapsack Pattern",
        video: {
          id: "GqOmJwHwO_k",
          title: "0/1 Knapsack Problem - Dynamic Programming Tabulation",
          channel: "take U forward",
          duration: "25 mins"
        },
        explanation: "At item `i` with capacity `w`, choose max of excluding or including item.",
        code: "for (int i = 1; i <= n; i++) {\n    for (int w = 0; w <= W; w++) {\n        if (wt[i-1] <= w) {\n            dp[i][w] = max(dp[i-1][w], val[i-1] + dp[i-1][w - wt[i-1]]);\n        } else dp[i][w] = dp[i-1][w];\n    }\n}",
        codeWalkthrough: "• Max of excluding item or including item.",
        approach: "1. State `dp[i][w]`.",
        timeComplexity: "O(N * W)",
        spaceComplexity: "O(N * W)",
        whenToApply: "Subset sum, target sum.",
        whenNotToApply: "Fractional items."
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
    topicVideo: {
      id: "dBGUmUQhjaM",
      title: "L1. Implement TRIE | INSERT | SEARCH | STARTSWITH",
      channel: "take U forward",
      duration: "35 mins"
    },
    basics: [],
    patterns: [
      {
        name: "1. Prefix Tree Insert & Search",
        video: {
          id: "NnN7hX-bNtc",
          title: "Implement Trie (Prefix Tree) Insert & Search",
          channel: "NeetCode",
          duration: "18 mins"
        },
        explanation: "Traverses character children pointers in O(L) time.",
        code: "void insert(string word) {\n    TrieNode* curr = root;\n    for (char c : word) {\n        int idx = c - 'a';\n        if (!curr->children[idx]) curr->children[idx] = new TrieNode();\n        curr = curr->children[idx];\n    }\n    curr->isWord = true;\n}",
        codeWalkthrough: "• Follow or create character child pointer.",
        approach: "1. Traverse character pointers.",
        timeComplexity: "O(L)",
        spaceComplexity: "O(N * L * 26)",
        whenToApply: "Autocomplete, prefix matching.",
        whenNotToApply: "Simple string equality checks."
      }
    ],
    complexities: [
      { operation: "Trie Search", time: "O(L)", space: "O(N * L * 26)" }
    ],
    strategy: "Use Tries for prefix-based string searches."
  },

  16: {
    title: "16. Strings (Hard)",
    summary: "Advanced string pattern matching and string transformation algorithms.",
    topicVideo: {
      id: "V5-7GzOfADQ",
      title: "9.1 Knuth-Morris-Pratt KMP String Matching Algorithm",
      channel: "Abdul Bari",
      duration: "24 mins"
    },
    basics: [],
    patterns: [
      {
        name: "1. KMP Pattern Search (LPS Array)",
        video: {
          id: "qa_v_a9k05A",
          title: "Advanced String Pattern Matching - KMP & Z-Algorithm",
          channel: "take U forward",
          duration: "40 mins"
        },
        explanation: "Uses Longest Prefix Suffix (LPS) array to avoid text pointer backtracking.",
        code: "vector<int> computeLPS(string p) {\n    int m = p.length(), len = 0;\n    vector<int> lps(m, 0);\n    for (int i = 1; i < m;) {\n        if (p[i] == p[len]) lps[i++] = ++len;\n        else if (len != 0) len = lps[len - 1];\n        else lps[i++] = 0;\n    }\n    return lps;\n}",
        codeWalkthrough: "• Precomputes longest proper prefix that is also suffix.",
        approach: "1. Build `lps` array in O(M).",
        timeComplexity: "O(N + M)",
        spaceComplexity: "O(M)",
        whenToApply: "Linear time exact pattern matching.",
        whenNotToApply: "Simple short string lookups."
      }
    ],
    complexities: [
      { operation: "KMP Search", time: "O(N + M)", space: "O(M)" }
    ],
    strategy: "Use KMP or Z-algorithm for linear pattern matching."
  }
}
