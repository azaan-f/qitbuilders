import React, { useEffect, useMemo } from 'react';

type BraketResponse = {
  ok?: boolean;
  backend?: string;
  shots?: number;
  counts?: Record<string, number>;
};

type ResultsPopupProps = {
  open: boolean;
  result: unknown;
  onClose: () => void;
};

function isBraketResponse(x: unknown): x is BraketResponse {
  return typeof x === 'object' && x !== null;
}

const ResultsPopup: React.FC<ResultsPopupProps> = ({ open, result, onClose }) => {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  const parsed = useMemo(
    () => (isBraketResponse(result) ? (result as BraketResponse) : {}),
    [result]
  );

  const counts = parsed.counts ?? {};
  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const total = entries.reduce((s, [, v]) => s + v, 0);
  const max = Math.max(1, ...entries.map(([, v]) => v));

  if (!open) return null;

  return (
    <div
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.55)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <div
        style={{
          width: 'min(680px, 95%)',
          background: '#ffffff',
          borderRadius: 16,
          boxShadow: '0 25px 60px rgba(0,0,0,0.25)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: '14px 18px',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Braket Execution Results</div>
            <div style={{ fontSize: 12, color: '#6b7280' }}>Measurement summary</div>
          </div>

          <button
            onClick={onClose}
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              border: '1px solid #e5e7eb',
              background: '#ffffff',
              cursor: 'pointer',
              fontSize: 20,
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>

        <div style={{ padding: 16, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Chip label="Status" value={parsed.ok ? 'OK' : '—'} />
          <Chip label="Backend" value={parsed.backend ?? '—'} />
          <Chip label="Shots" value={parsed.shots?.toString() ?? '—'} />
          <Chip label="Total" value={total.toString()} />
        </div>

        <div style={{ padding: '0 16px 16px' }}>
          <div
            style={{
              border: '1px solid #e5e7eb',
              borderRadius: 12,
              padding: 12,
            }}
          >
            {entries.length === 0 ? (
              <div style={{ color: '#6b7280' }}>No counts returned</div>
            ) : (
              entries.map(([bits, count]) => {
                const pct = total ? (count / total) * 100 : 0;
                return (
                  <div
                    key={bits}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '70px 1fr 90px',
                      gap: 12,
                      alignItems: 'center',
                      marginBottom: 10,
                    }}
                  >
                    <div
                      style={{
                        fontFamily: 'monospace',
                        fontWeight: 700,
                        textAlign: 'center',
                        background: '#f3f4f6',
                        borderRadius: 8,
                        padding: '6px 0',
                      }}
                    >
                      {bits}
                    </div>

                    <div
                      style={{
                        height: 10,
                        background: '#e5e7eb',
                        borderRadius: 999,
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          width: `${(count / max) * 100}%`,
                          height: '100%',
                          background: '#3b82f6',
                        }}
                      />
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 700 }}>{count}</div>
                      <div style={{ fontSize: 12, color: '#6b7280' }}>{pct.toFixed(1)}%</div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <details style={{ marginTop: 12 }}>
            <summary style={{ cursor: 'pointer', fontWeight: 600 }}>View raw response</summary>
            <pre
              style={{
                marginTop: 8,
                padding: 12,
                background: '#0f172a',
                color: '#e5e7eb',
                borderRadius: 10,
                fontSize: 12,
                overflowX: 'auto',
              }}
            >
              {JSON.stringify(result, null, 2)}
            </pre>
          </details>
        </div>
      </div>
    </div>
  );
};

function Chip({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        padding: '6px 10px',
        borderRadius: 999,
        background: '#f3f4f6',
        border: '1px solid #e5e7eb',
        fontSize: 12,
        fontWeight: 600,
        display: 'flex',
        gap: 6,
      }}
    >
      <span style={{ color: '#6b7280' }}>{label}:</span>
      <span style={{ fontFamily: 'monospace' }}>{value}</span>
    </div>
  );
}

export default ResultsPopup;
