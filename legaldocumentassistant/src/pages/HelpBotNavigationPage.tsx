import React, { useState } from 'react';

const HelpBotNavigationPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState('history');

  const contentMap: Record<string, any> = {
    'upload': {
      status: 'Low (0-29%)',
      statusLabel: 'Generally Safe',
      steps: [
        { number: '1', title: 'Select Document', content: 'Choose your legal document (PDF, Word, or text file)' },
        { number: '2', title: 'Upload & Analyze', content: 'Our AI will scan for risky terms and legal issues' },
        { number: '3', title: 'Review Results', content: 'See highlighted risky words with risk scores' }
      ]
    },
    'results': {
      status: 'Low (0-29%)',
      statusLabel: 'Generally Safe',
      steps: [
        { number: '1', title: 'Risk Dashboard', content: 'View overall risk score and category breakdown' },
        { number: '2', title: 'Detailed Report', content: 'See specific risky terms with explanations' },
        { number: '3', title: 'Comparison View', content: 'Compare original vs improved document' }
      ]
    },
    'manage': {
      status: 'Low (0-29%)',
      statusLabel: 'Generally Safe',
      steps: [
        { number: '1', title: 'My Documents', content: 'Access all your uploaded and processed documents' },
        { number: '2', title: 'Version History', content: 'Track changes and improvements over time' },
        { number: '3', title: 'Download Options', content: 'Export in PDF, Word, or text format' }
      ]
    },
    'risky': {
      status: 'Low (0-29%)',
      statusLabel: 'Generally Safe',
      steps: [
        { 
          number: '1', 
          title: 'Click on Risky Words', 
          content: 'Click any highlighted word to see safer alternatives', 
          highlight: 'Highlighted words are clickable', 
          list: ['Popup shows 7+ alternative suggestions', 'Each alternative explains why it\'s safer', 'One-click replacement in your document'] 
        },
        { number: '2', title: 'Choose Best Alternative', content: 'Select the alternative that fits your situation' }
      ]
    },
    'export': {
      status: 'Low (0-29%)',
      statusLabel: 'Generally Safe',
      steps: [
        { number: '1', title: 'Review Changes', content: 'Confirm all improvements and replacements' },
        { number: '2', title: 'Select Format', content: 'Choose PDF, Word, or text export format' },
        { number: '3', title: 'Download', content: 'Get your improved, legally safer document' }
      ]
    },
    'history': {
      status: 'Low (0-29%)',
      statusLabel: 'Generally Safe',
      steps: [
        { 
          number: '1', 
          title: 'Click on Risky Words', 
          content: 'Click any highlighted word to see safer alternatives', 
          highlight: 'Highlighted words are clickable', 
          list: ['Popup shows 7+ alternative suggestions', 'Each alternative explains why it\'s safer', 'One-click replacement in your document'] 
        },
        { number: '2', title: 'Choose Best Alternative', content: 'Select the alternative that fits your situation' }
      ]
    }
  };

  const currentContent = contentMap[activeSection];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: '"Segoe UI", Arial, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(90deg, #1e3a5f 0%, #3b82f6 100%)',
        padding: '30px 20px',
        textAlign: 'center',
        color: 'white'
      }}>
        <h1 style={{ margin: 0, fontSize: '32px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
          <span style={{ fontSize: '36px' }}>🤖</span> Help Bot Navigation Assistant
        </h1>
        <p style={{ marginTop: '10px', fontSize: '16px', opacity: 0.9 }}>
          Click any question below for step-by-step guidance
        </p>
      </div>

      {/* Main Layout */}
      <div style={{
        display: 'flex',
        margin: '20px',
        background: '#f8fafc',
        borderRadius: '12px',
        overflow: 'hidden',
        minHeight: 'calc(100vh - 180px)'
      }}>
        {/* Sidebar */}
        <div style={{
          width: '35%',
          background: 'white',
          padding: '24px',
          borderRight: '1px solid #e2e8f0'
        }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', color: '#1f2937', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>📋</span> Navigation Queries
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { id: 'upload', icon: '📤', text: 'How do I upload and analyze a document?' },
              { id: 'results', icon: '📊', text: 'Where can I see my analysis results and reports?' },
              { id: 'manage', icon: '📁', text: 'How do I manage and download my processed documents?' },
              { id: 'risky', icon: '⚠️', text: 'How do I understand and fix risky terms?' },
              { id: 'export', icon: '📤', text: 'How do I export my improved documents and reports?' },
              { id: 'history', icon: '📜', text: 'How do I track my document analysis history?' }
            ].map((item) => (
              <div
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                style={{
                  padding: '14px 16px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  transition: 'all 0.2s',
                  background: activeSection === item.id ? '#eff6ff' : '#f9fafb',
                  border: activeSection === item.id ? '2px solid #3b82f6' : '1px solid #e5e7eb',
                  color: activeSection === item.id ? '#1e40af' : '#374151'
                }}
              >
                <span>{item.icon}</span>
                <span style={{ fontSize: '14px' }}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div style={{
          width: '65%',
          padding: '24px',
          overflowY: 'auto'
        }}>
          {/* Status Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: '#dcfce7',
            color: '#166534',
            padding: '12px 20px',
            borderRadius: '8px',
            fontWeight: 600,
            marginBottom: '24px'
          }}>
            <span style={{ fontSize: '16px' }}>🟢</span>
            <span>{currentContent.status}</span>
            <span style={{ fontWeight: 400 }}>{currentContent.statusLabel}</span>
          </div>
          
          {/* Steps */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {currentContent.steps.map((step: any, index: number) => (
              <div key={index} style={{
                background: 'white',
                borderRadius: '12px',
                padding: '20px',
                borderLeft: '4px solid #3b82f6',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}>
                <h4 style={{ 
                  margin: '0 0 8px 0', 
                  fontSize: '18px', 
                  color: '#1f2937',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span style={{
                    background: '#3b82f6',
                    color: 'white',
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    fontWeight: 600
                  }}>{step.number}</span>
                  {step.title}
                </h4>
                <p style={{ margin: '0 0 12px 0', color: '#6b7280', fontSize: '15px' }}>{step.content}</p>
                
                {step.highlight && (
                  <div style={{
                    background: '#fef3c7',
                    color: '#92400e',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    marginBottom: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '14px'
                  }}>
                    <span>💡</span> {step.highlight}
                  </div>
                )}
                
                {step.list && (
                  <div>
                    <strong style={{ color: '#374151', fontSize: '15px' }}>What Happens:</strong>
                    <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px', color: '#6b7280' }}>
                      {step.list.map((item: string, i: number) => (
                        <li key={i} style={{ marginBottom: '6px', fontSize: '14px' }}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpBotNavigationPage;