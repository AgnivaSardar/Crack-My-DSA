export const dsaTheoryData = {
  1: {
    title: "01. Arrays",
    summary: "Arrays are contiguous memory blocks storing elements of identical data type. Index-based access takes O(1) time because memory offsets are mathematically computed. Inserting or deleting elements at arbitrary positions requires shifting elements, resulting in O(N) worst-case time.",
    topicVideos: [
      {
        id: "AHZpyENo7k4",
        title: "Kadane's Algorithm | Maximum Subarray Sum",
        channel: "take U forward",
        duration: "20 mins"
      },
      {
        id: "On03HWe2tZM",
        title: "Visual introduction Two Pointer Algorithm",
        channel: "Josh's DevBox",
        duration: "15 mins"
      }
    ],
    basics: [
      {
        op: "1. Contiguous RAM Layout & Index Math",
        detail: "Elements are placed sequentially in RAM. Address formula: `Address(i) = BaseAddress + (i * ElementSize)`. Allows O(1) direct read/write access.",
        code: "// Direct O(1) Index Access\nint arr[5] = {10, 20, 30, 40, 50};\nint element = arr[3]; // Direct lookup offset: Base + 3*4 bytes"
      },
      {
        op: "2. Element Shifting on Insertion & Deletion",
        detail: "Inserting or deleting at index k requires shifting all subsequent elements left/right by 1 position, resulting in O(N) time.",
        code: "// Shift elements right for insertion at index k\nfor (int i = n; i > k; i--) arr[i] = arr[i - 1];\narr[k] = val; n++;"
      }
    ],
    patterns: [
      {
        name: "1. Two Pointers & Two Sum Pattern",
        video: {
          id: "On03HWe2tZM",
          title: "Visual introduction Two Pointer Algorithm",
          channel: "Josh's DevBox",
          duration: "15 mins"
        },
        explanation: "Uses left and right pointers traversing inward on a sorted array to find pair sums or target constraints in O(N) single pass.",
        code: "int left = 0, right = n - 1;\nwhile (left < right) {\n    int sum = arr[left] + arr[right];\n    if (sum == target) return {left, right};\n    else if (sum < target) left++;\n    else right--;\n}",
        codeWalkthrough: "• Advance left pointer if sum is too small; decrement right pointer if sum is too large.",
        approach: "1. Sort array if not sorted.\n2. Initialize left = 0, right = n - 1.\n3. Adjust pointers based on comparison with target.",
        timeComplexity: "O(N) after sort",
        spaceComplexity: "O(1) auxiliary",
        whenToApply: "Sorted arrays, pair sum targets, reversing arrays in-place.",
        whenNotToApply: "Unsorted arrays where original indices must be preserved without extra memory."
      },
      {
        name: "2. Kadane's Algorithm (Maximum Subarray Sum)",
        video: {
          id: "AHZpyENo7k4",
          title: "Kadane's Algorithm | Maximum Subarray Sum",
          channel: "take U forward",
          duration: "20 mins"
        },
        explanation: "Dynamic programming approach that decides at each index whether to add current element to running sum or reset running sum to 0 when negative.",
        code: "int max_sum = INT_MIN, curr_sum = 0;\nfor (int i = 0; i < n; i++) {\n    curr_sum += arr[i];\n    max_sum = max(max_sum, curr_sum);\n    if (curr_sum < 0) curr_sum = 0;\n}",
        codeWalkthrough: "• Add current element to curr_sum, update global max_sum, and reset curr_sum = 0 if negative.",
        approach: "1. Track curr_sum and max_sum.\n2. Reset curr_sum = 0 when negative.",
        timeComplexity: "O(N) single pass",
        spaceComplexity: "O(1)",
        whenToApply: "Maximum/minimum contiguous subarray sum problems.",
        whenNotToApply: "Non-contiguous subsequences or array products with negative numbers."
      },
      {
        name: "3. Dutch National Flag (3-Way Array Partitioning)",
        video: {
          id: "tp8JIuCXBaU",
          title: "Sort an array of 0's 1's & 2's | Dutch National Flag Algorithm",
          channel: "take U forward",
          duration: "18 mins"
        },
        explanation: "Sorts an array containing 0s, 1s, and 2s in a single pass O(N) time and O(1) space using low, mid, high pointers.",
        code: "int low = 0, mid = 0, high = n - 1;\nwhile (mid <= high) {\n    if (arr[mid] == 0) swap(arr[low++], arr[mid++]);\n    else if (arr[mid] == 1) mid++;\n    else swap(arr[mid], arr[high--]);\n}",
        codeWalkthrough: "• 0s placed in range [0...low-1], 1s in range [low...mid-1], 2s in range [high+1...n-1].",
        approach: "1. low = 0, mid = 0, high = n - 1.\n2. Swap arr[mid] to low/high boundaries.",
        timeComplexity: "O(N)",
        spaceComplexity: "O(1) in-place",
        whenToApply: "Sorting 3 distinct values or 3-way pivot partitioning.",
        whenNotToApply: "General continuous sorting."
      },
      {
        name: "4. Boyer-Moore Voting Algorithm (Majority Element)",
        video: {
          id: "AHZpyENo7k4",
          title: "Majority Element & Subarray Algorithms",
          channel: "take U forward",
          duration: "20 mins"
        },
        explanation: "Finds the candidate element appearing more than N/2 (or N/3) times in O(N) time and O(1) space using a counter balance mechanism.",
        code: "int candidate = 0, count = 0;\nfor (int num : nums) {\n    if (count == 0) candidate = num;\n    count += (num == candidate) ? 1 : -1;\n}",
        codeWalkthrough: "• When count drops to 0, choose current element as candidate. Increment count on match, decrement on mismatch.",
        approach: "1. Track candidate and count.\n2. Verify candidate frequency in second pass if majority is not guaranteed.",
        timeComplexity: "O(N)",
        spaceComplexity: "O(1)",
        whenToApply: "Finding majority elements (> N/2 or > N/3 times).",
        whenNotToApply: "Arbitrary element frequency queries."
      },
      {
        name: "5. Next Permutation Algorithm",
        video: {
          id: "JDOXKqF60RQ",
          title: "Next Permutation | Find next lexicographical sequence",
          channel: "take U forward",
          duration: "20 mins"
        },
        explanation: "Finds lexicographically next greater permutation in O(N) time by finding pivot breakpoint `arr[i] < arr[i+1]`, swapping pivot with next greater, and reversing suffix.",
        code: "int pivot = -1;\nfor (int i = n - 2; i >= 0; i--) {\n    if (arr[i] < arr[i + 1]) { pivot = i; break; }\n}\nif (pivot == -1) { reverse(arr.begin(), arr.end()); return; }\nfor (int i = n - 1; i > pivot; i--) {\n    if (arr[i] > arr[pivot]) { swap(arr[pivot], arr[i]); break; }\n}\nreverse(arr.begin() + pivot + 1, arr.end());",
        codeWalkthrough: "• Find rightmost dip (pivot), swap with smallest larger element on right, reverse right suffix.",
        approach: "1. Find pivot.\n2. Swap pivot.\n3. Reverse suffix.",
        timeComplexity: "O(N)",
        spaceComplexity: "O(1)",
        whenToApply: "In-place next lexicographical permutation.",
        whenNotToApply: "Random permutation generation."
      },
      {
        name: "6. Rotate Image / Matrix by 90 Degrees",
        video: {
          id: "Z0R2u6gd3GU",
          title: "Rotate Matrix / Image by 90 Degrees Clockwise",
          channel: "take U forward",
          duration: "18 mins"
        },
        explanation: "Rotates an N x N matrix 90 degrees clockwise in-place by taking Matrix Transpose `matrix[i][j] <-> matrix[j][i]` and then reversing every row.",
        code: "// Step 1: Transpose Matrix\nfor (int i = 0; i < n; i++) {\n    for (int j = i + 1; j < n; j++) swap(matrix[i][j], matrix[j][i]);\n}\n// Step 2: Reverse Each Row\nfor (int i = 0; i < n; i++) reverse(matrix[i].begin(), matrix[i].end());",
        codeWalkthrough: "• Transpose converts rows into columns. Reversing rows flips matrix 90 degrees clockwise.",
        approach: "1. Transpose matrix.\n2. Reverse each row.",
        timeComplexity: "O(N^2)",
        spaceComplexity: "O(1) in-place",
        whenToApply: "2D Grid matrix rotations (90, 180, 270 degrees).",
        whenNotToApply: "Non-square M x N matrices without extra memory allocation."
      }
    ],
    complexities: [
      { operation: "Direct Index Access", time: "O(1)", space: "O(1)" },
      { operation: "Kadane's Subarray Sum", time: "O(N)", space: "O(1)" },
      { operation: "Boyer-Moore Majority Vote", time: "O(N)", space: "O(1)" },
      { operation: "Next Permutation", time: "O(N)", space: "O(1)" }
    ],
    strategy: "Sorted array -> Two Pointers or Binary Search. Subarray sum -> Kadane's or Prefix Sum. Grid Rotation -> Transpose + Reverse."
  },

  2: {
    title: "02. Binary Search",
    summary: "Binary Search is a divide-and-conquer algorithm operating on sorted arrays or monotonic search spaces. At each step, it compares target with middle element and eliminates half of the search space in O(log N) time.",
    topicVideos: [
      {
        id: "C2apEw9pgtw",
        title: "2.6.1 Binary Search Iterative Method Explanation & Code",
        channel: "Abdul Bari",
        duration: "18 mins"
      },
      {
        id: "j7NodO9HIbk",
        title: "1 Binary Search Format Introduction",
        channel: "Aditya Verma",
        duration: "15 mins"
      }
    ],
    basics: [
      {
        op: "1. Search Space Monotonicity",
        detail: "Binary Search requires the search space to be monotonic (strictly sorted or YES/NO threshold predicate).",
        code: "int low = 0, high = n - 1;\nwhile (low <= high) {\n    int mid = low + (high - low) / 2;\n    if (arr[mid] == target) return mid;\n    else if (arr[mid] < target) low = mid + 1;\n    else high = mid - 1;\n}"
      }
    ],
    patterns: [
      {
        name: "1. Classic 1D Binary Search Pattern",
        video: {
          id: "s4DPM8ct1pI",
          title: "Binary Search - LeetCode 704 Explanation",
          channel: "NeetCode",
          duration: "12 mins"
        },
        explanation: "Eliminates half the search space at each step by comparing mid with target.",
        code: "int low = 0, high = n - 1;\nwhile (low <= high) {\n    int mid = low + (high - low) / 2;\n    if (arr[mid] == target) return mid;\n    else if (arr[mid] < target) low = mid + 1;\n    else high = mid - 1;\n}",
        codeWalkthrough: "• Avoid overflow with `mid = low + (high - low) / 2`. Adjust low or high boundaries.",
        approach: "1. Set low = 0, high = n - 1.\n2. Recalculate mid and shrink search space.",
        timeComplexity: "O(log N)",
        spaceComplexity: "O(1)",
        whenToApply: "Searching target in sorted arrays.",
        whenNotToApply: "Unsorted arrays."
      },
      {
        name: "2. Lower Bound & Upper Bound Pattern",
        video: {
          id: "j7NodO9HIbk",
          title: "Lower Bound and Upper Bound Binary Search",
          channel: "Aditya Verma",
          duration: "15 mins"
        },
        explanation: "Lower Bound finds first index where `arr[mid] >= target`. Upper Bound finds first index where `arr[mid] > target`.",
        code: "int low = 0, high = n - 1, ans = n;\nwhile (low <= high) {\n    int mid = low + (high - low) / 2;\n    if (arr[mid] >= target) { ans = mid; high = mid - 1; }\n    else low = mid + 1;\n}\nreturn ans;",
        codeWalkthrough: "• Save candidate index ans and search left half to find earlier match.",
        approach: "1. Maintain candidate index ans.\n2. Move high left on match.",
        timeComplexity: "O(log N)",
        spaceComplexity: "O(1)",
        whenToApply: "First occurrence, last occurrence, target insertion index.",
        whenNotToApply: "Unsorted arrays."
      },
      {
        name: "3. Search in Rotated Sorted Array",
        video: {
          id: "U8XENwh8Oy8",
          title: "Search in Rotated Sorted Array",
          channel: "take U forward",
          duration: "18 mins"
        },
        explanation: "Identifies which half (left or right) is sorted (`arr[low] <= arr[mid]`) and checks if target lies within that sorted range.",
        code: "int low = 0, high = n - 1;\nwhile (low <= high) {\n    int mid = low + (high - low) / 2;\n    if (arr[mid] == target) return mid;\n    if (arr[low] <= arr[mid]) { // Left half sorted\n        if (arr[low] <= target && target < arr[mid]) high = mid - 1;\n        else low = mid + 1;\n    } else { // Right half sorted\n        if (arr[mid] < target && target <= arr[high]) low = mid + 1;\n        else high = mid - 1;\n    }\n}",
        codeWalkthrough: "• Determine sorted half, check target boundary, discard unsorted half.",
        approach: "1. Identify sorted half.\n2. Check target range in sorted half.",
        timeComplexity: "O(log N)",
        spaceComplexity: "O(1)",
        whenToApply: "Rotated sorted arrays.",
        whenNotToApply: "Arrays with duplicate values where arr[low] == arr[mid] == arr[high] (requires O(N) fallback)."
      },
      {
        name: "4. Binary Search on Search Space / Answer (Koko Eating Bananas)",
        video: {
          id: "qyfekrNni90",
          title: "Koko Eating Bananas - Binary Search on Answer",
          channel: "NeetCode",
          duration: "15 mins"
        },
        explanation: "Applies Binary Search on hypothetical minimum/maximum answer range `[low, high]` when a predicate function `isValid(mid)` is monotonic.",
        code: "long long low = 1, high = maxElem, ans = high;\nwhile (low <= high) {\n    long long mid = low + (high - low) / 2;\n    if (checkPossible(mid, piles, h)) {\n        ans = mid; high = mid - 1; // Try smaller eating speed\n    } else low = mid + 1;\n}",
        codeWalkthrough: "• Define minimum and maximum feasible answer values. If mid is valid, try smaller answer.",
        approach: "1. Define answer range [low, high].\n2. Write monotonic predicate function checkPossible().\n3. Binary search answer range.",
        timeComplexity: "O(N log(Range))",
        spaceComplexity: "O(1)",
        whenToApply: "Minimizing maximum, maximizing minimum, capacity allocation problems.",
        whenNotToApply: "Non-monotonic predicate functions."
      }
    ],
    complexities: [
      { operation: "Classic 1D Search", time: "O(log N)", space: "O(1)" },
      { operation: "Rotated Array Search", time: "O(log N)", space: "O(1)" },
      { operation: "BS on Search Space", time: "O(N log(Range))", space: "O(1)" }
    ],
    strategy: "Monotonic search space or YES/NO predicate -> Apply Binary Search."
  },

  3: {
    title: "03. Strings & Advanced String Algorithms",
    summary: "Comprehensive guide to Strings covering character array indexing, ASCII frequency counting, String mutability, Two Pointers reversal/palindromes, as well as advanced hard string pattern matching algorithms (Knuth-Morris-Pratt KMP with LPS Array, Z-Algorithm, and Rabin-Karp Rolling Hash).",
    topicVideos: [
      {
        id: "V5-7GzOfADQ",
        title: "9.1 Knuth-Morris-Pratt KMP String Matching Algorithm",
        channel: "Abdul Bari",
        duration: "24 mins"
      },
      {
        id: "BfUejqd07yo",
        title: "Rolling Hash Function Tutorial & String Searching Algorithm",
        channel: "Stable Sort",
        duration: "20 mins"
      }
    ],
    basics: [
      {
        op: "1. ASCII Character Mapping & Frequency Table",
        detail: "Fixed-size frequency array of 256 (or 26 for lowercase a-z) allows constant-time O(1) character counts for Anagram and Substring checks.",
        code: "// Frequency counting\nvector<int> freq(26, 0);\nfor (char c : s) freq[c - 'a']++;"
      },
      {
        op: "2. Two Pointers String Reversal & Palindrome Check",
        detail: "Using left and right pointers moving inward to check or reverse string characters in O(N) time and O(1) space.",
        code: "bool isPalindrome(string s) {\n    int l = 0, r = s.length() - 1;\n    while (l < r) {\n        if (s[l++] != s[r--]) return false;\n    }\n    return true;\n}"
      }
    ],
    patterns: [
      {
        name: "1. Character Frequency & Anagram Hashing Pattern",
        video: {
          id: "9UtInBqnCgA",
          title: "Valid Anagram & Frequency Hashing",
          channel: "NeetCode",
          duration: "10 mins"
        },
        explanation: "Compares frequency vectors of two strings to check for anagram permutation matches in O(N) time.",
        code: "bool isAnagram(string s, string t) {\n    if (s.length() != t.length()) return false;\n    vector<int> count(26, 0);\n    for (int i = 0; i < s.length(); i++) {\n        count[s[i] - 'a']++; count[t[i] - 'a']--;\n    }\n    for (int val : count) if (val != 0) return false;\n    return true;\n}",
        codeWalkthrough: "• Increment count for s[i], decrement count for t[i]. All frequencies must sum to zero.",
        approach: "1. Compare frequency vector counts.",
        timeComplexity: "O(N)",
        spaceComplexity: "O(1) 26-element array",
        whenToApply: "Anagram checks, character permutations.",
        whenNotToApply: "Non-character arbitrary values."
      },
      {
        name: "2. Knuth-Morris-Pratt (KMP) Pattern Search (Hard)",
        video: {
          id: "V5-7GzOfADQ",
          title: "9.1 Knuth-Morris-Pratt KMP String Matching Algorithm",
          channel: "Abdul Bari",
          duration: "24 mins"
        },
        explanation: "Uses Longest Prefix Suffix (LPS) array to avoid text pointer backtracking when pattern matching fails.",
        code: "vector<int> computeLPS(string p) {\n    int m = p.length(), len = 0;\n    vector<int> lps(m, 0);\n    for (int i = 1; i < m;) {\n        if (p[i] == p[len]) lps[i++] = ++len;\n        else if (len != 0) len = lps[len - 1];\n        else lps[i++] = 0;\n    }\n    return lps;\n}",
        codeWalkthrough: "• Precomputes longest proper prefix that is also suffix to skip redundant comparisons.",
        approach: "1. Construct LPS array in O(M).\n2. Search text in single O(N) pass.",
        timeComplexity: "O(N + M)",
        spaceComplexity: "O(M)",
        whenToApply: "Linear time exact pattern matching in long texts.",
        whenNotToApply: "Simple short string equality checks."
      },
      {
        name: "3. Rabin-Karp Rolling Hash Pattern (Hard)",
        video: {
          id: "BfUejqd07yo",
          title: "Rolling Hash Function Tutorial & String Searching Algorithm",
          channel: "Stable Sort",
          duration: "20 mins"
        },
        explanation: "Uses polynomial rolling hash function `H = (H * p + char) % mod` to match pattern hash against sliding window text hash in O(N) average time.",
        code: "// Rolling hash calculation\nlong long hashVal = 0, p = 31, mod = 1e9+7;\nfor (char c : s) {\n    hashVal = (hashVal * p + (c - 'a' + 1)) % mod;\n}",
        codeWalkthrough: "• Slide window and update rolling hash by removing top character contribution and adding new character.",
        approach: "1. Compute initial pattern hash.\n2. Slide window and update text hash in O(1).",
        timeComplexity: "O(N + M) average",
        spaceComplexity: "O(1)",
        whenToApply: "Multiple pattern matching, duplicate substring search.",
        whenNotToApply: "Hash collision prone scenarios without double hashing."
      }
    ],
    complexities: [
      { operation: "Anagram Frequency Count", time: "O(N)", space: "O(1)" },
      { operation: "KMP Pattern Match", time: "O(N + M)", space: "O(M)" },
      { operation: "Rabin-Karp Rolling Hash", time: "O(N + M) avg", space: "O(1)" }
    ],
    strategy: "Frequency table for anagrams -> Two Pointers for palindromes -> KMP/Rabin-Karp for exact pattern matching."
  },

  4: {
    title: "04. Linked List",
    summary: "Non-contiguous linear structure linked via pointers. Allows O(1) dynamic insertions/deletions at known nodes.",
    topicVideos: [
      {
        id: "Nq7ok-OyEpg",
        title: "L1. Introduction to LinkedList | Traversal | Length | Search",
        channel: "take U forward",
        duration: "50 mins"
      }
    ],
    basics: [
      {
        op: "1. Node Architecture & Dummy Head Technique",
        detail: "Nodes consist of data payload and pointer link: `struct Node { int data; Node* next; }`. A dummy head node eliminates null checks when inserting/deleting at head.",
        code: "Node* dummy = new Node(-1);\ndummy->next = head;"
      }
    ],
    patterns: [
      {
        name: "1. Floyd's Cycle Detection (Tortoise and Hare)",
        video: {
          id: "wiOo4DC5GGA",
          title: "L14. Detect a loop or cycle in LinkedList | Proof & Intuition",
          channel: "take U forward",
          duration: "16 mins"
        },
        explanation: "Detects loops using fast (2 steps) and slow (1 step) pointers. Meeting point proves cycle existence.",
        code: "Node *slow = head, *fast = head;\nwhile (fast && fast->next) {\n    slow = slow->next;\n    fast = fast->next->next;\n    if (slow == fast) return true;\n}\nreturn false;",
        codeWalkthrough: "• Move slow by 1, fast by 2. If slow and fast meet, cycle exists.",
        approach: "1. Fast and slow pointers pass.",
        timeComplexity: "O(N)",
        spaceComplexity: "O(1)",
        whenToApply: "Cycle detection, finding middle node, starting node of loop.",
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
        explanation: "Reverses node pointer directions in O(N) time and O(1) auxiliary space using 3 pointers (`prev`, `curr`, `nextTemp`).",
        code: "Node* prev = nullptr, *curr = head;\nwhile (curr) {\n    Node* nextTemp = curr->next;\n    curr->next = prev;\n    prev = curr;\n    curr = nextTemp;\n}\nreturn prev;",
        codeWalkthrough: "• Save next node, flip curr->next to prev, advance prev and curr pointers.",
        approach: "1. Iterative pointer reversal.",
        timeComplexity: "O(N)",
        spaceComplexity: "O(1)",
        whenToApply: "Reversing lists, checking linked list palindromes, reversing in K-groups.",
        whenNotToApply: "Arrays."
      },
      {
        name: "3. Remove N-th Node From End of List",
        video: {
          id: "XVuQxVxj6y8",
          title: "Remove Nth Node From End of List",
          channel: "NeetCode",
          duration: "12 mins"
        },
        explanation: "Advances `fast` pointer by N steps first, then moves `fast` and `slow` together until `fast` reaches tail node.",
        code: "Node* dummy = new Node(0, head);\nNode *fast = dummy, *slow = dummy;\nfor (int i = 0; i < n; i++) fast = fast->next;\nwhile (fast->next) {\n    fast = fast->next;\n    slow = slow->next;\n}\nslow->next = slow->next->next;\nreturn dummy->next;",
        codeWalkthrough: "• Maintain N node gap between fast and slow. When fast reaches end, slow sits right before target node.",
        approach: "1. Advance fast by N steps.\n2. Move fast and slow together.",
        timeComplexity: "O(N)",
        spaceComplexity: "O(1)",
        whenToApply: "Finding or deleting N-th node from tail in single pass.",
        whenNotToApply: "Double-linked lists where prev pointer exists."
      }
    ],
    complexities: [
      { operation: "Head Insertion / Deletion", time: "O(1)", space: "O(1)" },
      { operation: "Cycle Detection", time: "O(N)", space: "O(1)" },
      { operation: "List Reversal", time: "O(N)", space: "O(1)" }
    ],
    strategy: "Dummy head node to avoid null checks -> Fast & Slow pointers for cycles/middle."
  },

  5: {
    title: "05. Recursion & Backtracking",
    summary: "Recursive call stack execution exploring subproblems and backtracking on invalid choice branches.",
    topicVideos: [
      {
        id: "yVdKa8dnKiE",
        title: "Re 1. Introduction to Recursion | Recursion Tree | Stack Space",
        channel: "take U forward",
        duration: "40 mins"
      }
    ],
    basics: [
      {
        op: "1. Call Stack Frame & Base Case",
        detail: "Every recursive call pushes a frame onto the system call stack. Base case guarantees recursion termination preventing StackOverflowError.",
        code: "void solve(int n) {\n    if (n == 0) return; // Base Case\n    solve(n - 1); // Recursive Call\n}"
      }
    ],
    patterns: [
      {
        name: "1. Subsequences Pick / Non-Pick Pattern",
        video: {
          id: "AxNNVECce8c",
          title: "L6. Recursion on Subsequences | Printing Subsequences",
          channel: "take U forward",
          duration: "20 mins"
        },
        explanation: "Explores inclusion vs exclusion choice branches for every element generating 2^N total subsets.",
        code: "void solve(int idx, vector<int>& ds, vector<int>& nums) {\n    if (idx == nums.size()) { print(ds); return; }\n    ds.push_back(nums[idx]); solve(idx + 1, ds, nums); // Pick\n    ds.pop_back(); solve(idx + 1, ds, nums); // Non-Pick / Backtrack\n}",
        codeWalkthrough: "• Recurse with element included, backtrack to explore exclusion.",
        approach: "1. Base case when idx == n.\n2. Recurse pick and non-pick branches.",
        timeComplexity: "O(2^N)",
        spaceComplexity: "O(N) call stack",
        whenToApply: "Generating all subsets, combinations, permutation decision trees.",
        whenNotToApply: "Large N where 2^N exceeds time limit."
      },
      {
        name: "2. Subset Sum II (Duplicate Skipping Pattern)",
        video: {
          id: "rYjiPPAjF90",
          title: "Subset Sum II | Duplicate Skipping Pattern",
          channel: "take U forward",
          duration: "16 mins"
        },
        explanation: "Sorts input array first and skips duplicate choices at same recursion depth `if (i > idx && nums[i] == nums[i-1]) continue` to avoid duplicate subsets.",
        code: "void findSubsets(int idx, vector<int>& nums, vector<int>& ds) {\n    ans.push_back(ds);\n    for (int i = idx; i < nums.size(); i++) {\n        if (i > idx && nums[i] == nums[i - 1]) continue; // Skip duplicates\n        ds.push_back(nums[i]);\n        findSubsets(i + 1, nums, ds);\n        ds.pop_back();\n    }\n}",
        codeWalkthrough: "• Sort array. Loop skips duplicate element choices at current branch depth.",
        approach: "1. Sort array.\n2. Skip duplicates `i > idx && nums[i] == nums[i-1]`.",
        timeComplexity: "O(2^N)",
        spaceComplexity: "O(N)",
        whenToApply: "Subsets/Combinations with duplicate input numbers.",
        whenNotToApply: "All input elements are distinct."
      },
      {
        name: "3. N-Queens & Backtracking Validation",
        video: {
          id: "Ph95IHm3F1s",
          title: "N-Queens Problem - Backtracking Algorithm",
          channel: "NeetCode",
          duration: "18 mins"
        },
        explanation: "Places Queens row-by-row and uses bitmask or boolean arrays (col, upperDiag, lowerDiag) to check attack collisions in O(1) time.",
        code: "void solveNQueens(int col, vector<string>& board) {\n    if (col == n) { ans.push_back(board); return; }\n    for (int row = 0; row < n; row++) {\n        if (!leftRow[row] && !lowerDiag[row + col] && !upperDiag[n - 1 + col - row]) {\n            leftRow[row] = lowerDiag[row + col] = upperDiag[n - 1 + col - row] = 1;\n            board[row][col] = 'Q';\n            solveNQueens(col + 1, board);\n            board[row][col] = '.'; // Backtrack\n            leftRow[row] = lowerDiag[row + col] = upperDiag[n - 1 + col - row] = 0;\n        }\n    }\n}",
        codeWalkthrough: "• Check attack collision using lookup arrays, place Queen, recurse, and clear lookup array on backtrack.",
        approach: "1. Row/Col placement pass.\n2. Quick attack check using hash vectors.",
        timeComplexity: "O(N!)",
        spaceComplexity: "O(N)",
        whenToApply: "N-Queens, Sudoku Solver, Knight Tour, Grid Backtracking.",
        whenNotToApply: "Polynomial time solvable problems."
      }
    ],
    complexities: [
      { operation: "Subset Generation", time: "O(2^N)", space: "O(N)" },
      { operation: "Permutation Generation", time: "O(N!)", space: "O(N)" }
    ],
    strategy: "Identify base cases -> Draw decision tree -> Use hash sets to validate placement."
  },

  6: {
    title: "06. Bit Manipulation",
    summary: "Manipulating binary bit representation of integers directly using bitwise AND, OR, XOR, NOT, and bit shifts.",
    topicVideos: [
      {
        id: "NLKQEOgBAnw",
        title: "Algorithms: Bit Manipulation Tutorial",
        channel: "HackerRank",
        duration: "25 mins"
      },
      {
        id: "ZwU6wSkepBI",
        title: "L2 | Bit Manipulations | Problem Solving on Bit Manipulations",
        channel: "take U forward",
        duration: "20 mins"
      }
    ],
    basics: [
      {
        op: "1. Bitwise Operators & Masking",
        detail: "Check k-th bit (`n & (1 << k)`), Set k-th bit (`n | (1 << k)`), Clear k-th bit (`n & ~(1 << k)`), Toggle k-th bit (`n ^ (1 << k)`), Check Power of 2 (`(n & (n - 1)) == 0`).",
        code: "bool isSet(int n, int k) { return (n & (1 << k)) != 0; }\nint setBit(int n, int k) { return n | (1 << k); }"
      }
    ],
    patterns: [
      {
        name: "1. Single Number & XOR Properties",
        video: {
          id: "XnOad556sKw",
          title: "Single Number - XOR Bitwise Operations",
          channel: "NeetCode",
          duration: "10 mins"
        },
        explanation: "Uses XOR identity `a ^ a = 0` and `a ^ 0 = a` to cancel out pairs in O(N) time and O(1) space.",
        code: "int singleNumber(vector<int>& nums) {\n    int xorVal = 0;\n    for (int num : nums) xorVal ^= num;\n    return xorVal;\n}",
        codeWalkthrough: "• Pair elements cancel to 0 under XOR, leaving the unique single number.",
        approach: "1. XOR all numbers together.",
        timeComplexity: "O(N)",
        spaceComplexity: "O(1)",
        whenToApply: "Finding single non-duplicate number, missing number.",
        whenNotToApply: "Elements appear odd number of times."
      },
      {
        name: "2. Brian Kernighan's Algorithm (Set Bit Counting)",
        video: {
          id: "ZwU6wSkepBI",
          title: "Brian Kernighan's Algorithm - Count Set Bits",
          channel: "take U forward",
          duration: "12 mins"
        },
        explanation: "Counts set bits in O(SetBits) time by repeatedly clearing the rightmost set bit using `n = n & (n - 1)`.",
        code: "int countSetBits(int n) {\n    int count = 0;\n    while (n > 0) {\n        n = n & (n - 1); // Clears rightmost set bit\n        count++;\n    }\n    return count;\n}",
        codeWalkthrough: "• `n & (n - 1)` turns off the lowest 1-bit in constant time.",
        approach: "1. Repeat `n = n & (n - 1)` until n == 0.",
        timeComplexity: "O(Number of Set Bits)",
        spaceComplexity: "O(1)",
        whenToApply: "Counting set bits (Hamming Weight).",
        whenNotToApply: "Non-integer data types."
      }
    ],
    complexities: [
      { operation: "Bit Masking", time: "O(1)", space: "O(1)" },
      { operation: "Kernighan Bit Count", time: "O(SetBits)", space: "O(1)" }
    ],
    strategy: "XOR cancels identical numbers -> `n & (n - 1)` clears lowest 1-bit."
  },

  7: {
    title: "07. Stack and Queues",
    summary: "Stack (LIFO - Last In First Out) and Queue (FIFO - First In First Out) linear data structures.",
    topicVideos: [
      {
        id: "GYptUgnIM_I",
        title: "Implementation of Stack using Arrays",
        channel: "take U forward",
        duration: "25 mins"
      }
    ],
    basics: [
      {
        op: "1. Stack LIFO vs Queue FIFO Operations",
        detail: "Stack push/pop occurs at top (O(1)). Queue enqueue occurs at rear and dequeue at front (O(1)).",
        code: "// Stack Push & Pop\nstack<int> st;\nst.push(10); st.pop();"
      }
    ],
    patterns: [
      {
        name: "1. Monotonic Stack (Next Greater / Smaller Element)",
        video: {
          id: "Dq_ObZwTY_U",
          title: "Next Greater Element using Monotonic Stack",
          channel: "NeetCode",
          duration: "14 mins"
        },
        explanation: "Maintains stack elements in strictly increasing or decreasing order. When encountering a larger element, pop elements from stack to assign their next greater element.",
        code: "stack<int> st;\nvector<int> ans(n, -1);\nfor (int i = 0; i < n; i++) {\n    while (!st.empty() && arr[i] > arr[st.top()]) {\n        ans[st.top()] = arr[i]; st.pop();\n    }\n    st.push(i);\n}",
        codeWalkthrough: "• Maintain index stack. Current element pops smaller elements from stack.",
        approach: "1. Maintain monotonic stack of indices.",
        timeComplexity: "O(N)",
        spaceComplexity: "O(N)",
        whenToApply: "Next Greater Element I & II, Daily Temperatures, Stock Span.",
        whenNotToApply: "Random index queries."
      },
      {
        name: "2. Trapping Rainwater (Two Pointers / Stack)",
        video: {
          id: "m18Hntz4go8",
          title: "Trapping Rainwater | Brute | Better | Optimal | with INTUITION",
          channel: "take U forward",
          duration: "25 mins"
        },
        explanation: "Calculates trapped water at index i as `min(leftMax, rightMax) - height[i]` using Two Pointers moving inward.",
        code: "int l = 0, r = n - 1, leftMax = 0, rightMax = 0, water = 0;\nwhile (l < r) {\n    if (height[l] <= height[r]) {\n        if (height[l] >= leftMax) leftMax = height[l];\n        else water += leftMax - height[l];\n        l++;\n    } else {\n        if (height[r] >= rightMax) rightMax = height[r];\n        else water += rightMax - height[r];\n        r--;\n    }\n}",
        codeWalkthrough: "• Move smaller height pointer inward while maintaining leftMax and rightMax boundaries.",
        approach: "1. Two pointers moving inward.",
        timeComplexity: "O(N)",
        spaceComplexity: "O(1)",
        whenToApply: "Trapping rainwater, container with most water.",
        whenNotToApply: "2D Grid water trapping."
      }
    ],
    complexities: [
      { operation: "Push / Pop", time: "O(1)", space: "O(N)" },
      { operation: "Monotonic Stack Pass", time: "O(N)", space: "O(N)" }
    ],
    strategy: "Next Greater/Smaller -> Monotonic Stack. Trapping Water -> Two Pointers."
  },

  8: {
    title: "08. Sliding Window & Two Pointers",
    summary: "Subarray window optimization over sequential data structures avoiding nested O(N^2) loops.",
    topicVideos: [
      {
        id: "3IETreEybaA",
        title: "LeetCode Longest Substring Without Repeating Characters Solution Explained",
        channel: "Nick White",
        duration: "14 mins"
      }
    ],
    basics: [
      {
        op: "1. Window Expansion & Contraction Mechanics",
        detail: "Expand right boundary to include new elements, contract left boundary when window constraint is violated.",
        code: "int left = 0;\nfor (int right = 0; right < n; right++) {\n    windowSum += arr[right];\n    while (windowSum > target) windowSum -= arr[left++];\n}"
      }
    ],
    patterns: [
      {
        name: "1. Variable Size Sliding Window (Longest Substring Without Repeating Characters)",
        video: {
          id: "3IETreEybaA",
          title: "LeetCode Longest Substring Without Repeating Characters Solution Explained",
          channel: "Nick White",
          duration: "14 mins"
        },
        explanation: "Expands right window boundary until duplicate found, then shrinks left boundary to restore valid window.",
        code: "unordered_set<char> charSet;\nint left = 0, maxLen = 0;\nfor (int right = 0; right < s.length(); right++) {\n    while (charSet.count(s[right])) charSet.erase(s[left++]);\n    charSet.insert(s[right]);\n    maxLen = max(maxLen, right - left + 1);\n}",
        codeWalkthrough: "• Expand right index, shrink left index on duplicate character.",
        approach: "1. Expand right.\n2. Shrink left on violation.",
        timeComplexity: "O(N)",
        spaceComplexity: "O(K)",
        whenToApply: "Longest/Shortest subarray with character/sum constraint.",
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
    summary: "Complete binary tree maintaining min-heap or max-heap property for fast O(1) top access and O(log N) insert/delete.",
    topicVideos: [
      {
        id: "HqPJF2L5h9U",
        title: "2.6.3 Heap - Heap Sort - Heapify - Priority Queues",
        channel: "Abdul Bari",
        duration: "35 mins"
      },
      {
        id: "t0Cq6tVNRBA",
        title: "Data Structures: Heaps Tutorial",
        channel: "HackerRank",
        duration: "18 mins"
      }
    ],
    basics: [],
    patterns: [
      {
        name: "1. Top-K Elements / Min-Heap Pattern",
        video: {
          id: "t0Cq6tVNRBA",
          title: "Data Structures: Heaps Tutorial",
          channel: "HackerRank",
          duration: "18 mins"
        },
        explanation: "Maintains a Min-Heap of size K. If heap size exceeds K, pop top element, leaving K largest elements in heap.",
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
    strategy: "Min-Heap for Top-K Largest, Max-Heap for Top-K Smallest."
  },

  10: {
    title: "10. Greedy Approach",
    summary: "Making locally optimal choices at each step to reach a global optimum.",
    topicVideos: [
      {
        id: "ARvQcqJ_-NY",
        title: "3. Greedy Method - Introduction & Applications",
        channel: "Abdul Bari",
        duration: "30 mins"
      }
    ],
    basics: [
      {
        op: "1. Optimal Substructure & Choice Property",
        detail: "Greedy choice property guarantees that choosing local optimal choice yields global optimal solution.",
        code: "// Sort intervals by finish time\nsort(intervals.begin(), intervals.end(), cmp);"
      }
    ],
    patterns: [
      {
        name: "1. Activity Selection / Interval Scheduling",
        video: {
          id: "ARvQcqJ_-NY",
          title: "3. Greedy Method - Introduction & Applications",
          channel: "Abdul Bari",
          duration: "30 mins"
        },
        explanation: "Sorts activities by finish time to greedily select maximum non-overlapping intervals.",
        code: "sort(meetings.begin(), meetings.end(), [](auto& a, auto& b) { return a.end < b.end; });\nint count = 1, limit = meetings[0].end;\nfor (int i = 1; i < n; i++) {\n    if (meetings[i].start > limit) { count++; limit = meetings[i].end; }\n}",
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
    topicVideos: [
      {
        id: "_ANrF3FJm7I",
        title: "L1. Introduction to Trees | Types of Trees",
        channel: "take U forward",
        duration: "45 mins"
      }
    ],
    basics: [],
    patterns: [
      {
        name: "1. Height & Diameter of Binary Tree",
        video: {
          id: "Rezetez59Nk",
          title: "L16. Diameter of Binary Tree | C++ | Java",
          channel: "take U forward",
          duration: "18 mins"
        },
        explanation: "Computes tree height recursively `1 + max(lh, rh)` and updates global max diameter (`lh + rh`).",
        code: "int getHeight(TreeNode* root) {\n    if (!root) return 0;\n    int lh = getHeight(root->left);\n    int rh = getHeight(root->right);\n    maxDiameter = max(maxDiameter, lh + rh);\n    return 1 + max(lh, rh);\n}",
        codeWalkthrough: "• Calculate left and right subtree heights recursively.",
        approach: "1. Recurse on left and right subtrees.",
        timeComplexity: "O(N)",
        spaceComplexity: "O(H)",
        whenToApply: "Tree height, diameter, balance checks.",
        whenNotToApply: "Graphs with cycles."
      }
    ],
    complexities: [
      { operation: "DFS Traversal", time: "O(N)", space: "O(H)" }
    ],
    strategy: "Recurse on left and right subtrees."
  },

  12: {
    title: "12. Binary Search Trees",
    summary: "Binary tree with invariant Left < Node < Right for all nodes.",
    topicVideos: [
      {
        id: "pYT9F8_LFTM",
        title: "Data structures: Binary Search Tree",
        channel: "mycodeschool",
        duration: "30 mins"
      }
    ],
    basics: [],
    patterns: [
      {
        name: "1. Validate Binary Search Tree (Range Check)",
        video: {
          id: "s6ATEkipzow",
          title: "Validate Binary Search Tree",
          channel: "NeetCode",
          duration: "12 mins"
        },
        explanation: "Validates BST invariant recursively passing valid min and max node value bounds `(minVal < node->val < maxVal)`.",
        code: "bool isValidBST(TreeNode* root, long long minVal, long long maxVal) {\n    if (!root) return true;\n    if (root->val <= minVal || root->val >= maxVal) return false;\n    return isValidBST(root->left, minVal, root->val) && isValidBST(root->right, root->val, maxVal);\n}",
        codeWalkthrough: "• Left subtree must be < root->val; Right subtree must be > root->val.",
        approach: "1. Pass minVal and maxVal bounds.",
        timeComplexity: "O(N)",
        spaceComplexity: "O(H)",
        whenToApply: "Validating BST property.",
        whenNotToApply: "General binary trees."
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
    topicVideos: [
      {
        id: "M3_pLsDdeuU",
        title: "G-1. Introduction to Graph | Types & Conventions",
        channel: "take U forward",
        duration: "35 mins"
      },
      {
        id: "-tgVpUgsQ5k",
        title: "G-5. Breadth-First Search (BFS) | Traversal Technique",
        channel: "take U forward",
        duration: "22 mins"
      }
    ],
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
    topicVideos: [
      {
        id: "oBt53YbR9Kk",
        title: "Dynamic Programming - Learn to Solve Algorithmic Problems",
        channel: "freeCodeCamp.org",
        duration: "65 mins"
      }
    ],
    basics: [],
    patterns: [
      {
        name: "1. 0/1 Knapsack Pattern",
        video: {
          id: "oBt53YbR9Kk",
          title: "Dynamic Programming - Learn to Solve Algorithmic Problems",
          channel: "freeCodeCamp.org",
          duration: "65 mins"
        },
        explanation: "At item i with capacity w, choose max of excluding item or including item.",
        code: "for (int i = 1; i <= n; i++) {\n    for (int w = 0; w <= W; w++) {\n        if (wt[i-1] <= w) {\n            dp[i][w] = max(dp[i-1][w], val[i-1] + dp[i-1][w - wt[i-1]]);\n        } else dp[i][w] = dp[i-1][w];\n    }\n}",
        codeWalkthrough: "• Max of excluding item or including item.",
        approach: "1. State dp[i][w].",
        timeComplexity: "O(N * W)",
        spaceComplexity: "O(N * W)",
        whenToApply: "Subset sum, target sum, knapsack.",
        whenNotToApply: "Fractional items."
      }
    ],
    complexities: [
      { operation: "DP Tabulation", time: "O(States)", space: "O(States)" }
    ],
    strategy: "Define state space, base cases, and transition equation."
  },

  15: {
    title: "15. Tries",
    summary: "Tree structure storing character prefixes for fast string lookup.",
    topicVideos: [
      {
        id: "dBGUmUQhjaM",
        title: "L1. Implement TRIE | INSERT | SEARCH | STARTSWITH",
        channel: "take U forward",
        duration: "35 mins"
      }
    ],
    basics: [],
    patterns: [
      {
        name: "1. Prefix Tree Insert & Search",
        video: {
          id: "dBGUmUQhjaM",
          title: "L1. Implement TRIE | INSERT | SEARCH | STARTSWITH",
          channel: "take U forward",
          duration: "35 mins"
        },
        explanation: "Traverses character children pointers in O(L) time.",
        code: "void insert(string word) {\n    TrieNode* curr = root;\n    for (char c : word) {\n        int idx = c - 'a';\n        if (!curr->children[idx]) curr->children[idx] = new TrieNode();\n        curr = curr->children[idx];\n    }\n    curr->isWord = true;\n}",
        codeWalkthrough: "• Follow or create character child pointer.",
        approach: "1. Traverse character pointers.",
        timeComplexity: "O(L)",
        spaceComplexity: "O(N * L * 26)",
        whenToApply: "Autocomplete, prefix matching.",
        whenNotToApply: "Simple string equality."
      }
    ],
    complexities: [
      { operation: "Trie Search", time: "O(L)", space: "O(N * L * 26)" }
    ],
    strategy: "Use Tries for prefix-based string lookups."
  },

  16: {
    // Topic 16 maps to 03. Strings & Advanced String Algorithms
    title: "16. Strings (Advanced Hard)",
    summary: "Advanced hard string pattern matching algorithms (Knuth-Morris-Pratt KMP with LPS Array, Z-Algorithm, and Rabin-Karp Rolling Hash).",
    topicVideos: [
      {
        id: "V5-7GzOfADQ",
        title: "9.1 Knuth-Morris-Pratt KMP String Matching Algorithm",
        channel: "Abdul Bari",
        duration: "24 mins"
      },
      {
        id: "BfUejqd07yo",
        title: "Rolling Hash Function Tutorial & String Searching Algorithm",
        channel: "Stable Sort",
        duration: "20 mins"
      }
    ],
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
        approach: "1. Build LPS array in O(M).",
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
