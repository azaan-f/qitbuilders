import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
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
  NodeProps,
  ReactFlowProvider,
  useReactFlow,
} from 'reactflow';

import 'reactflow/dist/style.css';

import GatePalette, { PaletteItem } from './GatePalette';

const GRID_SIZE = 25;
const snapToGrid = (v: number) => Math.round(v / GRID_SIZE) * GRID_SIZE;

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

type GateParams = Record<string, unknown>;

type GateNodeData = {
  label: string;
  gateType: string;
  params?: GateParams;
  onDelete?: (id: string) => void;
};

type GateNode = Node<GateNodeData>;

function isGateNode(n: Node): n is GateNode {
  return n.type === 'gate' && typeof (n.data as GateNodeData | undefined)?.gateType === 'string';
}

const GateNodeComponent = memo(({ id, data }: NodeProps<GateNodeData>) => {
  const [hover, setHover] = useState(false);

  return (
    <div
      style={{
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
        position: 'relative',
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {data?.label ?? 'G'}

      {hover && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            data?.onDelete?.(id);
          }}
          onMouseDown={(e) => e.stopPropagation()}
          style={{
            position: 'absolute',
            top: -8,
            right: -8,
            width: 18,
            height: 18,
            borderRadius: 9,
            border: '1px solid rgba(0,0,0,0.3)',
            background: 'white',
            fontSize: 12,
            lineHeight: '16px',
            padding: 0,
            cursor: 'pointer',
          }}
          aria-label="Delete gate"
          title="Delete"
        >
          ×
        </button>
      )}
    </div>
  );
});

const nodeTypes = { qubit: QubitWire, gate: GateNodeComponent };

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
];

const initialEdges: Edge[] = [];

type Gate = {
  id: string;
  type: string;
  qubit: number;
  time: number;
  params?: GateParams;
};

function CircuitEditorInner({ setGates }: { setGates: (g: Gate[]) => void }) {
  const reactFlowWrapper = useRef<HTMLDivElement | null>(null);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const { screenToFlowPosition } = useReactFlow();

  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((eds) => addEdge({ ...params, animated: true }, eds)),
    [setEdges]
  );

  const deleteGate = useCallback(
    (id: string) => {
      setNodes((nds) => nds.filter((n) => n.id !== id));
      setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
    },
    [setNodes, setEdges]
  );

  useEffect(() => {
    setNodes((nds) =>
      nds.map((n) => {
        if (n.type !== 'gate') return n;
        const d = n.data as GateNodeData;
        return { ...n, data: { ...d, onDelete: deleteGate } };
      })
    );
  }, [deleteGate, setNodes]);

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

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const makeId = useCallback(() => `g-${Date.now()}-${Math.random().toString(16).slice(2)}`, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();

      const raw = e.dataTransfer.getData('application/qitbuilder-gate');
      if (!raw) return;

      let item: PaletteItem | null = null;
      try {
        item = JSON.parse(raw) as PaletteItem;
      } catch {
        return;
      }
      if (!item || item.kind !== 'single') return;

      const flowPos = screenToFlowPosition({ x: e.clientX, y: e.clientY });

      const y = snapToGrid(flowPos.y);
      const wireCenterX = snapToWireCenter(flowPos.x);
      const x = wireCenterX - 20;

      const id = makeId();
      const newNode: GateNode = {
        id,
        type: 'gate',
        position: { x, y },
        data: {
          label: item.label,
          gateType: item.gateType,
          params: item.params,
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [makeId, screenToFlowPosition, setNodes]
  );

  useEffect(() => {
    const gates: Gate[] = nodes
      .filter(isGateNode)
      .map((gateNode) => {
        const wireX = snapToWireCenter(gateNode.position.x);
        const qubit = QUBIT_WIRES.findIndex((w) => w.x === wireX);
        const time = snapToGrid(gateNode.position.y);

        return {
          id: gateNode.id,
          type: gateNode.data.gateType,
          qubit,
          time,
          params: gateNode.data.params,
        };
      })
      .sort((a, b) => a.time - b.time);

    setGates(gates);
  }, [nodes, setGates]);

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex' }}>
      <GatePalette />

      <div ref={reactFlowWrapper} style={{ flex: 1, height: '100%', minWidth: 0 }}>
        <ReactFlow
          nodeTypes={nodeTypes}
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeDragStop={onNodeDragStop}
          onConnect={onConnect}
          onDragOver={onDragOver}
          onDrop={onDrop}
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
    </div>
  );
}

const CircuitEditor = ({ setGates }: { setGates: (g: Gate[]) => void }) => {
  return (
    <ReactFlowProvider>
      <CircuitEditorInner setGates={setGates} />
    </ReactFlowProvider>
  );
};

export default CircuitEditor;
