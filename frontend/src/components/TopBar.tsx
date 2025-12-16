import React, { useState } from 'react';

type SubmitResponse = unknown;

type TopBarProps = {
  onSubmit: () => Promise<SubmitResponse>;
  onResult?: (res: SubmitResponse) => void;
};

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === 'string') return err;
  try {
    return JSON.stringify(err);
  } catch {
    return 'Submit failed';
  }
}

const TopBar: React.FC<TopBarProps> = ({ onSubmit, onResult }) => {
  const [status, setStatus] = useState<string>('');

  return (
    <div
      style={{
        width: '100%',
        height: '60px',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e5e7eb',
        display: 'flex',
        alignItems: 'center',
        padding: '0 20px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      }}
    >
      <div
        style={{
          fontWeight: 'bold',
          fontSize: '1.25rem',
          color: '#374151',
          flex: 1,
        }}
      >
        Quantum Circuit Builder
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginRight: '55px' }}>
        <div
          style={{
            fontSize: 12,
            color: '#6b7280',
            maxWidth: 420,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
          title={status}
        >
          {status}
        </div>

        <button
          style={{
            backgroundColor: '#3b82f6',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '6px',
            border: 'none',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'background-color 0.2s',
          }}
          onClick={async () => {
            setStatus('Submitting...');
            try {
              const res = await onSubmit();
              setStatus('Submitted ✓');
              onResult?.(res);
            } catch (e: unknown) {
              setStatus(`:| ) ${getErrorMessage(e)}`);
            }
          }}
        >
          Submit
        </button>
      </div>
    </div>
  );
};

export default TopBar;
