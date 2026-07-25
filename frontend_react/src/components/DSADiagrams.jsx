import React from 'react'

// Rich Visual Diagrams for all 16 DSA Topics
export function DSADiagram({ topicId }) {
  switch (topicId) {
    case 1: // Arrays
      return (
        <div className="dsa-svg-diagram-card">
          <div className="dsa-diagram-header">
            <span className="dsa-diagram-tag">Visual Memory Architecture</span>
            <span className="dsa-diagram-title">Contiguous RAM Address Offsets & Two Pointers Traversal</span>
          </div>
          <svg viewBox="0 0 760 190" className="dsa-svg-canvas">
            {/* Memory Addresses */}
            <text x="40" y="25" fill="#94a3b8" fontSize="11" fontFamily="monospace">Physical RAM:</text>
            <text x="165" y="25" fill="#64748b" fontSize="11" fontFamily="monospace">0x7FFF00</text>
            <text x="265" y="25" fill="#64748b" fontSize="11" fontFamily="monospace">0x7FFF04</text>
            <text x="365" y="25" fill="#64748b" fontSize="11" fontFamily="monospace">0x7FFF08</text>
            <text x="465" y="25" fill="#64748b" fontSize="11" fontFamily="monospace">0x7FFF0C</text>
            <text x="565" y="25" fill="#64748b" fontSize="11" fontFamily="monospace">0x7FFF10</text>

            {/* Array Cells */}
            <rect x="120" y="35" width="90" height="55" rx="6" fill="#1e1e24" stroke="#38bdf8" strokeWidth="2.5" />
            <text x="165" y="68" fill="#f8fafc" fontSize="17" fontWeight="bold" textAnchor="middle">10</text>
            <text x="165" y="105" fill="#38bdf8" fontSize="12" fontFamily="monospace" textAnchor="middle">Index [0]</text>

            <rect x="220" y="35" width="90" height="55" rx="6" fill="#1e1e24" stroke="#334155" strokeWidth="1.5" />
            <text x="265" y="68" fill="#f8fafc" fontSize="17" fontWeight="bold" textAnchor="middle">25</text>
            <text x="265" y="105" fill="#94a3b8" fontSize="12" fontFamily="monospace" textAnchor="middle">Index [1]</text>

            <rect x="320" y="35" width="90" height="55" rx="6" fill="#1e1e24" stroke="#334155" strokeWidth="1.5" />
            <text x="365" y="68" fill="#f8fafc" fontSize="17" fontWeight="bold" textAnchor="middle">38</text>
            <text x="365" y="105" fill="#94a3b8" fontSize="12" fontFamily="monospace" textAnchor="middle">Index [2]</text>

            <rect x="420" y="35" width="90" height="55" rx="6" fill="#1e1e24" stroke="#334155" strokeWidth="1.5" />
            <text x="465" y="68" fill="#f8fafc" fontSize="17" fontWeight="bold" textAnchor="middle">62</text>
            <text x="465" y="105" fill="#94a3b8" fontSize="12" fontFamily="monospace" textAnchor="middle">Index [3]</text>

            <rect x="520" y="35" width="90" height="55" rx="6" fill="#1e1e24" stroke="#f43f5e" strokeWidth="2.5" />
            <text x="565" y="68" fill="#f8fafc" fontSize="17" fontWeight="bold" textAnchor="middle">90</text>
            <text x="565" y="105" fill="#f43f5e" fontSize="12" fontFamily="monospace" textAnchor="middle">Index [4]</text>

            {/* Two Pointers Markers */}
            <path d="M 165 145 L 165 118" stroke="#34d399" strokeWidth="2.5" />
            <text x="165" y="162" fill="#34d399" fontSize="12" fontWeight="bold" textAnchor="middle">Left Pointer →</text>

            <path d="M 565 145 L 565 118" stroke="#f43f5e" strokeWidth="2.5" />
            <text x="565" y="162" fill="#f43f5e" fontSize="12" fontWeight="bold" textAnchor="middle">← Right Pointer</text>

            <text x="365" y="180" fill="#cbd5e1" fontSize="11" textAnchor="middle">Direct Index Access: Address = Base (0x7FFF00) + (i * 4 bytes) → O(1) Time</text>
          </svg>
        </div>
      )

    case 2: // Binary Search
      return (
        <div className="dsa-svg-diagram-card">
          <div className="dsa-diagram-header">
            <span className="dsa-diagram-tag">Visual Search Space</span>
            <span className="dsa-diagram-title">Monotonic Boundary Elimination (O(log N))</span>
          </div>
          <svg viewBox="0 0 760 180" className="dsa-svg-canvas">
            { [3, 8, 14, 20, 29, 37, 45, 58, 80].map((num, i) => (
              <g key={i}>
                <rect
                  x={35 + i * 76}
                  y={40}
                  width="68"
                  height="50"
                  rx="6"
                  fill={i === 4 ? "#0284c7" : i < 4 ? "#1e293b" : "#0f172a"}
                  stroke={i === 4 ? "#38bdf8" : "#334155"}
                  strokeWidth="2"
                />
                <text x={69 + i * 76} y={70} fill="#f8fafc" fontSize="16" fontWeight="bold" textAnchor="middle">{num}</text>
                <text x={69 + i * 76} y={104} fill="#94a3b8" fontSize="11" fontFamily="monospace" textAnchor="middle">[{i}]</text>
              </g>
            ))}

            <text x="69" y="132" fill="#34d399" fontSize="12" fontWeight="bold" textAnchor="middle">Low (0)</text>
            <text x="373" y="132" fill="#38bdf8" fontSize="13" fontWeight="bold" textAnchor="middle">Mid (4) = 29</text>
            <text x="677" y="132" fill="#f43f5e" fontSize="12" fontWeight="bold" textAnchor="middle">High (8)</text>

            <path d="M 69 140 L 330 140" stroke="#f43f5e" strokeWidth="2" strokeDasharray="4" />
            <text x="200" y="162" fill="#f43f5e" fontSize="11" textAnchor="middle">Target (45) &gt; 29 → Eliminate Left Half</text>
          </svg>
        </div>
      )

    case 4: // Linked List
      return (
        <div className="dsa-svg-diagram-card">
          <div className="dsa-diagram-header">
            <span className="dsa-diagram-tag">Pointer Node Architecture</span>
            <span className="dsa-diagram-title">Non-Contiguous Heap Nodes & Pointer Re-linking</span>
          </div>
          <svg viewBox="0 0 760 170" className="dsa-svg-canvas">
            {/* Head Pointer */}
            <text x="50" y="25" fill="#34d399" fontSize="12" fontWeight="bold">Head = 0xAA00</text>

            {/* Node 1 */}
            <g transform="translate(40, 35)">
              <rect x="0" y="0" width="120" height="50" rx="6" fill="#1e1e24" stroke="#34d399" strokeWidth="2.5" />
              <line x1="75" y1="0" x2="75" y2="50" stroke="#34d399" strokeWidth="1.5" />
              <text x="37" y="30" fill="#f8fafc" fontSize="15" fontWeight="bold" textAnchor="middle">100</text>
              <text x="97" y="30" fill="#38bdf8" fontSize="10" fontFamily="monospace" textAnchor="middle">0xBB00</text>
              <text x="60" y="70" fill="#94a3b8" fontSize="11" textAnchor="middle">Node @ 0xAA00</text>
            </g>

            <path d="M 160 60 L 230 60" stroke="#38bdf8" strokeWidth="2.5" />

            {/* Node 2 */}
            <g transform="translate(240, 35)">
              <rect x="0" y="0" width="120" height="50" rx="6" fill="#1e1e24" stroke="#38bdf8" strokeWidth="2" />
              <line x1="75" y1="0" x2="75" y2="50" stroke="#38bdf8" strokeWidth="1.5" />
              <text x="37" y="30" fill="#f8fafc" fontSize="15" fontWeight="bold" textAnchor="middle">250</text>
              <text x="97" y="30" fill="#38bdf8" fontSize="10" fontFamily="monospace" textAnchor="middle">0xCC00</text>
              <text x="60" y="70" fill="#94a3b8" fontSize="11" textAnchor="middle">Node @ 0xBB00</text>
            </g>

            <path d="M 360 60 L 430 60" stroke="#38bdf8" strokeWidth="2.5" />

            {/* Node 3 */}
            <g transform="translate(440, 35)">
              <rect x="0" y="0" width="120" height="50" rx="6" fill="#1e1e24" stroke="#f43f5e" strokeWidth="2" />
              <line x1="75" y1="0" x2="75" y2="50" stroke="#f43f5e" strokeWidth="1.5" />
              <text x="37" y="30" fill="#f8fafc" fontSize="15" fontWeight="bold" textAnchor="middle">400</text>
              <text x="97" y="30" fill="#f43f5e" fontSize="10" fontFamily="monospace" textAnchor="middle">NULL</text>
              <text x="60" y="70" fill="#94a3b8" fontSize="11" textAnchor="middle">Tail Node</text>
            </g>

            <text x="380" y="145" fill="#34d399" fontSize="11" textAnchor="middle">Insertion / Deletion at Head: O(1) | Insertion / Deletion at Middle: Traversal O(N) + Pointer Re-link O(1)</text>
          </svg>
        </div>
      )

    case 7: // Stack & Queue
      return (
        <div className="dsa-svg-diagram-card">
          <div className="dsa-diagram-header">
            <span className="dsa-diagram-tag">LIFO vs FIFO Mechanics</span>
            <span className="dsa-diagram-title">Stack (Last-In-First-Out) & Queue (First-In-First-Out)</span>
          </div>
          <svg viewBox="0 0 760 180" className="dsa-svg-canvas">
            {/* STACK */}
            <g transform="translate(70, 20)">
              <text x="60" y="15" fill="#f8fafc" fontSize="13" fontWeight="bold" textAnchor="middle">Stack (LIFO)</text>
              <rect x="10" y="28" width="100" height="110" fill="none" stroke="#38bdf8" strokeWidth="2" rx="4" />

              <rect x="15" y="102" width="90" height="30" rx="3" fill="#1e293b" />
              <text x="60" y="122" fill="#cbd5e1" fontSize="11" textAnchor="middle">Bottom: 5</text>

              <rect x="15" y="67" width="90" height="30" rx="3" fill="#1e293b" />
              <text x="60" y="87" fill="#cbd5e1" fontSize="11" textAnchor="middle">Elem: 12</text>

              <rect x="15" y="32" width="90" height="30" rx="3" fill="#0284c7" stroke="#38bdf8" />
              <text x="60" y="52" fill="#f8fafc" fontSize="11" fontWeight="bold" textAnchor="middle">Top: 99</text>

              <text x="60" y="156" fill="#38bdf8" fontSize="11" textAnchor="middle">Push / Pop @ Top</text>
            </g>

            {/* QUEUE */}
            <g transform="translate(380, 20)">
              <text x="150" y="15" fill="#f8fafc" fontSize="13" fontWeight="bold" textAnchor="middle">Queue (FIFO)</text>
              <rect x="20" y="45" width="260" height="55" rx="5" fill="none" stroke="#34d399" strokeWidth="2" />

              <rect x="30" y="52" width="70" height="40" rx="3" fill="#065f46" stroke="#34d399" />
              <text x="65" y="77" fill="#f8fafc" fontSize="12" fontWeight="bold" textAnchor="middle">Front: 1</text>

              <rect x="115" y="52" width="70" height="40" rx="3" fill="#1e293b" />
              <text x="150" y="77" fill="#cbd5e1" fontSize="12" textAnchor="middle">Elem: 2</text>

              <rect x="200" y="52" width="70" height="40" rx="3" fill="#0284c7" />
              <text x="235" y="77" fill="#f8fafc" fontSize="12" fontWeight="bold" textAnchor="middle">Rear: 3</text>

              <text x="65" y="125" fill="#f43f5e" fontSize="11" textAnchor="middle">← Dequeue (Front)</text>
              <text x="235" y="125" fill="#34d399" fontSize="11" textAnchor="middle">Enqueue (Rear) ←</text>
            </g>
          </svg>
        </div>
      )

    case 11: // Binary Trees
    case 12: // BST
      return (
        <div className="dsa-svg-diagram-card">
          <div className="dsa-diagram-header">
            <span className="dsa-diagram-tag">BST Inorder Property</span>
            <span className="dsa-diagram-title">Binary Search Tree (Left &lt; Node &lt; Right) & Inorder Traversal</span>
          </div>
          <svg viewBox="0 0 760 190" className="dsa-svg-canvas">
            {/* Root */}
            <circle cx="380" cy="35" r="22" fill="#0284c7" stroke="#38bdf8" strokeWidth="2.5" />
            <text x="380" y="40" fill="#f8fafc" fontSize="15" fontWeight="bold" textAnchor="middle">50</text>

            <line x1="362" y1="50" x2="255" y2="85" stroke="#475569" strokeWidth="2" />
            <line x1="398" y1="50" x2="505" y2="85" stroke="#475569" strokeWidth="2" />

            <circle cx="240" cy="95" r="20" fill="#1e293b" stroke="#34d399" strokeWidth="2" />
            <text x="240" y="100" fill="#f8fafc" fontSize="14" fontWeight="bold" textAnchor="middle">30</text>

            <circle cx="520" cy="95" r="20" fill="#1e293b" stroke="#f43f5e" strokeWidth="2" />
            <text x="520" y="100" fill="#f8fafc" fontSize="14" fontWeight="bold" textAnchor="middle">70</text>

            <line x1="225" y1="110" x2="160" y2="140" stroke="#475569" strokeWidth="1.5" />
            <line x1="255" y1="110" x2="320" y2="140" stroke="#475569" strokeWidth="1.5" />

            <circle cx="150" cy="148" r="16" fill="#0f172a" stroke="#64748b" strokeWidth="1.5" />
            <text x="150" y="153" fill="#cbd5e1" fontSize="12" textAnchor="middle">20</text>

            <circle cx="330" cy="148" r="16" fill="#0f172a" stroke="#64748b" strokeWidth="1.5" />
            <text x="330" y="153" fill="#cbd5e1" fontSize="12" textAnchor="middle">40</text>

            <text x="380" y="180" fill="#34d399" fontSize="11" textAnchor="middle">Inorder Traversal (Left → Root → Right): 20 → 30 → 40 → 50 → 70 (Yields Strictly Sorted Numbers)</text>
          </svg>
        </div>
      )

    case 13: // Graphs
      return (
        <div className="dsa-svg-diagram-card">
          <div className="dsa-diagram-header">
            <span className="dsa-diagram-tag">Graph Topology</span>
            <span className="dsa-diagram-title">Adjacency List & Matrix Representation (Vertices V & Edges E)</span>
          </div>
          <svg viewBox="0 0 760 180" className="dsa-svg-canvas">
            <line x1="160" y1="40" x2="300" y2="40" stroke="#38bdf8" strokeWidth="2" />
            <line x1="160" y1="40" x2="160" y2="130" stroke="#38bdf8" strokeWidth="2" />
            <line x1="300" y1="40" x2="440" y2="130" stroke="#38bdf8" strokeWidth="2" />
            <line x1="160" y1="130" x2="440" y2="130" stroke="#38bdf8" strokeWidth="2" />
            <line x1="440" y1="130" x2="580" y2="40" stroke="#38bdf8" strokeWidth="2" />

            <circle cx="160" cy="40" r="22" fill="#0284c7" stroke="#38bdf8" strokeWidth="2" />
            <text x="160" y="45" fill="#f8fafc" fontSize="14" fontWeight="bold" textAnchor="middle">0</text>

            <circle cx="300" cy="40" r="22" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" />
            <text x="300" y="45" fill="#f8fafc" fontSize="14" fontWeight="bold" textAnchor="middle">1</text>

            <circle cx="160" cy="130" r="22" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" />
            <text x="160" y="135" fill="#f8fafc" fontSize="14" fontWeight="bold" textAnchor="middle">2</text>

            <circle cx="440" cy="130" r="22" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" />
            <text x="440" y="135" fill="#f8fafc" fontSize="14" fontWeight="bold" textAnchor="middle">3</text>

            <circle cx="580" cy="40" r="22" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" />
            <text x="580" y="45" fill="#f8fafc" fontSize="14" fontWeight="bold" textAnchor="middle">4</text>

            <text x="370" y="168" fill="#94a3b8" fontSize="11" textAnchor="middle">Adjacency List: adj[0] = {`[1, 2]`} | adj[1] = {`[0, 3]`} | adj[2] = {`[0, 3]`} | adj[3] = {`[1, 2, 4]`}</text>
          </svg>
        </div>
      )

    case 14: // Dynamic Programming
      return (
        <div className="dsa-svg-diagram-card">
          <div className="dsa-diagram-header">
            <span className="dsa-diagram-tag">DP State Table Dependency</span>
            <span className="dsa-diagram-title">0/1 Knapsack 2D Tabulation Grid State Transition</span>
          </div>
          <svg viewBox="0 0 760 190" className="dsa-svg-canvas">
            {/* DP Table Grid Headers */}
            <text x="60" y="30" fill="#94a3b8" fontSize="11" fontWeight="bold">Item \ Cap (W):</text>
            { [0, 1, 2, 3, 4, 5].map((w) => (
              <text key={w} x={180 + w * 85} y={30} fill="#38bdf8" fontSize="12" fontFamily="monospace" textAnchor="middle">W={w}</text>
            ))}

            {/* Rows */}
            { ['Item 0', 'Item 1', 'Item 2', 'Item 3'].map((item, rowIdx) => (
              <g key={rowIdx}>
                <text x="60" y={70 + rowIdx * 32} fill="#cbd5e1" fontSize="12" fontWeight="bold">{item}</text>
                { [0, 1, 2, 3, 4, 5].map((colIdx) => {
                  const isDep = rowIdx === 1 && colIdx === 2
                  const isCur = rowIdx === 2 && colIdx === 4
                  return (
                    <rect
                      key={colIdx}
                      x={140 + colIdx * 85}
                      y={52 + rowIdx * 32}
                      width="80"
                      height="26"
                      rx="4"
                      fill={isCur ? "#0284c7" : isDep ? "#065f46" : "#1e1e24"}
                      stroke={isCur ? "#38bdf8" : isDep ? "#34d399" : "#334155"}
                      strokeWidth="1.5"
                    />
                  )
                })}
              </g>
            ))}

            {/* Transition Arrow */}
            <path d="M 310 98 L 480 120" stroke="#34d399" strokeWidth="2" strokeDasharray="3" markerEnd="url(#arrow-green)" />

            <text x="380" y="180" fill="#38bdf8" fontSize="11" textAnchor="middle">State Recurrence: dp[i][w] = max( dp[i-1][w], val[i-1] + dp[i-1][w - wt[i-1]] )</text>
          </svg>
        </div>
      )

    case 15: // Tries
      return (
        <div className="dsa-svg-diagram-card">
          <div className="dsa-diagram-header">
            <span className="dsa-diagram-tag">Prefix Tree Branching</span>
            <span className="dsa-diagram-title">Trie Character Pointer Array & End-of-Word Markers</span>
          </div>
          <svg viewBox="0 0 760 180" className="dsa-svg-canvas">
            {/* Root */}
            <circle cx="380" cy="30" r="18" fill="#0284c7" stroke="#38bdf8" strokeWidth="2" />
            <text x="380" y="34" fill="#f8fafc" fontSize="11" fontWeight="bold" textAnchor="middle">Root</text>

            {/* 'c' */}
            <line x1="370" y1="46" x2="280" y2="75" stroke="#38bdf8" strokeWidth="2" />
            <circle cx="280" cy="85" r="16" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" />
            <text x="280" y="90" fill="#f8fafc" fontSize="13" fontWeight="bold" textAnchor="middle">'c'</text>

            {/* 'a' */}
            <line x1="280" y1="101" x2="280" y2="125" stroke="#38bdf8" strokeWidth="2" />
            <circle cx="280" cy="135" r="16" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" />
            <text x="280" y="140" fill="#f8fafc" fontSize="13" fontWeight="bold" textAnchor="middle">'a'</text>

            {/* 't' -> "cat" */}
            <line x1="268" y1="145" x2="200" y2="165" stroke="#34d399" strokeWidth="2" />
            <circle cx="190" cy="168" r="16" fill="#065f46" stroke="#34d399" strokeWidth="2.5" />
            <text x="190" y="172" fill="#f8fafc" fontSize="12" fontWeight="bold" textAnchor="middle">'t' ✓</text>

            {/* 'r' -> "car" */}
            <line x1="292" y1="145" x2="360" y2="165" stroke="#34d399" strokeWidth="2" />
            <circle cx="370" cy="168" r="16" fill="#065f46" stroke="#34d399" strokeWidth="2.5" />
            <text x="370" y="172" fill="#f8fafc" fontSize="12" fontWeight="bold" textAnchor="middle">'r' ✓</text>
          </svg>
        </div>
      )

    default:
      return (
        <div className="dsa-svg-diagram-card">
          <div className="dsa-diagram-header">
            <span className="dsa-diagram-tag">Data Architecture</span>
            <span className="dsa-diagram-title">Data Representation & State Transition</span>
          </div>
          <svg viewBox="0 0 760 140" className="dsa-svg-canvas">
            <rect x="80" y="45" width="160" height="50" rx="8" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" />
            <text x="160" y="75" fill="#f8fafc" fontSize="14" fontWeight="bold" textAnchor="middle">Input State</text>

            <path d="M 250 70 L 340 70" stroke="#38bdf8" strokeWidth="2.5" />

            <rect x="350" y="45" width="160" height="50" rx="8" fill="#0284c7" stroke="#38bdf8" strokeWidth="2" />
            <text x="430" y="75" fill="#f8fafc" fontSize="14" fontWeight="bold" textAnchor="middle">Optimal Transform</text>

            <path d="M 520 70 L 610 70" stroke="#34d399" strokeWidth="2.5" />

            <rect x="620" y="45" width="100" height="50" rx="8" fill="#065f46" stroke="#34d399" strokeWidth="2" />
            <text x="670" y="75" fill="#f8fafc" fontSize="14" fontWeight="bold" textAnchor="middle">Result</text>
          </svg>
        </div>
      )
  }
}
