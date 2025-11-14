import React, { useEffect, useRef } from 'react';
import * as monaco from 'monaco-editor';

const CodeEditor: React.FC<{ gates: any[] }> = ({ gates }) => {
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

export default CodeEditor;
