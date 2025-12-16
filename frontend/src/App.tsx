import { useState } from 'react';
import CircuitEditor from './components/CircuitEditor';
import CodeEditor from './components/CodeEditor';
import TopBar from './components/TopBar';

function App() {
  type Gate = {
    id: string;
    type: string;
    qubit: number;
    time: number;
  };

  const [gates, setGates] = useState<Gate[]>([]);

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        margin: 0,
        padding: 0,
        overflow: 'hidden',
        backgroundColor: '#f3f4f6',
      }}
    >
      <TopBar />

      <div
        style={{
          flex: 1,
          display: 'flex',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            flex: 1,
            overflow: 'hidden',
            backgroundColor: '#ffffff',
            borderRight: '1px solid #e5e7eb',
          }}
        >
          <CircuitEditor setGates={setGates} />
        </div>

        <div
          style={{
            flex: 1,
            overflow: 'hidden',
            backgroundColor: '#1e1e1e',
          }}
        >
          <CodeEditor gates={gates} />
        </div>
      </div>
    </div>
  );
}

export default App;
