export const dsaTheoryData = {
  1: {
    title: "01. Arrays",
    summary: "Arrays are contiguous memory blocks storing elements of identical data type. Index-based access takes O(1) time because memory offsets are mathematically computed. Inserting or deleting elements at arbitrary positions requires shifting elements, resulting in O(N) worst-case time.",
    topicYoutubeLink: "https://www.youtube.com/results?search_query=Striver+A2Z+DSA+Arrays+Complete+Course",
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
        youtubeLink: "https://www.youtube.com/results?search_query=Two+Pointers+Algorithm+Striver",
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
        youtubeLink: "https://www.youtube.com/results?search_query=Prefix+Sum+and+Difference+Array+Striver",
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
        youtubeLink: "https://www.youtube.com/results?search_query=Kadanes+Algorithm+Striver",
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
        name: "4. Boyer-Moore Voting Algorithm",
        youtubeLink: "https://www.youtube.com/results?search_query=Boyer+Moore+Majority+Vote+Algorithm+Striver",
        explanation: "Finds the majority element (element appearing > N/2 times) in O(N) time and O(1) space using a candidate counter mechanism.",
        code: "int candidate = 0, count = 0;\nfor (int num : nums) {\n    if (count == 0) candidate = num;\n    count += (num == candidate) ? 1 : -1;\n}",
        codeWalkthrough: "• Line 3: When count drops to 0, choose current element as new majority candidate.\n• Line 4: Increment count if element matches candidate, else decrement count.",
        approach: "1. Maintain `candidate` and `count`.\n2. Reset candidate when `count == 0`.\n3. Return candidate as majority element.",
        timeComplexity: "O(N) time",
        spaceComplexity: "O(1) space",
        whenToApply: "Finding majority element with > N/2 frequency.",
        whenNotToApply: "Arbitrary element frequency distributions without guaranteed majority."
      },
      {
        name: "5. Dutch National Flag Algorithm (3-Way Partitioning)",
        youtubeLink: "https://www.youtube.com/results?search_query=Dutch+National+Flag+Algorithm+Sort+0+1+2+Striver",
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
    topicYoutubeLink: "https://www.youtube.com/results?search_query=Striver+Binary+Search+Playlist",
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
        youtubeLink: "https://www.youtube.com/results?search_query=Binary+Search+1D+Array+Striver",
        explanation: "Eliminates half the search space at each iteration by checking `mid` element.",
        code: "int low = 0, high = n - 1;\nwhile (low <= high) {\n    int mid = low + (high - low) / 2;\n    if (arr[mid] == target) return mid;\n    else if (arr[mid] < target) low = mid + 1;\n    else high = mid - 1;\n}",
        codeWalkthrough: "• Line 3: Compute mid avoiding integer overflow.\n• Line 5: Search right half if target > arr[mid].\n• Line 6: Search left half if target < arr[mid].",
        approach: "1. `low = 0`, `high = n - 1`.\n2. Compute `mid` and adjust boundaries.",
        timeComplexity: "O(log N)",
        spaceComplexity: "O(1)",
        whenToApply: "Searching target in sorted arrays.",
        whenNotToApply: "Unsorted arrays."
      },
      {
        name: "2. Lower Bound Pattern",
        youtubeLink: "https://www.youtube.com/results?search_query=Lower+Bound+Binary+Search+Striver",
        explanation: "Finds first index where `arr[index] >= target`.",
        code: "int low = 0, high = n - 1, ans = n;\nwhile (low <= high) {\n    int mid = low + (high - low) / 2;\n    if (arr[mid] >= target) {\n        ans = mid; // Potential answer found\n        high = mid - 1; // Look left\n    } else {\n        low = mid + 1;\n    }\n}\nreturn ans;",
        codeWalkthrough: "• Line 5-6: Record candidate index and move high left to find earlier occurrence.",
        approach: "1. Track `ans` candidate index.\n2. Move `high = mid - 1` on match.",
        timeComplexity: "O(log N)",
        spaceComplexity: "O(1)",
        whenToApply: "First occurrence, insertion index, range frequency queries.",
        whenNotToApply: "Unsorted arrays."
      }
    ],
    complexities: [
      { operation: "Binary Search 1D", time: "O(log N)", space: "O(1)" }
    ],
    strategy: "If problem array is sorted or search space has boolean YES/NO threshold, use Binary Search."
  },

  4: {
    title: "04. Linked List",
    summary: "Non-contiguous linear structure linked via pointers. Allows O(1) dynamic insertions/deletions at known nodes.",
    topicYoutubeLink: "https://www.youtube.com/results?search_query=Striver+Linked+List+Playlist",
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
        youtubeLink: "https://www.youtube.com/results?search_query=Detect+Cycle+in+Linked+List+Striver",
        explanation: "Detects loops using fast (2 steps) and slow (1 step) pointers.",
        code: "Node *slow = head, *fast = head;\nwhile (fast && fast->next) {\n    slow = slow->next;\n    fast = fast->next->next;\n    if (slow == fast) return true;\n}\nreturn false;",
        codeWalkthrough: "• Line 3: Move slow 1 step.\n• Line 4: Move fast 2 steps.",
        approach: "1. `slow = head`, `fast = head`.\n2. Move slow by 1, fast by 2.",
        timeComplexity: "O(N)",
        spaceComplexity: "O(1)",
        whenToApply: "Cycle detection, finding middle node.",
        whenNotToApply: "Arrays."
      }
    ],
    complexities: [
      { operation: "Head Insertion", time: "O(1)", space: "O(1)" }
    ],
    strategy: "Dummy heads eliminate null pointer checks."
  },

  7: {
    title: "07. Stack and Queues",
    summary: "Stack (LIFO) and Queue (FIFO) linear data structures.",
    topicYoutubeLink: "https://www.youtube.com/results?search_query=Striver+Stack+and+Queue+Playlist",
    basics: [],
    patterns: [
      {
        name: "1. Monotonic Stack Pattern",
        youtubeLink: "https://www.youtube.com/results?search_query=Monotonic+Stack+Next+Greater+Element+Striver",
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

  11: {
    title: "11. Binary Trees",
    summary: "Hierarchical structure where each node has at most 2 children.",
    topicYoutubeLink: "https://www.youtube.com/results?search_query=Striver+Binary+Tree+Playlist",
    basics: [],
    patterns: [
      {
        name: "1. Tree Height & Path Diameter",
        youtubeLink: "https://www.youtube.com/results?search_query=Diameter+of+Binary+Tree+Striver",
        explanation: "Computes tree height recursively and tracks maximum diameter (`lh + rh`).",
        code: "int getHeight(TreeNode* root) {\n    if (!root) return 0;\n    int lh = getHeight(root->left);\n    int rh = getHeight(root->right);\n    maxDiameter = max(maxDiameter, lh + rh);\n    return 1 + max(lh, rh);\n}",
        codeWalkthrough: "• Compute left and right subtree heights.",
        approach: "1. Helper returns height `1 + max(lh, rh)`.",
        timeComplexity: "O(N)",
        spaceComplexity: "O(H)",
        whenToApply: "Tree height, diameter.",
        whenNotToApply: "Graphs."
      }
    ],
    complexities: [
      { operation: "DFS Traversal", time: "O(N)", space: "O(H)" }
    ],
    strategy: "Use recursion to ask left and right subtrees."
  },

  13: {
    title: "13. Graphs",
    summary: "Vertices and Edges structure representing networks and relationships.",
    topicYoutubeLink: "https://www.youtube.com/results?search_query=Striver+Graph+Series+Playlist",
    basics: [],
    patterns: [
      {
        name: "1. BFS Traversal & Shortest Path",
        youtubeLink: "https://www.youtube.com/results?search_query=Graph+BFS+Traversal+Striver",
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
    topicYoutubeLink: "https://www.youtube.com/results?search_query=Striver+Dynamic+Programming+Playlist",
    basics: [],
    patterns: [
      {
        name: "1. 0/1 Knapsack Pattern",
        youtubeLink: "https://www.youtube.com/results?search_query=01+Knapsack+Problem+Dynamic+Programming+Striver",
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
    topicYoutubeLink: "https://www.youtube.com/results?search_query=Striver+Trie+Series+Playlist",
    basics: [],
    patterns: [
      {
        name: "1. Prefix Tree Insert & Search",
        youtubeLink: "https://www.youtube.com/results?search_query=Implement+Trie+Prefix+Tree+Striver",
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
    topicYoutubeLink: "https://www.youtube.com/results?search_query=Striver+KMP+Z+Algorithm+String+Matching",
    basics: [],
    patterns: [
      {
        name: "1. KMP Pattern Search (LPS Array)",
        youtubeLink: "https://www.youtube.com/results?search_query=KMP+Algorithm+String+Matching+Striver",
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
