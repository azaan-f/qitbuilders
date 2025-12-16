import React, { useEffect, useRef } from 'react';
import * as monaco from 'monaco-editor';

type GateParams = Record<string, unknown>;

type Gate = {
  type: string;
  qubit: number;
  time?: number;
  params?: GateParams;
};

type CodeEditorProps = {
  gates: Gate[];
  onCodeChange: (code: string) => void;
};

const getTheta = (g: Gate): string => {
  const theta = g.params?.theta;
  return typeof theta === 'string' ? theta : 'pi/2';
};

const CodeEditor: React.FC<CodeEditorProps> = ({ gates, onCodeChange }) => {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const monacoRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const suppressChangeRef = useRef(false);

  useEffect(() => {
    if (!editorRef.current) return;

    const editor = monaco.editor.create(editorRef.current, {
      language: 'python',
      theme: 'vs-dark',
      automaticLayout: true,
      fontSize: 14,

      minimap: { enabled: false },
      overviewRulerBorder: false,
      overviewRulerLanes: 0,

      glyphMargin: false,
      folding: false,
      lineNumbersMinChars: 3,

      renderLineHighlight: 'none',
      scrollbar: {
        verticalScrollbarSize: 10,
        horizontalScrollbarSize: 10,
        useShadows: false,
      },
    });

    monacoRef.current = editor;
    const sub = editor.onDidChangeModelContent(() => {
      if (suppressChangeRef.current) return;
      onCodeChange(editor.getValue());
    });

    return () => {
      sub.dispose();
      editor.dispose();
      monacoRef.current = null;
    };
  }, [onCodeChange]);

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
      }
    }

    code += `\nqc.draw('text')\n`;
    code += `qc.measure_all()\n`;

    suppressChangeRef.current = true;
    monacoRef.current.setValue(code);
    suppressChangeRef.current = false;

    onCodeChange(code);
  }, [gates, onCodeChange]);

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: '#1e1e1e',
        overflow: 'hidden',
      }}
    >
      <div
        ref={editorRef}
        style={{
          width: '100%',
          height: '100%',
        }}
      />
    </div>
  );
};

export default CodeEditor;
