import { useState } from 'react';

interface Question {
  id: string;
  icon: string;
  question: string;
  answer: string;
  category: 'navigation' | 'agents' | 'features';
}

const questions: Question[] = [
  // Navigation Questions
  {
    id: '1',
    icon: '🏠',
    question: 'How do I navigate the Dashboard?',
    answer: `🏠 Dashboard Navigation:

The Dashboard is your main overview page.

📍 Location: /dashboard (Home)

📊 What you'll find:
• Real-time document statistics
• Recent analysis activity
• AI Agents status
• Quick action buttons
• System health indicators

💡 Tip: Click "Upload Document" to start analyzing!`,
    category: 'navigation'
  },
  {
    id: '2',
    icon: '📤',
    question: 'How do I upload and analyze documents?',
    answer: `📤 Upload & Analyze Documents:

📍 Location: Risk Detection → Upload Document

Steps:
1️⃣ Go to "Risk Detection" in sidebar
2️⃣ Click "Upload Document" button
3️⃣ Select file (DOCX, PDF, or TXT)
4️⃣ Choose analysis type
5️⃣ Click "Start Analysis"
6️⃣ Wait 30-60 seconds for results

✅ Supported: Word, PDF, Plain Text
📏 Max size: 10MB`,
    category: 'navigation'
  },
  {
    id: '3',
    icon: '📊',
    question: 'Where can I view my analysis reports?',
    answer: `📊 View Analysis Reports:

📍 Location: Reports (in sidebar)

What you'll see:
• All generated risk reports
• Risk score breakdowns
• Detailed analysis results
• Download options (PDF)

📋 Report Contents:
• Executive Summary
• Overall Risk Score
• Detected Risky Terms
• Category Distribution
• Recommendations`,
    category: 'navigation'
  },
  {
    id: '4',
    icon: '📁',
    question: 'How do I manage my documents?',
    answer: `📁 Document Management:

📍 Locations:
• My Documents - Processed files
• Recent Uploads - Latest uploads
• Export History - Download history

Features:
• View all uploaded documents
• Download processed files
• Track version history
• Delete unwanted files
• Search & filter documents

💡 Tip: Use "My Documents" for processed files with replacements applied.`,
    category: 'navigation'
  },
  {
    id: '5',
    icon: '📈',
    question: 'Where is the Analytics page?',
    answer: `📈 Analytics Page:

📍 Location: Analytics (in sidebar)

What you'll find:
• Risk trend analysis over time
• Document processing statistics
• Performance metrics
• Usage patterns
• Category breakdowns

📊 Charts include:
• Risk distribution pie chart
• Processing timeline
• Agent usage statistics
• Monthly comparisons`,
    category: 'navigation'
  },
  {
    id: '6',
    icon: '⚙️',
    question: 'How do I access Settings?',
    answer: `⚙️ Settings Page:

📍 Location: Settings (in sidebar)

Options available:
• Profile settings
• Notification preferences
• Display options
• Account management
• Password change
• Theme settings

💡 Tip: Update your profile to personalize your experience.`,
    category: 'navigation'
  },
  // AI Agents Questions
  {
    id: '7',
    icon: '🎯',
    question: 'What is the Risk Detection Agent?',
    answer: `🎯 Risk Detection Agent V2:

📍 Location: AI Agents → Risk Detection

Purpose: Analyzes documents for risky legal terms

Features:
• 195+ risky terms database
• 9 risk categories
• Color-coded highlighting
• Real-time risk scoring
• Clickable word replacement

Risk Levels:
🔴 Critical (80-100%) - DO NOT SIGN
🟠 High (60-79%) - Legal review needed
🟡 Medium (30-59%) - Careful review
🟢 Low (0-29%) - Generally safe`,
    category: 'agents'
  },
  {
    id: '8',
    icon: '📝',
    question: 'What is the Clause Extraction Agent?',
    answer: `📝 Clause Extraction Agent:

📍 Location: AI Agents → Clause Extraction

Purpose: Extracts and identifies key clauses from legal documents

Features:
• Automatic clause detection
• Category classification
• Important terms highlighting
• Clause summarization
• Export extracted clauses

Detects:
• Liability clauses
• Termination clauses
• Payment terms
• Confidentiality clauses
• Indemnification clauses`,
    category: 'agents'
  },
  {
    id: '9',
    icon: '✍️',
    question: 'What is the Drafting Agent?',
    answer: `✍️ Drafting Agent:

📍 Location: AI Agents → Drafting

Purpose: Helps draft and improve legal documents

Features:
• Template suggestions
• Clause recommendations
• Language improvement
• Legal terminology assistance
• Document structuring

Use cases:
• Creating new contracts
• Improving existing documents
• Adding standard clauses
• Professional formatting`,
    category: 'agents'
  },
  {
    id: '10',
    icon: '📋',
    question: 'What is the Summary Agent?',
    answer: `📋 Summary Agent:

📍 Location: AI Agents → Summary

Purpose: Creates concise summaries of legal documents

Features:
• Executive summaries
• Key points extraction
• Risk highlights
• Action items identification
• Quick document overview

Output includes:
• Document type identification
• Main parties involved
• Key obligations
• Important dates
• Risk summary`,
    category: 'agents'
  },
  {
    id: '11',
    icon: '🔄',
    question: 'What is the Replacement Agent?',
    answer: `🔄 Replacement Agent:

📍 Location: Integrated in Risk Detection

Purpose: Provides safer alternatives for risky terms

Features:
• 7+ alternatives per risky word
• One-click replacement
• Explanation for each alternative
• Risk reduction percentage
• Legal benefit description

How to use:
1️⃣ Click on highlighted risky word
2️⃣ View popup with alternatives
3️⃣ Read explanations
4️⃣ Click to replace
5️⃣ Document updates instantly`,
    category: 'agents'
  },
  {
    id: '12',
    icon: '📥',
    question: 'What is the Document Export Agent?',
    answer: `📥 Document Export Agent:

📍 Location: My Documents → Export

Purpose: Generates professional documents with improvements

Features:
• Word (.docx) export
• PDF export
• Logo integration
• Professional formatting
• Metadata inclusion
• Track changes option

Export includes:
• Updated document with replacements
• Risk analysis summary
• Recommendations section
• Professional letterhead`,
    category: 'agents'
  },
  // Features Questions
  {
    id: '13',
    icon: '⚠️',
    question: 'How do I fix risky terms in my document?',
    answer: `⚠️ Fixing Risky Terms:

After analysis, risky words are highlighted:

1️⃣ Click on any highlighted word
2️⃣ Popup shows 7+ alternatives
3️⃣ Each explains why it's safer
4️⃣ Click to replace instantly
5️⃣ Document updates in real-time

Color Guide:
🔴 Red = Critical Risk
🟠 Orange = High Risk  
🟡 Yellow = Medium Risk
🟢 Green = Low Risk

💡 Highlighted words are clickable!`,
    category: 'features'
  },
  {
    id: '14',
    icon: '📥',
    question: 'How do I export my improved document?',
    answer: `📥 Exporting Documents:

📍 Location: My Documents

Steps:
1️⃣ Go to "My Documents"
2️⃣ Find your processed document
3️⃣ Click download button
4️⃣ Choose format (Word/PDF)
5️⃣ File downloads automatically

Export Options:
• Microsoft Word (.docx)
• PDF document
• With or without track changes
• Include risk report

💡 Exported files have all risky terms replaced!`,
    category: 'features'
  },
  {
    id: '15',
    icon: '🔔',
    question: 'How do notifications work?',
    answer: `🔔 Notifications:

📍 Location: Bell icon (top bar) or Notifications page

You'll be notified about:
• Analysis completion
• High-risk documents detected
• Export ready for download
• System updates
• New features

Settings:
• Email notifications
• In-app notifications
• Notification preferences in Settings

💡 Click the bell icon to see recent notifications.`,
    category: 'features'
  }
];

