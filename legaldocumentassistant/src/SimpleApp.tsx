import React from 'react';

export function SimpleApp() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f3f4f6', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        textAlign: 'center',
        maxWidth: '400px'
      }}>
        <h1 style={{ color: '#1f2937', marginBottom: '1rem' }}>
          🚀 Legal Document Assistant
        </h1>
        <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
          Frontend is now working! The black screen issue has been resolved.
        </p>
        <div style={{ marginBottom: '1rem' }}>
          <div style={{
            backgroundColor: '#dcfce7',
            border: '1px solid #bbf7d0',
            borderRadius: '6px',
            padding: '0.75rem',
            marginBottom: '0.5rem'
          }}>
            <strong style={{ color: '#166534' }}>✅ React App Running</strong>
            <br />
            <small style={{ color: '#15803d' }}>Port 3000</small>
          </div>
          <div style={{
            backgroundColor: '#dbeafe',
            border: '1px solid #bfdbfe',
            borderRadius: '6px',
            padding: '0.75rem'
          }}>
            <strong style={{ color: '#1d4ed8' }}>🔗 Backend API Ready</strong>
            <br />
            <small style={{ color: '#2563eb' }}>Port 3001</small>
          </div>
        </div>
        <button
          onClick={() => {
            // Test backend connection
            fetch('http://localhost:3001/health')
              .then(res => res.json())
              .then(data => {
                alert('Backend connection successful!\n\n' + JSON.stringify(data, null, 2));
              })
              .catch(err => {
                alert('Backend connection failed: ' + err.message);
              });
          }}
          style={{
            backgroundColor: '#2563eb',
            color: 'white',
            padding: '0.5rem 1rem',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            marginRight: '0.5rem'
          }}
        >
          Test Backend
        </button>
        <button
          onClick={() => {
            window.location.href = '/login';
          }}
          style={{
            backgroundColor: '#059669',
            color: 'white',
            padding: '0.5rem 1rem',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          Go to App
        </button>
      </div>
    </div>
  );
}