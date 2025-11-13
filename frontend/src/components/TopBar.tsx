import React from 'react';

const TopBar: React.FC = () => {
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
          marginRight: '55px',
        }}
        onClick={() => {
          // TODO: Implement submit functionality at some point
          console.log('Submit clicked');
        }}
      >
        Submit
      </button>
    </div>
  );
};

export default TopBar;
