import React from "react";
import CodeEditor from "../components/CodeEditor";

const Home: React.FC = () => {
  return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">
                Welcome to QitBuilder
            </h1>

            <div className="w-full max-w-4xl">
                <CodeEditor />
            </div>
        </div>
  );
};

export default Home;
