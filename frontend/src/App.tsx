import { useState } from 'react';
import CircuitEditor from './components/CircuitEditor';
import CodeEditor from './components/CodeEditor';
import TopBar from './components/TopBar';

function App() {
  const [gates, setGates] = useState([]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100vw',
        height: '100vh',
        margin: 0,
        backgroundColor: '#f3f4f6',
        overflow: 'hidden',
      }}
    >
      <TopBar />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <div
          style={{
            flex: 1,
            backgroundColor: '#ffffff',
            borderRight: '1px solid #e5e7eb',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <CircuitEditor setGates={setGates} />
        </div>

        <div
          style={{
            flex: 1,
            backgroundColor: '#ffffff',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <CodeEditor gates={gates} />
        </div>
      </div>
    </div>
  );
}

export default App;
