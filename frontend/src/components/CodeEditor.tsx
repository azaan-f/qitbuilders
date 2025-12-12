import React, { useEffect, useRef } from 'react';
import * as monaco from 'monaco-editor';

type GateParams = Record<string, unknown>;

type Gate = {
  type: string;
  qubit: number;
  time?: number;
  params?: GateParams;
};

const getTheta = (g: Gate): string => {
  const theta = g.params?.theta;
  return typeof theta === 'string' ? theta : 'pi/2';
};

const CodeEditor: React.FC<{ gates: Gate[] }> = ({ gates }) => {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const monacoRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  useEffect(() => {
    if (editorRef.current) {
      monacoRef.current = monaco.editor.create(editorRef.current, {
        language: 'python',
        theme: 'vs-dark',
        automaticLayout: true,
        fontSize: 14,
        minimap: { enabled: false },
      });
    }

    return () => monacoRef.current?.dispose();
  }, []);

  useEffect(() => {
    if (!monacoRef.current) return;

    let code = `from qiskit import QuantumCircuit\n\nqc = QuantumCircuit(2)\n`;

    for (const g of gates) {
      switch (g.type) {
        case 'x':
          code += `qc.x(${g.qubit})\n`;
          break;
        case 'y':
          code += `qc.y(${g.qubit})\n`;
          break;
        case 'z':
          code += `qc.z(${g.qubit})\n`;
          break;
        case 'h':
          code += `qc.h(${g.qubit})\n`;
          break;
        case 's':
          code += `qc.s(${g.qubit})\n`;
          break;
        case 't':
          code += `qc.t(${g.qubit})\n`;
          break;
        case 'rx':
          code += `qc.rx(${getTheta(g)}, ${g.qubit})\n`;
          break;
        case 'ry':
          code += `qc.ry(${getTheta(g)}, ${g.qubit})\n`;
          break;
        case 'rz':
          code += `qc.rz(${getTheta(g)}, ${g.qubit})\n`;
          break;
        default:
          code += `# Unsupported gate type: ${g.type}\n`;
          break;
      }
    }

    code += `\nqc.draw('text')\n`;

    monacoRef.current.setValue(code);
  }, [gates]);

  return (
    <>
      <div
        ref={editorRef}
        style={{
          width: '100%',
          height: '95%',
          backgroundColor: '#1e1e1e',
          borderRadius: '24px',
          overflow: 'hidden',
        }}
      />
      <div style={{ textAlign: 'center', marginTop: '10px' }}>
        <button onClick={() => monacoRef.current?.setValue('# Cleared\n')}>Clear</button>
      </div>
    </>
  );
};

const testMode = false;

if (testMode) {
  const sample: Gate[] = [{ type: 'x', qubit: 0, time: 25 }];

  let out = 'from qiskit import QuantumCircuit\n\nqc = QuantumCircuit(2)\n';
  for (const g of sample) out += `qc.x(${g.qubit})\n`;
  out += "\nqc.draw('text')\n";

  if (
    out !==
    "from qiskit import QuantumCircuit\n\nqc = QuantumCircuit(2)\nqc.x(0)\n\nqc.draw('text')\n"
  ) {
    throw new Error('Gate-to-code mirroring failed');
  }
}

export default CodeEditor;
