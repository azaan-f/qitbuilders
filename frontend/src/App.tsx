import CircuitEditor from './components/CircuitEditor';
import CodeEditor from './components/CodeEditor';
import TopBar from './components/TopBar';

function App() {
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
      <div
        style={{
          display: 'flex',
          flex: 1,
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
          style={{
            flex: 1,
            backgroundColor: '#ffffff',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: '1.25rem',
            fontWeight: '500',
            color: '#4b5563',
          }}
        >
          <CodeEditor />
        </div>
      </div>
    </div>
  );
}

export default App;
