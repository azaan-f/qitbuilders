import React, { useCallback, useEffect } from 'react';
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

const QubitWire = ({ data }: { data: { label: string } }) => (
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

const nodeTypes = { qubit: QubitWire };

const QUBIT_WIRES = [
  { id: 'q0', x: snapToGrid(100) },
  { id: 'q1', x: snapToGrid(250) },
];

const snapToWireCenter = (x: number) => {
  const gridX = snapToGrid(x);

  let bestX = QUBIT_WIRES[0].x;
  let minDist = Math.abs(gridX - bestX);

  for (const wire of QUBIT_WIRES) {
    const dist = Math.abs(gridX - wire.x);
    if (dist < minDist) {
      bestX = wire.x;
      minDist = dist;
    }
  }

  return bestX;
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
    type: 'gate',
    position: { x: QUBIT_WIRES[0].x - 20, y: 200 },
    data: { label: 'X', gateType: 'x' },
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

type Gate = {
  id: string;
  type: string;
  qubit: number;
  time: number;
};

const CircuitEditor = ({ setGates }: { setGates: (g: Gate[]) => void }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((eds) => addEdge({ ...params, animated: true }, eds)),
    [setEdges]
  );

  const onNodeDragStop = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      if (node.type === 'qubit') return;

      const width = node.width ?? 40;
      const wireX = snapToWireCenter(node.position.x);

      const snapped = {
        x: wireX - width / 2,
        y: snapToGrid(node.position.y),
      };

      setNodes((nds) => nds.map((n) => (n.id === node.id ? { ...n, position: snapped } : n)));
    },
    [setNodes]
  );

  useEffect(() => {
    const gates = nodes
      .filter((n) => n.data?.gateType)
      .map((gateNode) => {
        const wireX = snapToWireCenter(gateNode.position.x);
        const qubit = QUBIT_WIRES.findIndex((w) => w.x === wireX);
        const time = snapToGrid(gateNode.position.y);

        return {
          id: gateNode.id,
          type: gateNode.data.gateType,
          qubit,
          time,
        };
      })
      .sort((a, b) => a.time - b.time);

    setGates(gates);
  }, [nodes, setGates]);

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
        fitViewOptions={{ padding: 2 }}
      >
        <MiniMap />
        <Controls />
        <Background gap={GRID_SIZE} />
      </ReactFlow>
    </div>
  );
};

export default CircuitEditor;
