import React, { useCallback } from 'react';
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  MiniMap,
  useEdgesState,
  useNodesState,
  Connection,
  Edge,
  Node,
} from 'reactflow';

import 'reactflow/dist/style.css';

const GRID_SIZE = 25;
const snapToGrid = (v: number) => Math.round(v / GRID_SIZE) * GRID_SIZE;

const QubitWire = ({ data }) => {
  return (
    <div style={{ width: 1, pointerEvents: 'none' }}>
      <div
        style={{
          fontSize: 18,
          fontWeight: 600,
          marginBottom: 6,
          userSelect: 'none',
          textAlign: 'center',
          transform: 'translateX(-50%)',
        }}
      >
        {data.label}
      </div>

      <div
        style={{
          position: 'absolute',
          top: 30,
          left: 0,
          width: '2px',
          height: '800px',
          background: 'rgba(0,0,0,0.25)',
        }}
      />
    </div>
  );
};

const nodeTypes = { qubit: QubitWire };

const QUBIT_WIRES = [
  { id: 'q0', x: snapToGrid(100) },
  { id: 'q1', x: snapToGrid(250) },
];

const snapToWireCenter = (x: number) => {
  const gridX = snapToGrid(x);

  let best = QUBIT_WIRES[0].x;
  let minDist = Math.abs(gridX - best);

  for (const q of QUBIT_WIRES) {
    const dist = Math.abs(gridX - q.x);
    if (dist < minDist) {
      best = q.x;
      minDist = dist;
    }
  }

  return best;
};

const initialNodes: Node[] = [
  {
    id: 'q0',
    type: 'qubit',
    position: { x: QUBIT_WIRES[0].x, y: 20 },
    data: { label: 'q0' },
    selectable: false,
    draggable: false,
  },
  {
    id: 'q1',
    type: 'qubit',
    position: { x: QUBIT_WIRES[1].x, y: 20 },
    data: { label: 'q1' },
    selectable: false,
    draggable: false,
  },

  {
    id: 'xgate',
    position: { x: QUBIT_WIRES[0].x - 20, y: 200 },
    data: { label: 'X' },
    style: {
      width: 40,
      height: 40,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: '2px solid black',
      borderRadius: 6,
      background: 'white',
      fontWeight: 600,
      cursor: 'grab',
      userSelect: 'none',
      boxSizing: 'border-box',
    },
  },
];

const initialEdges: Edge[] = [];

const CircuitEditor = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((eds) => addEdge({ ...params, animated: true }, eds)),
    [setEdges]
  );

  const onNodeDragStop = useCallback(
    (_event, node) => {
      if (node.type === 'qubit') return;

      const width = node.width ?? 40;
      const wireCenterX = snapToWireCenter(node.position.x);

      const snappedPos = {
        x: wireCenterX - width / 2,
        y: snapToGrid(node.position.y),
      };

      setNodes((nds) => nds.map((n) => (n.id === node.id ? { ...n, position: snappedPos } : n)));
    },
    [setNodes]
  );

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ReactFlow
        nodeTypes={nodeTypes}
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeDragStop={onNodeDragStop}
        onConnect={onConnect}
        snapToGrid
        snapGrid={[GRID_SIZE, GRID_SIZE]}
        fitView
        fitViewOptions={{ padding: 0.2 }}
      >
        <MiniMap />
        <Controls />
        <Background gap={GRID_SIZE} />
      </ReactFlow>
    </div>
  );
};

const testMode = false;

if (testMode) {
  const g = snapToGrid(37);
  if (g !== 25 && g !== 50) throw new Error('snapToGrid failed');

  const w = snapToWireCenter(112);
  if (typeof w !== 'number') throw new Error('snapToWireCenter failed');

  if (!Array.isArray(initialNodes) || initialNodes.length < 2) {
    throw new Error('initialNodes missing');
  }

  const node = {
    id: 'xgate',
    type: 'gate',
    width: 40,
    position: { x: 113, y: 199 },
  };

  const width = node.width ?? 40;
  const wireCenterX = snapToWireCenter(node.position.x);
  const snapped = {
    x: wireCenterX - width / 2,
    y: snapToGrid(node.position.y),
  };

  if (typeof snapped.x !== 'number' || typeof snapped.y !== 'number') {
    throw new Error('snapping failed');
  }
}
export default CircuitEditor;
