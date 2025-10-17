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
    <div style={{ width: '100vw', height: '100vh', margin: 0, padding: 0 }}>
      <div ref={editorRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
}

export default App;