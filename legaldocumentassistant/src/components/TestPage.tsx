import React from 'react';

export function TestPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            🚀 Frontend is Working!
          </h1>
          <p className="text-gray-600 mb-6">
            The React application is running successfully.
          </p>
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="text-green-800 font-semibold">✅ React App</h3>
              <p className="text-green-600 text-sm">Running on localhost:3000</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-blue-800 font-semibold">🔗 Backend API</h3>
              <p className="text-blue-600 text-sm">Available on localhost:3001</p>
            </div>
            <button
              onClick={() => window.location.href = '/login'}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to Login Page
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}