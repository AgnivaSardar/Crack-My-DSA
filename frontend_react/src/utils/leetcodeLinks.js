// Mapping of common Striver's A2Z & company DSA problem titles to verified LeetCode problem URLs
const LEETCODE_EXACT_MAP = {
  // Arrays & Basics
  "pascal triangle": "https://leetcode.com/problems/pascals-triangle/",
  "pascals triangle": "https://leetcode.com/problems/pascals-triangle/",
  "set matrix zeroes": "https://leetcode.com/problems/set-matrix-zeroes/",
  "sort an array of 0s, 1s and 2s": "https://leetcode.com/problems/sort-colors/",
  "sort colors": "https://leetcode.com/problems/sort-colors/",
  "maximum subarray sum": "https://leetcode.com/problems/maximum-subarray/",
  "maximum subarray": "https://leetcode.com/problems/maximum-subarray/",
  "stock buy and sell": "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/",
  "best time to buy and sell stock": "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/",
  "rearrange array elements by sign": "https://leetcode.com/problems/rearrange-array-elements-by-sign/",
  "next permutation": "https://leetcode.com/problems/next-permutation/",
  "leaders in an array": "https://leetcode.com/problemset/?search=Leaders+in+an+Array",
  "longest consecutive sequence": "https://leetcode.com/problems/longest-consecutive-sequence/",
  "count subarrays with given sum": "https://leetcode.com/problems/subarray-sum-equals-k/",
  "subarray sum equals k": "https://leetcode.com/problems/subarray-sum-equals-k/",
  "majority element (>n/2 times)": "https://leetcode.com/problems/majority-element/",
  "majority element": "https://leetcode.com/problems/majority-element/",
  "majority element (>n/3 times)": "https://leetcode.com/problems/majority-element-ii/",
  "majority element ii": "https://leetcode.com/problems/majority-element-ii/",
  "3 sum": "https://leetcode.com/problems/3sum/",
  "3sum": "https://leetcode.com/problems/3sum/",
  "4 sum": "https://leetcode.com/problems/4sum/",
  "4sum": "https://leetcode.com/problems/4sum/",
  "merge overlapping subintervals": "https://leetcode.com/problems/merge-intervals/",
  "merge intervals": "https://leetcode.com/problems/merge-intervals/",
  "merge two sorted arrays without extra space": "https://leetcode.com/problems/merge-sorted-array/",
  "merge sorted array": "https://leetcode.com/problems/merge-sorted-array/",
  "find the repeating and missing numbers": "https://leetcode.com/problems/find-missing-and-repeated-values/",
  "missing and repeating numbers": "https://leetcode.com/problems/find-missing-and-repeated-values/",
  "count inversions": "https://leetcode.com/problemset/?search=Count+Inversions",
  "reverse pairs": "https://leetcode.com/problems/reverse-pairs/",
  "maximum product subarray": "https://leetcode.com/problems/maximum-product-subarray/",
  "two sum": "https://leetcode.com/problems/two-sum/",
  "add two numbers": "https://leetcode.com/problems/add-two-numbers/",

  // Binary Search
  "search in a 2d matrix": "https://leetcode.com/problems/search-a-2d-matrix/",
  "search a 2d matrix": "https://leetcode.com/problems/search-a-2d-matrix/",
  "search in a row-wise and column-wise sorted matrix": "https://leetcode.com/problems/search-a-2d-matrix-ii/",
  "search a 2d matrix ii": "https://leetcode.com/problems/search-a-2d-matrix-ii/",
  "find peak element": "https://leetcode.com/problems/find-peak-element/",
  "find minimum in rotated sorted array": "https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/",
  "search in rotated sorted array": "https://leetcode.com/problems/search-in-rotated-sorted-array/",
  "single element in a rotated sorted array": "https://leetcode.com/problems/single-element-in-a-sorted-array/",
  "kth element of two sorted arrays": "https://leetcode.com/problems/kth-smallest-element-in-a-sorted-matrix/",

  // Strings
  "valid anagram": "https://leetcode.com/problems/valid-anagram/",
  "valid palindrome": "https://leetcode.com/problems/valid-palindrome/",
  "longest substring without repeating characters": "https://leetcode.com/problems/longest-substring-without-repeating-characters/",
  "string to integer (atoi)": "https://leetcode.com/problems/string-to-integer-atoi/",
  "roman to integer": "https://leetcode.com/problems/roman-to-integer/",
  "longest common prefix": "https://leetcode.com/problems/longest-common-prefix/",

  // Linked List
  "reverse a linked list": "https://leetcode.com/problems/reverse-linked-list/",
  "reverse linked list": "https://leetcode.com/problems/reverse-linked-list/",
  "middle of the linked list": "https://leetcode.com/problems/middle-of-the-linked-list/",
  "detect a cycle in linked list": "https://leetcode.com/problems/linked-list-cycle/",
  "linked list cycle": "https://leetcode.com/problems/linked-list-cycle/",
  "remove nth node from end of list": "https://leetcode.com/problems/remove-nth-node-from-end-of-list/",
  "delete node in a linked list": "https://leetcode.com/problems/delete-node-in-a-linked-list/",

  // Trees & Graphs
  "binary tree inorder traversal": "https://leetcode.com/problems/binary-tree-inorder-traversal/",
  "binary tree preorder traversal": "https://leetcode.com/problems/binary-tree-preorder-traversal/",
  "binary tree postorder traversal": "https://leetcode.com/problems/binary-tree-postorder-traversal/",
  "maximum depth of binary tree": "https://leetcode.com/problems/maximum-depth-of-binary-tree/",
  "invert binary tree": "https://leetcode.com/problems/invert-binary-tree/",
  "lowest common ancestor of a binary tree": "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/",
  "number of islands": "https://leetcode.com/problems/number-of-islands/",

  // DP
  "climbing stairs": "https://leetcode.com/problems/climbing-stairs/",
  "coin change": "https://leetcode.com/problems/coin-change/",
  "longest increasing subsequence": "https://leetcode.com/problems/longest-increasing-subsequence/",
  "house robber": "https://leetcode.com/problems/house-robber/"
}

/**
 * Returns a valid, working LeetCode URL for a problem.
 * If rawLink is missing or invalid, or if title maps to a known valid LeetCode URL,
 * it returns the exact LeetCode URL or a search fallback URL that will not 404.
 */
export function getValidLeetCodeLink(title = '', rawLink = '') {
  const cleanTitle = title.trim().toLowerCase()

  // 1. Check exact title mapping first
  if (LEETCODE_EXACT_MAP[cleanTitle]) {
    return LEETCODE_EXACT_MAP[cleanTitle]
  }

  // 2. If rawLink is provided and appears valid (not empty or '#')
  if (rawLink && typeof rawLink === 'string' && rawLink.startsWith('http')) {
    // If rawLink is a direct leetcode link with a clean slug, return it
    if (rawLink.includes('leetcode.com/problems/')) {
      return rawLink
    }
  }

  // 3. Fallback: Search LeetCode for problem title (guaranteed working link, no 404)
  if (cleanTitle) {
    return `https://leetcode.com/problemset/?search=${encodeURIComponent(title.trim())}`
  }

  return 'https://leetcode.com/problemset/all/'
}
