import { useEffect, useRef } from 'react';
import * as monaco from 'monaco-editor';

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
        width: '100vw',
        height: '100vh',
        margin: 0,
        padding: '40px',
        backgroundColor: '#f3f4f6', // light gray background
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div
        ref={editorRef}
        style={{
          width: '80%',
          height: '80%',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
        }}
      />
    </div>
  );
}

export default App;
