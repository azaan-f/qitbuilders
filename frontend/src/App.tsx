import { useEffect, useRef } from 'react';
import * as monaco from 'monaco-editor';
import CircuitEditor from './components/CircuitEditor';

function App() {
  const editorRef = useRef(null);
  const monacoInstanceRef = useRef(null);

  useEffect(() => {
    if (editorRef.current) {
      monacoInstanceRef.current = monaco.editor.create(editorRef.current, {
        value: '# Python here.\n',
        language: 'python',
        theme: 'vs-dark',
        automaticLayout: true,
        fontSize: 14,
        minimap: { enabled: false },
      });
    }

    return () => {
      if (monacoInstanceRef.current) {
        monacoInstanceRef.current.dispose();
      }
    };
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        width: '100vw',
        height: '100vh',
        margin: 0,
        backgroundColor: '#f3f4f6',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          flex: 1,
          backgroundColor: '#ffffff',
          borderRight: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          fontSize: '1.25rem',
          fontWeight: '500',
          color: '#4b5563',
        }}
      >
        <CircuitEditor />
      </div>
      <div
        ref={editorRef}
        style={{
          flex: 1,
          height: '100%',
          borderLeft: '1px solid #d1d5db',
          boxShadow: 'inset 0 0 10px rgba(0,0,0,0.1)',
        }}
      />
    </div>
  );

}

export default App;
