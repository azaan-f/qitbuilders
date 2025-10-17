import React from "react";
import ReactFlow, { MiniMap, Controls } from "reactflow";

const CircuitEditor = () => {
    const nodes: any[] = [];
    const edges: any[] = [];

    return (
        <div className="h-[400px] border rounded-md">
            <ReactFlow nodes={nodes} edges={edges}>
                <MiniMap />
                <Controls />
            </ReactFlow>
        </div>
    );
};
export default CircuitEditor;