export function HelpBotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [activeCategory, setActiveCategory] = useState<'all' | 'navigation' | 'agents' | 'features'>('all');

  const filteredQuestions = activeCategory === 'all' 
    ? questions 
    : questions.filter(q => q.category === activeCategory);

  const handleQuestionClick = (question: Question) => {
    setSelectedQuestion(question);
  };

  const handleBack = () => {
    setSelectedQuestion(null);
  };

  const categories = [
    { id: 'all', label: 'All', icon: '📚' },
    { id: 'navigation', label: 'Navigation', icon: '🗺️' },
    { id: 'agents', label: 'AI Agents', icon: '🤖' },
    { id: 'features', label: 'Features', icon: '⭐' }
  ];

  return (
    <>
      {/* Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            border: 'none',
            color: 'white',
            fontSize: '28px',
            cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(59, 130, 246, 0.4)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'transform 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          🤖
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '400px',
          height: '600px',
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          fontFamily: '"Segoe UI", Arial, sans-serif'
        }}>
          {/* Header */}
          <div style={{
            background: 'linear-gradient(90deg, #1e3a5f 0%, #3b82f6 100%)',
            padding: '16px 20px',
            color: 'white',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                background: 'rgba(255,255,255,0.2)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px'
              }}>
                🤖
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '16px' }}>Help Bot Assistant</div>
                <div style={{ fontSize: '12px', opacity: 0.9 }}>Navigation & AI Agents Guide</div>
              </div>
            </div>
            <button
              onClick={() => { setIsOpen(false); setSelectedQuestion(null); }}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                color: 'white',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                cursor: 'pointer',
                fontSize: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              ×
            </button>
          </div>

          {/* Content */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px'
          }}>
            {!selectedQuestion ? (
              /* Questions List */
              <div>
                {/* Category Tabs */}
                <div style={{
                  display: 'flex',
                  gap: '8px',
                  marginBottom: '16px',
                  flexWrap: 'wrap'
                }}>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id as any)}
                      style={{
                        padding: '8px 12px',
                        borderRadius: '20px',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: 500,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        background: activeCategory === cat.id ? '#3b82f6' : '#f1f5f9',
                        color: activeCategory === cat.id ? 'white' : '#64748b',
                        transition: 'all 0.2s'
                      }}
                    >
                      <span>{cat.icon}</span>
                      <span>{cat.label}</span>
                    </button>
                  ))}
                </div>

                <div style={{
                  fontSize: '13px',
                  color: '#64748b',
                  marginBottom: '12px'
                }}>
                  📋 {filteredQuestions.length} questions available
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {filteredQuestions.map((q) => (
                    <button
                      key={q.id}
                      onClick={() => handleQuestionClick(q)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '12px 14px',
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.2s',
                        fontSize: '13px',
                        color: '#1e293b'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#eff6ff';
                        e.currentTarget.style.borderColor = '#3b82f6';
                        e.currentTarget.style.transform = 'translateX(4px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#f8fafc';
                        e.currentTarget.style.borderColor = '#e2e8f0';
                        e.currentTarget.style.transform = 'translateX(0)';
                      }}
                    >
                      <span style={{ fontSize: '18px' }}>{q.icon}</span>
                      <span style={{ flex: 1 }}>{q.question}</span>
                      <span style={{ color: '#94a3b8', fontSize: '16px' }}>→</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* Answer View */
              <div>
                <button
                  onClick={handleBack}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 12px',
                    background: '#f1f5f9',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    color: '#3b82f6',
                    marginBottom: '16px',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#e2e8f0'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#f1f5f9'}
                >
                  ← Back to questions
                </button>

                {/* Question */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '12px 14px',
                  background: '#eff6ff',
                  border: '2px solid #3b82f6',
                  borderRadius: '10px',
                  marginBottom: '16px'
                }}>
                  <span style={{ fontSize: '22px' }}>{selectedQuestion.icon}</span>
                  <span style={{ fontWeight: 600, color: '#1e40af', fontSize: '14px' }}>
                    {selectedQuestion.question}
                  </span>
                </div>

                {/* Answer */}
                <div style={{
                  padding: '16px',
                  background: '#f8fafc',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '12px'
                  }}>
                    <div style={{
                      width: '26px',
                      height: '26px',
                      background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px'
                    }}>
                      🤖
                    </div>
                    <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>Help Bot Answer</span>
                  </div>
                  <div style={{
                    fontSize: '13px',
                    lineHeight: '1.7',
                    color: '#334155',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {selectedQuestion.answer}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}