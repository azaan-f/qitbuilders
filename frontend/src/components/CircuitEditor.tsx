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
  pairId?: string;
  role?: 'control' | 'target';
  onDelete?: (id: string) => void;
};

type GateNode = Node<GateNodeData>;

type PairEdgeData = { pairId: string };

function isGateNode(n: Node): n is GateNode {
  return n.type === 'gate' && typeof (n.data as GateNodeData | undefined)?.gateType === 'string';
}

const GateNodeComponent = memo(({ id, data }: NodeProps<GateNodeData>) => {
  const [hover, setHover] = useState(false);

  const isControl = data?.role === 'control';
  const isTarget = data?.role === 'target';

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
        background: isControl ? '#111827' : 'white',
        color: isControl ? 'white' : 'black',
        fontWeight: 700,
        cursor: 'grab',
        userSelect: 'none',
        boxSizing: 'border-box',
        position: 'relative',
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      title={
        data?.pairId
          ? `${data?.gateType.toUpperCase()} (${isControl ? 'control' : isTarget ? 'target' : 'gate'})`
          : data?.gateType.toUpperCase()
      }
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
      const n = nodes.find((x) => x.id === id);
      const pairId = (n?.data as GateNodeData | undefined)?.pairId;

      setNodes((nds) => {
        if (!pairId) return nds.filter((x) => x.id !== id);
        return nds.filter((x) => (x.data as GateNodeData | undefined)?.pairId !== pairId);
      });

      setEdges((eds) => {
        const withoutGateEdges = eds.filter((e) => e.source !== id && e.target !== id);
        if (!pairId) return withoutGateEdges;

        return withoutGateEdges.filter((e) => {
          const data = e.data as PairEdgeData | undefined;
          return data?.pairId !== pairId;
        });
      });
    },
    [nodes, setNodes, setEdges]
  );

  const onNodeDragStop = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      if (node.type === 'qubit') return;

      const width = node.width ?? 40;
      const snappedWireX = snapToWireCenter(node.position.x);

      const snapped = {
        x: snappedWireX - width / 2,
        y: snapToGrid(node.position.y),
      };

      setNodes((nds) => {
        const thisNode = nds.find((n) => n.id === node.id);
        const pairId = (thisNode?.data as GateNodeData | undefined)?.pairId;
        if (!pairId) {
          return nds.map((n) => (n.id === node.id ? { ...n, position: snapped } : n));
        }
        const targetY = snapped.y;

        return nds.map((n) => {
          const data = n.data as GateNodeData | undefined;
          if (data?.pairId !== pairId) return n;

          if (data.role === 'control') {
            const x = QUBIT_WIRES[0].x - width / 2;
            return { ...n, position: { x, y: targetY } };
          }

          if (data.role === 'target') {
            const x = QUBIT_WIRES[1].x - width / 2;
            return { ...n, position: { x, y: targetY } };
          }

          return { ...n, position: { x: snapped.x, y: targetY } };
        });
      });
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
      if (!item) return;

      const flowPos = screenToFlowPosition({ x: e.clientX, y: e.clientY });
      const y = snapToGrid(flowPos.y);

      if (item.kind === 'single') {
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
            onDelete: deleteGate,
          },
        };

        setNodes((nds) => nds.concat(newNode));
        return;
      }

      if (item.kind === 'pair') {
        const pairId = `pair-${Date.now()}-${Math.random().toString(16).slice(2)}`;

        const width = 40;
        const controlX = QUBIT_WIRES[0].x - width / 2;
        const targetX = QUBIT_WIRES[1].x - width / 2;

        const controlId = makeId();
        const targetId = makeId();

        const [g0, g1] = item.gates;

        const controlNode: GateNode = {
          id: controlId,
          type: 'gate',
          position: { x: controlX, y },
          data: {
            label: g0.label,
            gateType: g0.gateType,
            params: g0.params,
            pairId,
            role: 'control',
            onDelete: deleteGate,
          },
        };

        const targetNode: GateNode = {
          id: targetId,
          type: 'gate',
          position: { x: targetX, y },
          data: {
            label: g1.label,
            gateType: g1.gateType,
            params: g1.params,
            pairId,
            role: 'target',
            onDelete: deleteGate,
          },
        };

        const connector: Edge<PairEdgeData> = {
          id: `e-${pairId}`,
          source: controlId,
          target: targetId,
          animated: false,
          deletable: false,
          focusable: false,
          updatable: false,
          style: { strokeWidth: 2, stroke: '#111827', pointerEvents: 'none' },
          data: { pairId },
        };

        setNodes((nds) => nds.concat(controlNode, targetNode));
        setEdges((eds) => eds.concat(connector));
        return;
      }
    },
    [makeId, screenToFlowPosition, setNodes, setEdges, deleteGate]
  );

  useEffect(() => {
    const gateNodes = nodes.filter(isGateNode);

    const pairMap = new Map<string, GateNode[]>();
    for (const n of gateNodes) {
      const pid = n.data.pairId;
      if (!pid) continue;
      const arr = pairMap.get(pid) ?? [];
      arr.push(n);
      pairMap.set(pid, arr);
    }

    const paired: Gate[] = [];
    for (const [, pairNodes] of pairMap) {
      const control = pairNodes.find((n) => n.data.role === 'control');
      const target = pairNodes.find((n) => n.data.role === 'target');
      if (!control || !target) continue;

      const controlWireX = snapToWireCenter(control.position.x);
      const targetWireX = snapToWireCenter(target.position.x);

      const controlQubit = QUBIT_WIRES.findIndex((w) => w.x === controlWireX);
      const targetQubit = QUBIT_WIRES.findIndex((w) => w.x === targetWireX);

      const time = snapToGrid(control.position.y);
      const twoQubitType = target.data.label === 'Z' ? 'cz' : 'cx';

      paired.push({
        id: `pair-${control.id}`,
        type: twoQubitType,
        qubit: controlQubit,
        time,
        params: { target: targetQubit },
      });
    }

    const singles: Gate[] = gateNodes
      .filter((n) => !n.data.pairId)
      .map((n) => {
        const wireX = snapToWireCenter(n.position.x);
        const qubit = QUBIT_WIRES.findIndex((w) => w.x === wireX);
        const time = snapToGrid(n.position.y);

        return {
          id: n.id,
          type: n.data.gateType,
          qubit,
          time,
          params: n.data.params,
        };
      });

    const all = [...singles, ...paired].sort((a, b) => a.time - b.time || a.qubit - b.qubit);
    setGates(all);
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
          onInit={(rf) => {
            rf.fitView({ padding: 2 });
            const v = rf.getViewport();
            rf.setViewport({ ...v, y: v.y - 350 }, { duration: 0 });
          }}
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
