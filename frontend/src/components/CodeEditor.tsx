import React from 'react';
import Editor from '@monaco-editor/react';

const CodeEditor: React.FC = () => (
  <div className="border rounded-lg shadow-md bg-white w-full" style={{ height: '600px' }}>
    <Editor
      height="100%"
      theme="vs-dark"
      defaultLanguage="python"
      defaultValue={`# QitBuilder\n# Write your Qiskit circuit code here\n`}
      options={{
        fontSize: 14,
        minimap: { enabled: false },
        automaticLayout: true,
      }}
    />
  </div>
);

export default CodeEditor;
