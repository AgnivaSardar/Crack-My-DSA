import React from 'react'

// SVG Visual Diagram Renderer tailored for each DSA Topic
export function DSADiagram({ topicId }) {
  switch (topicId) {
    case 1: // Arrays & Operations
      return (
        <div className="dsa-svg-diagram-card">
          <div className="dsa-diagram-header">
            <span className="dsa-diagram-tag">Visual Memory & Structure</span>
            <span className="dsa-diagram-title">Contiguous Memory Allocation & Operations</span>
          </div>
          <svg viewBox="0 0 760 180" className="dsa-svg-canvas">
            {/* Memory Addresses */}
            <text x="30" y="25" fill="#94a3b8" fontSize="11" fontFamily="monospace">Memory Addr:</text>
            <text x="140" y="25" fill="#64748b" fontSize="11" fontFamily="monospace">0x100</text>
            <text x="240" y="25" fill="#64748b" fontSize="11" fontFamily="monospace">0x104</text>
            <text x="340" y="25" fill="#64748b" fontSize="11" fontFamily="monospace">0x108</text>
            <text x="440" y="25" fill="#64748b" fontSize="11" fontFamily="monospace">0x10C</text>
            <text x="540" y="25" fill="#64748b" fontSize="11" fontFamily="monospace">0x110</text>

            {/* Array Cells */}
            <rect x="120" y="35" width="90" height="50" rx="6" fill="#1e1e24" stroke="#38bdf8" strokeWidth="2" />
            <text x="165" y="65" fill="#f8fafc" fontSize="16" fontWeight="bold" textAnchor="middle">12</text>
            <text x="165" y="102" fill="#38bdf8" fontSize="12" fontFamily="monospace" textAnchor="middle">Index 0</text>

            <rect x="220" y="35" width="90" height="50" rx="6" fill="#1e1e24" stroke="#38bdf8" strokeWidth="2" />
            <text x="265" y="65" fill="#f8fafc" fontSize="16" fontWeight="bold" textAnchor="middle">45</text>
            <text x="265" y="102" fill="#38bdf8" fontSize="12" fontFamily="monospace" textAnchor="middle">Index 1</text>

            <rect x="320" y="35" width="90" height="50" rx="6" fill="#1e1e24" stroke="#38bdf8" strokeWidth="2" />
            <text x="365" y="65" fill="#f8fafc" fontSize="16" fontWeight="bold" textAnchor="middle">67</text>
            <text x="365" y="102" fill="#38bdf8" fontSize="12" fontFamily="monospace" textAnchor="middle">Index 2</text>

            <rect x="420" y="35" width="90" height="50" rx="6" fill="#1e1e24" stroke="#38bdf8" strokeWidth="2" />
            <text x="465" y="65" fill="#f8fafc" fontSize="16" fontWeight="bold" textAnchor="middle">89</text>
            <text x="465" y="102" fill="#38bdf8" fontSize="12" fontFamily="monospace" textAnchor="middle">Index 3</text>

            <rect x="520" y="35" width="90" height="50" rx="6" fill="#1e1e24" stroke="#38bdf8" strokeWidth="2" />
            <text x="565" y="65" fill="#f8fafc" fontSize="16" fontWeight="bold" textAnchor="middle">99</text>
            <text x="565" y="102" fill="#38bdf8" fontSize="12" fontFamily="monospace" textAnchor="middle">Index 4</text>

            {/* Pointer & Operations Annotations */}
            <path d="M 165 140 L 165 115" stroke="#34d399" strokeWidth="2" markerEnd="url(#arrow-green)" />
            <text x="165" y="155" fill="#34d399" fontSize="11" fontWeight="bold" textAnchor="middle">Access: arr[0] → O(1)</text>

            <path d="M 365 140 L 365 115" stroke="#f43f5e" strokeWidth="2" markerEnd="url(#arrow-red)" />
            <text x="365" y="155" fill="#f43f5e" fontSize="11" fontWeight="bold" textAnchor="middle">Insert/Delete: Shift Elements → O(N)</text>
          </svg>
        </div>
      )

    case 2: // Binary Search
      return (
        <div className="dsa-svg-diagram-card">
          <div className="dsa-diagram-header">
            <span className="dsa-diagram-tag">Visual Search Space</span>
            <span className="dsa-diagram-title">Binary Search Boundary Elimination (O(log N))</span>
          </div>
          <svg viewBox="0 0 760 170" className="dsa-svg-canvas">
            {/* Sorted Array Row */}
            { [2, 5, 8, 12, 16, 23, 38, 56, 72].map((num, i) => (
              <g key={i}>
                <rect
                  x={40 + i * 75}
                  y={40}
                  width="65"
                  height="45"
                  rx="5"
                  fill={i === 4 ? "#0284c7" : i < 4 ? "#1e293b" : "#0f172a"}
                  stroke={i === 4 ? "#38bdf8" : "#334155"}
                  strokeWidth="2"
                />
                <text x={72.5 + i * 75} y={67} fill="#f8fafc" fontSize="15" fontWeight="bold" textAnchor="middle">{num}</text>
                <text x={72.5 + i * 75} y={100} fill="#94a3b8" fontSize="11" fontFamily="monospace" textAnchor="middle">[{i}]</text>
              </g>
            ))}

            {/* Pointers: Low, Mid, High */}
            <text x="72.5" y="125" fill="#34d399" fontSize="12" fontWeight="bold" textAnchor="middle">Low (0)</text>
            <text x="372.5" y="125" fill="#38bdf8" fontSize="12" fontWeight="bold" textAnchor="middle">Mid (4)</text>
            <text x="672.5" y="125" fill="#f43f5e" fontSize="12" fontWeight="bold" textAnchor="middle">High (8)</text>

            <text x="372.5" y="150" fill="#cbd5e1" fontSize="11" textAnchor="middle">Target = 23 | arr[mid] = 16 | Since 23 &gt; 16 → Shift Low to Mid + 1</text>
          </svg>
        </div>
      )

    case 4: // Linked List Node Chain
      return (
        <div className="dsa-svg-diagram-card">
          <div className="dsa-diagram-header">
            <span className="dsa-diagram-tag">Pointer Architecture</span>
            <span className="dsa-diagram-title">Linked List Node Memory & Pointer Chain</span>
          </div>
          <svg viewBox="0 0 760 160" className="dsa-svg-canvas">
            {/* Node 1 */}
            <g transform="translate(40, 30)">
              <rect x="0" y="0" width="110" height="50" rx="6" fill="#1e1e24" stroke="#38bdf8" strokeWidth="2" />
              <line x1="70" y1="0" x2="70" y2="50" stroke="#38bdf8" strokeWidth="1.5" />
              <text x="35" y="30" fill="#f8fafc" fontSize="14" fontWeight="bold" textAnchor="middle">10</text>
              <text x="90" y="30" fill="#38bdf8" fontSize="11" fontFamily="monospace" textAnchor="middle">•next</text>
              <text x="55" y="70" fill="#94a3b8" fontSize="11" textAnchor="middle">Head Node</text>
            </g>

            <path d="M 150 55 L 210 55" stroke="#38bdf8" strokeWidth="2.5" markerEnd="url(#arrow-blue)" />

            {/* Node 2 */}
            <g transform="translate(220, 30)">
              <rect x="0" y="0" width="110" height="50" rx="6" fill="#1e1e24" stroke="#38bdf8" strokeWidth="2" />
              <line x1="70" y1="0" x2="70" y2="50" stroke="#38bdf8" strokeWidth="1.5" />
              <text x="35" y="30" fill="#f8fafc" fontSize="14" fontWeight="bold" textAnchor="middle">25</text>
              <text x="90" y="30" fill="#38bdf8" fontSize="11" fontFamily="monospace" textAnchor="middle">•next</text>
              <text x="55" y="70" fill="#94a3b8" fontSize="11" textAnchor="middle">Node 2</text>
            </g>

            <path d="M 330 55 L 390 55" stroke="#38bdf8" strokeWidth="2.5" markerEnd="url(#arrow-blue)" />

            {/* Node 3 */}
            <g transform="translate(400, 30)">
              <rect x="0" y="0" width="110" height="50" rx="6" fill="#1e1e24" stroke="#38bdf8" strokeWidth="2" />
              <line x1="70" y1="0" x2="70" y2="50" stroke="#38bdf8" strokeWidth="1.5" />
              <text x="35" y="30" fill="#f8fafc" fontSize="14" fontWeight="bold" textAnchor="middle">40</text>
              <text x="90" y="30" fill="#f43f5e" fontSize="11" fontFamily="monospace" textAnchor="middle">NULL</text>
              <text x="55" y="70" fill="#94a3b8" fontSize="11" textAnchor="middle">Tail Node</text>
            </g>

            {/* Deletion / Insertion annotation */}
            <text x="380" y="130" fill="#34d399" fontSize="11" textAnchor="middle">Insertion at Head: O(1) | Insertion/Deletion at Middle: O(N) Traversal + O(1) Pointer Re-link</text>
          </svg>
        </div>
      )

    case 7: // Stack & Queues
      return (
        <div className="dsa-svg-diagram-card">
          <div className="dsa-diagram-header">
            <span className="dsa-diagram-tag">LIFO vs FIFO Structures</span>
            <span className="dsa-diagram-title">Stack (LIFO) & Queue (FIFO) Mechanics</span>
          </div>
          <svg viewBox="0 0 760 170" className="dsa-svg-canvas">
            {/* STACK (LIFO) */}
            <g transform="translate(60, 20)">
              <text x="60" y="15" fill="#f8fafc" fontSize="13" fontWeight="bold" textAnchor="middle">Stack (LIFO)</text>
              <rect x="10" y="30" width="100" height="100" fill="none" stroke="#38bdf8" strokeWidth="2" rx="4" />

              <rect x="15" y="95" width="90" height="30" rx="3" fill="#1e293b" stroke="#334155" />
              <text x="60" y="115" fill="#f8fafc" fontSize="12" textAnchor="middle">Item 1</text>

              <rect x="15" y="60" width="90" height="30" rx="3" fill="#0284c7" stroke="#38bdf8" />
              <text x="60" y="80" fill="#f8fafc" fontSize="12" fontWeight="bold" textAnchor="middle">Item 2 (TOP)</text>

              <text x="60" y="148" fill="#38bdf8" fontSize="11" textAnchor="middle">Push / Pop at TOP</text>
            </g>

            {/* QUEUE (FIFO) */}
            <g transform="translate(380, 20)">
              <text x="160" y="15" fill="#f8fafc" fontSize="13" fontWeight="bold" textAnchor="middle">Queue (FIFO)</text>

              <rect x="20" y="45" width="280" height="50" rx="4" fill="none" stroke="#34d399" strokeWidth="2" />

              <rect x="30" y="52" width="70" height="36" rx="3" fill="#1e293b" />
              <text x="65" y="75" fill="#f8fafc" fontSize="12" textAnchor="middle">Item 1</text>

              <rect x="110" y="52" width="70" height="36" rx="3" fill="#1e293b" />
              <text x="145" y="75" fill="#f8fafc" fontSize="12" textAnchor="middle">Item 2</text>

              <rect x="190" y="52" width="70" height="36" rx="3" fill="#059669" />
              <text x="225" y="75" fill="#f8fafc" fontSize="12" fontWeight="bold" textAnchor="middle">Item 3</text>

              <text x="65" y="120" fill="#f43f5e" fontSize="11" textAnchor="middle">← Dequeue (Front)</text>
              <text x="225" y="120" fill="#34d399" fontSize="11" textAnchor="middle">Enqueue (Rear) ←</text>
            </g>
          </svg>
        </div>
      )

    case 11: // Binary Trees
    case 12: // Binary Search Trees
      return (
        <div className="dsa-svg-diagram-card">
          <div className="dsa-diagram-header">
            <span className="dsa-diagram-tag">Hierarchical Nodes</span>
            <span className="dsa-diagram-title">Binary Tree & BST Property (Left &lt; Node &lt; Right)</span>
          </div>
          <svg viewBox="0 0 760 180" className="dsa-svg-canvas">
            {/* Root */}
            <circle cx="380" cy="35" r="22" fill="#0284c7" stroke="#38bdf8" strokeWidth="2.5" />
            <text x="380" y="40" fill="#f8fafc" fontSize="14" fontWeight="bold" textAnchor="middle">50</text>

            {/* Level 1 Lines */}
            <line x1="365" y1="52" x2="250" y2="85" stroke="#475569" strokeWidth="2" />
            <line x1="395" y1="52" x2="510" y2="85" stroke="#475569" strokeWidth="2" />

            {/* Left Child */}
            <circle cx="240" cy="95" r="20" fill="#1e293b" stroke="#34d399" strokeWidth="2" />
            <text x="240" y="100" fill="#f8fafc" fontSize="13" fontWeight="bold" textAnchor="middle">30</text>

            {/* Right Child */}
            <circle cx="520" cy="95" r="20" fill="#1e293b" stroke="#f43f5e" strokeWidth="2" />
            <text x="520" y="100" fill="#f8fafc" fontSize="13" fontWeight="bold" textAnchor="middle">70</text>

            {/* Level 2 Lines */}
            <line x1="228" y1="112" x2="160" y2="140" stroke="#475569" strokeWidth="1.5" />
            <line x1="252" y1="112" x2="310" y2="140" stroke="#475569" strokeWidth="1.5" />

            <circle cx="150" cy="148" r="16" fill="#0f172a" stroke="#64748b" strokeWidth="1.5" />
            <text x="150" y="153" fill="#cbd5e1" fontSize="11" textAnchor="middle">20</text>

            <circle cx="320" cy="148" r="16" fill="#0f172a" stroke="#64748b" strokeWidth="1.5" />
            <text x="320" y="153" fill="#cbd5e1" fontSize="11" textAnchor="middle">40</text>

            <text x="380" y="170" fill="#94a3b8" fontSize="11" textAnchor="middle">Inorder Traversal (Left-Root-Right): 20 → 30 → 40 → 50 → 70 (Sorted Order)</text>
          </svg>
        </div>
      )

    case 13: // Graphs
      return (
        <div className="dsa-svg-diagram-card">
          <div className="dsa-diagram-header">
            <span className="dsa-diagram-tag">Vertices & Edges</span>
            <span className="dsa-diagram-title">Graph Adjacency & Traversal (BFS / DFS)</span>
          </div>
          <svg viewBox="0 0 760 170" className="dsa-svg-canvas">
            {/* Edges */}
            <line x1="160" y1="40" x2="300" y2="40" stroke="#38bdf8" strokeWidth="2" />
            <line x1="160" y1="40" x2="160" y2="130" stroke="#38bdf8" strokeWidth="2" />
            <line x1="300" y1="40" x2="440" y2="130" stroke="#38bdf8" strokeWidth="2" />
            <line x1="160" y1="130" x2="440" y2="130" stroke="#38bdf8" strokeWidth="2" />
            <line x1="440" y1="130" x2="580" y2="40" stroke="#38bdf8" strokeWidth="2" />

            {/* Vertices */}
            <circle cx="160" cy="40" r="22" fill="#0284c7" stroke="#38bdf8" strokeWidth="2" />
            <text x="160" y="45" fill="#f8fafc" fontSize="14" fontWeight="bold" textAnchor="middle">A</text>

            <circle cx="300" cy="40" r="22" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" />
            <text x="300" y="45" fill="#f8fafc" fontSize="14" fontWeight="bold" textAnchor="middle">B</text>

            <circle cx="160" cy="130" r="22" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" />
            <text x="160" y="135" fill="#f8fafc" fontSize="14" fontWeight="bold" textAnchor="middle">C</text>

            <circle cx="440" cy="130" r="22" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" />
            <text x="440" y="135" fill="#f8fafc" fontSize="14" fontWeight="bold" textAnchor="middle">D</text>

            <circle cx="580" cy="40" r="22" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" />
            <text x="580" y="45" fill="#f8fafc" fontSize="14" fontWeight="bold" textAnchor="middle">E</text>

            <text x="370" y="165" fill="#94a3b8" fontSize="11" textAnchor="middle">Adjacency List: A: [B, C] | B: [A, D] | C: [A, D] | D: [B, C, E] | E: [D]</text>
          </svg>
        </div>
      )

    default: // Generic Memory & Data Structure Visual
      return (
        <div className="dsa-svg-diagram-card">
          <div className="dsa-diagram-header">
            <span className="dsa-diagram-tag">Data Architecture</span>
            <span className="dsa-diagram-title">Data Representation & State Transition</span>
          </div>
          <svg viewBox="0 0 760 140" className="dsa-svg-canvas">
            <rect x="80" y="40" width="160" height="50" rx="8" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" />
            <text x="160" y="70" fill="#f8fafc" fontSize="14" fontWeight="bold" textAnchor="middle">Input State</text>

            <path d="M 250 65 L 340 65" stroke="#38bdf8" strokeWidth="2.5" markerEnd="url(#arrow-blue)" />

            <rect x="350" y="40" width="160" height="50" rx="8" fill="#0284c7" stroke="#38bdf8" strokeWidth="2" />
            <text x="430" y="70" fill="#f8fafc" fontSize="14" fontWeight="bold" textAnchor="middle">Optimal Transform</text>

            <path d="M 520 65 L 610 65" stroke="#34d399" strokeWidth="2.5" markerEnd="url(#arrow-green)" />

            <rect x="620" y="40" width="100" height="50" rx="8" fill="#065f46" stroke="#34d399" strokeWidth="2" />
            <text x="670" y="70" fill="#f8fafc" fontSize="14" fontWeight="bold" textAnchor="middle">Result</text>
          </svg>
        </div>
      )
  }
}
