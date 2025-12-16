import { useCallback, useState } from 'react';
import CircuitEditor from './components/CircuitEditor';
import CodeEditor from './components/CodeEditor';
import TopBar from './components/TopBar';
import ResultsPopup from './components/ResultsPopup';

type Gate = {
  id: string;
  type: string;
  qubit: number;
  time: number;
};

type BraketRunResponse = {
  ok: boolean;
  backend: string;
  shots: number;
  counts: Record<string, number>;
};

const API_BASE = 'http://127.0.0.1:8000';

async function submitToBackend(code: string): Promise<BraketRunResponse> {
  const r = await fetch(`${API_BASE}/braket/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      code,
      backend: 'SV1',
      shots: 50,
    }),
  });

  if (!r.ok) {
    const text = await r.text();
    throw new Error(`Backend error ${r.status}: ${text}`);
  }

  return (await r.json()) as BraketRunResponse;
}

function App() {
  const [gates, setGates] = useState<Gate[]>([]);
  const [code, setCode] = useState<string>('');

  const [popupOpen, setPopupOpen] = useState(false);
  const [lastResult, setLastResult] = useState<BraketRunResponse | null>(null);

  const onSubmit = useCallback(() => {
    return submitToBackend(code);
  }, [code]);

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
      <TopBar
        onSubmit={onSubmit}
        onResult={(res) => {
          setLastResult(res as BraketRunResponse);
          setPopupOpen(true);
        }}
      />

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
          <CodeEditor gates={gates} onCodeChange={setCode} />
        </div>
      </div>

      <ResultsPopup open={popupOpen} result={lastResult} onClose={() => setPopupOpen(false)} />
    </div>
  );
}

export default App;
