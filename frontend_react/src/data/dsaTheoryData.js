export const dsaTheoryData = {
  1: {
    title: "01. Arrays",
    summary: "Arrays are contiguous memory blocks storing elements of identical data type. Index-based access takes O(1) time because memory offsets are mathematically computed. Inserting or deleting elements at arbitrary positions requires shifting elements, resulting in O(N) worst-case time.",
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
        detail: "Deleting from index k requires shifting all subsequent elements left by 1 position to fill the gap.",
        code: "// Delete element at index 'k'\nfor (int i = k; i < n - 1; i++) {\n    arr[i] = arr[i + 1]; // Shift elements left\n}\nn--;\n// Time: O(N) due to shifting"
      }
    ],
    patterns: [
      {
        name: "1. Two Pointers Pattern",
        video: {
          id: "On03HWe2tZM",
          title: "Visual introduction Two Pointer Algorithm | Coding Interviews",
          channel: "Josh's DevBox",
          duration: "15 mins"
        },
        explanation: "Uses two pointer variables (`left` and `right`) traversing array towards each other.",
        code: "int left = 0, right = n - 1;\nwhile (left < right) {\n    int sum = arr[left] + arr[right];\n    if (sum == target) return {left, right};\n    else if (sum < target) left++;\n    else right--;\n}",
        codeWalkthrough: "• Advance left if sum too small, decrement right if sum too large.",
        approach: "1. Two pointer traversal pass.",
        timeComplexity: "O(N)",
        spaceComplexity: "O(1)",
        whenToApply: "Sorted arrays, pair sum targets.",
        whenNotToApply: "Unsorted arrays."
      },
      {
        name: "2. Kadane's Algorithm (Maximum Subarray Sum)",
        video: {
          id: "AHZpyENo7k4",
          title: "Kadane's Algorithm | Maximum Subarray Sum | Finding and Printing",
          channel: "take U forward",
          duration: "20 mins"
        },
        explanation: "Dynamic programming method that finds maximum subarray sum in O(N) time.",
        code: "int max_sum = INT_MIN, curr_sum = 0;\nfor (int i = 0; i < n; i++) {\n    curr_sum += arr[i];\n    max_sum = max(max_sum, curr_sum);\n    if (curr_sum < 0) curr_sum = 0;\n}",
        codeWalkthrough: "• Add current element, update max_sum, reset curr_sum to 0 if negative.",
        approach: "1. Track curr_sum and max_sum.\n2. Reset curr_sum = 0 when negative.",
        timeComplexity: "O(N)",
        spaceComplexity: "O(1)",
        whenToApply: "Maximum contiguous subarray sum.",
        whenNotToApply: "Non-contiguous subsequences."
      }
    ],
    complexities: [
      { operation: "Access by Index", time: "O(1)", space: "O(1)" },
      { operation: "Linear Search", time: "O(N)", space: "O(1)" }
    ],
    strategy: "Check if array is sorted (Two Pointers/Binary Search) or continuous sub-segment (Kadane/Prefix Sum)."
  },

  2: {
    title: "02. Binary Search",
    summary: "Binary Search is a divide-and-conquer algorithm operating on sorted arrays or monotonic search spaces, achieving O(log N) time.",
    topicVideo: {
      id: "C2apEw9pgtw",
      title: "2.6.1 Binary Search Iterative Method Explanation & Code",
      channel: "Abdul Bari",
      duration: "18 mins"
    },
    basics: [],
    patterns: [
      {
        name: "1. Classic Binary Search Pattern",
        video: {
          id: "s4DPM8ct1pI",
          title: "Binary Search - Leetcode 704 Explanation",
          channel: "NeetCode",
          duration: "12 mins"
        },
        explanation: "Eliminates half of the search space at each step by comparing mid with target.",
        code: "int low = 0, high = n - 1;\nwhile (low <= high) {\n    int mid = low + (high - low) / 2;\n    if (arr[mid] == target) return mid;\n    else if (arr[mid] < target) low = mid + 1;\n    else high = mid - 1;\n}",
        codeWalkthrough: "• Compute mid avoiding overflow, shrink search space by half.",
        approach: "1. low = 0, high = n - 1.\n2. Adjust boundaries based on comparison.",
        timeComplexity: "O(log N)",
        spaceComplexity: "O(1)",
        whenToApply: "Searching in sorted arrays or monotonic search spaces.",
        whenNotToApply: "Unsorted arrays."
      },
      {
        name: "2. Lower Bound Pattern",
        video: {
          id: "j7NodO9HIbk",
          title: "1 Binary Search Format Introduction",
          channel: "Aditya Verma",
          duration: "15 mins"
        },
        explanation: "Finds first index where arr[mid] >= target.",
        code: "int low = 0, high = n - 1, ans = n;\nwhile (low <= high) {\n    int mid = low + (high - low) / 2;\n    if (arr[mid] >= target) {\n        ans = mid;\n        high = mid - 1;\n    } else low = mid + 1;\n}\nreturn ans;",
        codeWalkthrough: "• Track candidate index ans.",
        approach: "1. Binary search lower bound.",
        timeComplexity: "O(log N)",
        spaceComplexity: "O(1)",
        whenToApply: "First occurrence or insertion position.",
        whenNotToApply: "Unsorted arrays."
      }
    ],
    complexities: [
      { operation: "Binary Search 1D", time: "O(log N)", space: "O(1)" }
    ],
    strategy: "Monotonic search space -> apply Binary Search."
  },

  3: {
    title: "03. Strings",
    summary: "Strings are sequence of characters stored as character arrays. Character matching algorithms optimize string search queries.",
    topicVideo: {
      id: "BfUejqd07yo",
      title: "Rolling Hash Function Tutorial & String Searching Algorithm",
      channel: "Stable Sort",
      duration: "20 mins"
    },
    basics: [],
    patterns: [
      {
        name: "1. Knuth-Morris-Pratt (KMP) Pattern Search",
        video: {
          id: "V5-7GzOfADQ",
          title: "9.1 Knuth-Morris-Pratt KMP String Matching Algorithm",
          channel: "Abdul Bari",
          duration: "24 mins"
        },
        explanation: "Uses Longest Prefix Suffix (LPS) array to avoid text pointer backtracking.",
        code: "vector<int> computeLPS(string p) {\n    int m = p.length(), len = 0;\n    vector<int> lps(m, 0);\n    for (int i = 1; i < m;) {\n        if (p[i] == p[len]) lps[i++] = ++len;\n        else if (len != 0) len = lps[len - 1];\n        else lps[i++] = 0;\n    }\n    return lps;\n}",
        codeWalkthrough: "• Precomputes proper prefix that is also suffix.",
        approach: "1. Construct LPS array in O(M).",
        timeComplexity: "O(N + M)",
        spaceComplexity: "O(M)",
        whenToApply: "Exact pattern matching in linear time.",
        whenNotToApply: "Simple short string equality."
      }
    ],
    complexities: [
      { operation: "KMP Match", time: "O(N + M)", space: "O(M)" }
    ],
    strategy: "Use KMP or Z-algorithm for pattern matching."
  },

  4: {
    title: "04. Linked List",
    summary: "Non-contiguous linear structure linked via pointers. Allows O(1) dynamic insertions/deletions at known nodes.",
    topicVideo: {
      id: "Nq7ok-OyEpg",
      title: "L1. Introduction to LinkedList | Traversal | Length | Search",
      channel: "take U forward",
      duration: "50 mins"
    },
    basics: [],
    patterns: [
      {
        name: "1. Floyd's Cycle Detection (Tortoise and Hare)",
        video: {
          id: "wiOo4DC5GGA",
          title: "L14. Detect a loop or cycle in LinkedList | Proof & Intuition",
          channel: "take U forward",
          duration: "16 mins"
        },
        explanation: "Detects loops using fast (2 steps) and slow (1 step) pointers.",
        code: "Node *slow = head, *fast = head;\nwhile (fast && fast->next) {\n    slow = slow->next;\n    fast = fast->next->next;\n    if (slow == fast) return true;\n}\nreturn false;",
        codeWalkthrough: "• Move slow by 1, fast by 2. If they meet, loop exists.",
        approach: "1. Fast and slow pointers pass.",
        timeComplexity: "O(N)",
        spaceComplexity: "O(1)",
        whenToApply: "Cycle detection, finding middle node.",
        whenNotToApply: "Arrays."
      },
      {
        name: "2. Reverse Linked List Pattern",
        video: {
          id: "G0_I-ZF0S38",
          title: "Reverse Linked List - Iterative AND Recursive",
          channel: "NeetCode",
          duration: "10 mins"
        },
        explanation: "Reverses node pointer directions in O(N) time and O(1) space.",
        code: "Node* prev = nullptr, *curr = head;\nwhile (curr) {\n    Node* nextTemp = curr->next;\n    curr->next = prev;\n    prev = curr;\n    curr = nextTemp;\n}\nreturn prev;",
        codeWalkthrough: "• Swap pointer directions iteratively.",
        approach: "1. Iterative pointer reversal.",
        timeComplexity: "O(N)",
        spaceComplexity: "O(1)",
        whenToApply: "Reversing lists or checking palindromes.",
        whenNotToApply: "Arrays."
      }
    ],
    complexities: [
      { operation: "Head Insertion", time: "O(1)", space: "O(1)" }
    ],
    strategy: "Use dummy head node to simplify boundary pointer logic."
  },

  5: {
    title: "05. Recursion & Backtracking",
    summary: "Recursive call stack execution exploring subproblems and backtracking on invalid choice branches.",
    topicVideo: {
      id: "yVdKa8dnKiE",
      title: "Re 1. Introduction to Recursion | Recursion Tree | Stack Space",
      channel: "take U forward",
      duration: "40 mins"
    },
    basics: [],
    patterns: [],
    complexities: [
      { operation: "Subsequence Generation", time: "O(2^N)", space: "O(N)" }
    ],
    strategy: "Identify base cases and state space decision tree."
  },

  6: {
    title: "06. Bit Manipulation",
    summary: "Manipulating binary bit representation of integers directly using bitwise AND, OR, XOR, NOT, and bit shifts.",
    topicVideo: {
      id: "NLKQEOgBAnw",
      title: "Algorithms: Bit Manipulation Tutorial",
      channel: "HackerRank",
      duration: "25 mins"
    },
    basics: [],
    patterns: [
      {
        name: "1. Bitwise Operations & Tricks",
        video: {
          id: "ZwU6wSkepBI",
          title: "L2 | Bit Manipulations | Problem Solving on Bit Manipulations",
          channel: "take U forward",
          duration: "20 mins"
        },
        explanation: "Direct bitwise operations: Check bit, Set bit, Clear bit, Toggle bit, Power of 2.",
        code: "bool isKthBitSet(int n, int k) { return (n & (1 << k)) != 0; }\nint setKthBit(int n, int k) { return n | (1 << k); }\nbool isPowerOfTwo(int n) { return n > 0 && (n & (n - 1)) == 0; }",
        codeWalkthrough: "• Apply bitwise masks in O(1) constant time.",
        approach: "1. Bitwise mask pass.",
        timeComplexity: "O(1)",
        spaceComplexity: "O(1)",
        whenToApply: "Bit parity, fast subset masks.",
        whenNotToApply: "Continuous floating point numbers."
      }
    ],
    complexities: [
      { operation: "Bitwise Operations", time: "O(1)", space: "O(1)" }
    ],
    strategy: "Use n & (n - 1) to remove lowest set bit in O(1)."
  },

  7: {
    title: "07. Stack and Queues",
    summary: "Stack (LIFO) and Queue (FIFO) linear data structures.",
    topicVideo: {
      id: "GYptUgnIM_I",
      title: "Implementation of Stack using Arrays",
      channel: "take U forward",
      duration: "25 mins"
    },
    basics: [],
    patterns: [],
    complexities: [
      { operation: "Push / Pop", time: "O(1)", space: "O(N)" }
    ],
    strategy: "For Next Greater/Smaller element, use Monotonic Stack."
  },

  8: {
    title: "08. Sliding Window & Two Pointers",
    summary: "Subarray window optimization over sequential data structures avoiding nested O(N^2) loops.",
    basics: [],
    patterns: [
      {
        name: "1. Longest Substring Without Repeating Characters",
        video: {
          id: "3IETreEybaA",
          title: "LeetCode Longest Substring Without Repeating Characters Solution Explained",
          channel: "Nick White",
          duration: "14 mins"
        },
        explanation: "Expands right window boundary until duplicate found, then shrinks left boundary.",
        code: "unordered_set<char> charSet;\nint left = 0, maxLen = 0;\nfor (int right = 0; right < s.length(); right++) {\n    while (charSet.count(s[right])) charSet.erase(s[left++]);\n    charSet.insert(s[right]);\n    maxLen = max(maxLen, right - left + 1);\n}",
        codeWalkthrough: "• Window expansion & contraction.",
        approach: "1. Two pointers window pass.",
        timeComplexity: "O(N)",
        spaceComplexity: "O(K)",
        whenToApply: "Subarray substring bounds.",
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
    summary: "Complete binary tree maintaining min-heap or max-heap property for fast O(1) top access.",
    topicVideo: {
      id: "HqPJF2L5h9U",
      title: "2.6.3 Heap - Heap Sort - Heapify - Priority Queues",
      channel: "Abdul Bari",
      duration: "35 mins"
    },
    basics: [],
    patterns: [
      {
        name: "1. Heaps Data Structure Pattern",
        video: {
          id: "t0Cq6tVNRBA",
          title: "Data Structures: Heaps Tutorial",
          channel: "HackerRank",
          duration: "18 mins"
        },
        explanation: "Min-Heap or Max-Heap structure for dynamic order statistics.",
        code: "priority_queue<int> maxHeap;\nfor (int num : nums) maxHeap.push(num);",
        codeWalkthrough: "• Heap insert & pop.",
        approach: "1. Priority Queue operations.",
        timeComplexity: "O(N log K)",
        spaceComplexity: "O(K)",
        whenToApply: "Top K elements, median streaming.",
        whenNotToApply: "Unordered access."
      }
    ],
    complexities: [
      { operation: "Push / Pop", time: "O(log N)", space: "O(N)" }
    ],
    strategy: "Min-Heap for Top-K Largest, Max-Heap for Top-K Smallest."
  },

  10: {
    title: "10. Greedy Approach",
    summary: "Making locally optimal choices at each step to reach a global optimum.",
    topicVideo: {
      id: "ARvQcqJ_-NY",
      title: "3. Greedy Method - Introduction & Applications",
      channel: "Abdul Bari",
      duration: "30 mins"
    },
    basics: [],
    patterns: [],
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
      title: "L1. Introduction to Trees | Types of Trees",
      channel: "take U forward",
      duration: "45 mins"
    },
    basics: [],
    patterns: [],
    complexities: [
      { operation: "DFS Traversal", time: "O(N)", space: "O(H)" }
    ],
    strategy: "Recurse on left and right subtrees."
  },

  12: {
    title: "12. Binary Search Trees",
    summary: "Binary tree with invariant Left < Node < Right for all nodes.",
    topicVideo: {
      id: "pYT9F8_LFTM",
      title: "Data structures: Binary Search Tree",
      channel: "mycodeschool",
      duration: "30 mins"
    },
    basics: [],
    patterns: [],
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
        name: "1. Graph Breadth-First Search (BFS)",
        video: {
          id: "-tgVpUgsQ5k",
          title: "G-5. Breadth-First Search (BFS) | Traversal Technique",
          channel: "take U forward",
          duration: "22 mins"
        },
        explanation: "Level-order queue traversal finding shortest path in unweighted graphs.",
        code: "queue<int> q;\nq.push(startNode);\nvis[startNode] = 1;\nwhile (!q.empty()) {\n    int node = q.front(); q.pop();\n    for (int neighbor : adj[node]) {\n        if (!vis[neighbor]) {\n            vis[neighbor] = 1;\n            q.push(neighbor);\n        }\n    }\n}",
        codeWalkthrough: "• Enqueue start node and process level by level.",
        approach: "1. Queue BFS traversal.",
        timeComplexity: "O(V + E)",
        spaceComplexity: "O(V)",
        whenToApply: "Unweighted shortest path.",
        whenNotToApply: "Weighted graphs."
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
      title: "Dynamic Programming - Learn to Solve Algorithmic Problems",
      channel: "freeCodeCamp.org",
      duration: "65 mins"
    },
    basics: [],
    patterns: [],
    complexities: [
      { operation: "DP Tabulation", time: "O(States)", space: "O(States)" }
    ],
    strategy: "Define state space, base cases, and transition equation."
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
    patterns: [],
    complexities: [
      { operation: "Trie Search", time: "O(L)", space: "O(N * L * 26)" }
    ],
    strategy: "Use Tries for prefix-based string lookups."
  }
}
