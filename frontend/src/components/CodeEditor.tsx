import React, { useEffect, useRef } from 'react';
import * as monaco from 'monaco-editor';

const CodeEditor: React.FC = () => {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const monacoInstanceRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  useEffect(() => {
    if (editorRef.current) {
      monacoInstanceRef.current = monaco.editor.create(editorRef.current, {
        value: '# QitBuilder\n# Write your Qiskit circuit code here\n',
        language: 'python',
        theme: 'vs-dark',
        automaticLayout: true,
        fontSize: 14,
        minimap: { enabled: false },
      });
    }

    return () => {
      monacoInstanceRef.current?.dispose();
    };
  }, []);

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
      <button>Clear</button>
    </div>
  </>
);

};

export default CodeEditor;
