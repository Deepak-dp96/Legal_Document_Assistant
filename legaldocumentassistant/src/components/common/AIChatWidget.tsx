import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircleIcon, XIcon, SendIcon, SparklesIcon } from 'lucide-react';
interface Message {
  role: 'user' | 'assistant';
  content: string;
}
export function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([{
    role: 'assistant',
    content: "Hi! I'm your DeepLex AI assistant. I can help you navigate the app, explain features, or answer questions about legal document analysis. What would you like to know?"
  }]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  const getAIResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    // Login help
    if (lowerMessage.includes('login') || lowerMessage.includes('sign in')) {
      return "To login: 1) Go to the login page, 2) Enter your email and password, 3) Click 'Sign in'. If you forgot your password, click 'Forgot Password?' to reset it.";
    }
    // Upload document
    if (lowerMessage.includes('upload') || lowerMessage.includes('document') || lowerMessage.includes('file')) {
      return "To upload a document: 1) Click 'Upload Document' from the dashboard, 2) Drag and drop your file or click 'Select Files', 3) Review file details, 4) Select privacy settings if needed, 5) Click 'Continue to Agent Selection'. Supported formats: PDF, DOCX, TXT, ODT (Max 50MB).";
    }
    // Agent selection
    if (lowerMessage.includes('agent') || lowerMessage.includes('choose') || lowerMessage.includes('select')) {
      return 'DeepLex has 4 AI agents:\n\n1. **Clause Extraction**: Extract and categorize contract clauses\n2. **Risk Detection**: Identify legal risks and compliance issues\n3. **Drafting Agent**: Generate and improve contract language\n4. **Summary Agent**: Create concise document summaries\n\nClick on any agent card to start analysis!';
    }
    // Clause extraction
    if (lowerMessage.includes('clause') || lowerMessage.includes('extraction')) {
      return 'The Clause Extraction Agent analyzes your document and identifies all important clauses, categorizes them (Payment Terms, Confidentiality, Termination, etc.), and provides confidence scores. Processing takes ~2 minutes.';
    }
    // Risk detection
    if (lowerMessage.includes('risk') || lowerMessage.includes('detection')) {
      return 'The Risk Detection Agent scans your contract for potential legal risks, compliance issues, and problematic clauses. It provides severity ratings (High/Medium/Low) and recommendations for each risk. Processing takes ~3 minutes.';
    }
    // Drafting agent
    if (lowerMessage.includes('draft') || lowerMessage.includes('improve')) {
      return 'The Drafting Agent reviews your contract language and suggests improvements for clarity, specificity, and legal enforceability. It shows original vs. improved text with detailed reasoning. Processing takes ~4 minutes.';
    }
    // Summary agent
    if (lowerMessage.includes('summary') || lowerMessage.includes('summarize')) {
      return 'The Summary Agent creates a concise executive summary of your document, highlighting key points, obligations, financial terms, and critical dates. Perfect for quick reviews! Processing takes ~1 minute.';
    }
    // Reports
    if (lowerMessage.includes('report') || lowerMessage.includes('result') || lowerMessage.includes('view')) {
      return "After agent processing completes, you'll see a detailed report with findings, metrics, and recommendations. You can download reports as PDF or share them with your team using the buttons at the top.";
    }
    // Settings
    if (lowerMessage.includes('setting') || lowerMessage.includes('profile')) {
      return 'Access Settings from the sidebar to:\n- Update your profile information\n- Change password\n- Configure notifications\n- Set AI agent preferences\n- Manage privacy and data retention\n- Customize appearance';
    }
    // Dashboard
    if (lowerMessage.includes('dashboard') || lowerMessage.includes('home')) {
      return 'The Dashboard shows your document processing metrics, agent status, and recent activity. Use the "Upload Document" button to start analyzing new files, or click on any agent card to view details.';
    }
    // Help
    if (lowerMessage.includes('help') || lowerMessage.includes('support') || lowerMessage.includes('how')) {
      return 'Visit the Help & Support page (sidebar) for detailed guides on:\n- How to login\n- Uploading documents\n- Choosing agents\n- Viewing reports\n- Using settings\n- Troubleshooting\n\nOr ask me specific questions!';
    }
    // Password issues
    if (lowerMessage.includes('password') || lowerMessage.includes('forgot') || lowerMessage.includes('reset')) {
      return "If you forgot your password: 1) Click 'Forgot Password?' on the login page, 2) Enter your email, 3) Check your email for the reset link, 4) Create a new password. If you don't receive the email, check your spam folder.";
    }
    // Getting started
    if (lowerMessage.includes('start') || lowerMessage.includes('begin') || lowerMessage.includes('new')) {
      return "Welcome to DeepLex! Here's how to get started:\n\n1. **Upload** a legal document (PDF, DOCX, TXT)\n2. **Select** an AI agent based on your needs\n3. **Wait** for processing (1-4 minutes)\n4. **Review** the detailed report with insights\n5. **Download** or share your results\n\nNeed help with any step? Just ask!";
    }
    // Pricing/cost
    if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('pay')) {
      return 'For pricing information and subscription plans, please contact our sales team or check the pricing page. I can help you with app features and usage!';
    }
    // Default response
    return 'I can help you with:\n\n• **Login & Account** - Sign in, password reset\n• **Uploading Documents** - How to upload and what formats\n• **AI Agents** - Choosing and using agents\n• **Reports** - Viewing and downloading results\n• **Settings** - Customizing your experience\n• **General Navigation** - Finding features\n\nWhat would you like to know more about?';
  };
  const handleSend = () => {
    if (!message.trim()) return;
    const userMessage = message.trim();
    setMessages([...messages, {
      role: 'user',
      content: userMessage
    }]);
    setMessage('');
    // Get AI response
    setTimeout(() => {
      const response = getAIResponse(userMessage);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: response
      }]);
    }, 800);
  };
  return <>
      {/* Floating Button */}
      <motion.button onClick={() => setIsOpen(!isOpen)} className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-royal-blue to-neon-cyan text-white p-4 rounded-full shadow-neon-cyan hover:shadow-glow transition-all duration-300" whileHover={{
      scale: 1.1
    }} whileTap={{
      scale: 0.95
    }}>
        {isOpen ? <XIcon size={24} /> : <MessageCircleIcon size={24} />}
      </motion.button>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && <motion.div initial={{
        opacity: 0,
        y: 20,
        scale: 0.95
      }} animate={{
        opacity: 1,
        y: 0,
        scale: 1
      }} exit={{
        opacity: 0,
        y: 20,
        scale: 0.95
      }} transition={{
        duration: 0.2
      }} className="fixed bottom-24 right-6 z-50 w-96 h-[500px] glass-card-premium flex flex-col shadow-2xl">
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <SparklesIcon size={20} className="text-neon-cyan" />
                <h3 className="font-semibold text-white">DeepLex Assistant</h3>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-white/70 hover:text-white transition-colors">
                <XIcon size={20} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, idx) => <motion.div key={idx} initial={{
            opacity: 0,
            y: 10
          }} animate={{
            opacity: 1,
            y: 0
          }} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-3 rounded-2xl ${msg.role === 'user' ? 'bg-royal-blue text-white' : 'bg-white/10 text-white border border-white/20'}`}>
                    <p className="text-sm whitespace-pre-line leading-relaxed">
                      {msg.content}
                    </p>
                  </div>
                </motion.div>)}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-white/10">
              <div className="flex space-x-2">
                <input type="text" value={message} onChange={e => setMessage(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSend()} placeholder="Ask me anything..." className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-neon-cyan/50 focus:ring-2 focus:ring-neon-cyan/20" />
                <button onClick={handleSend} className="bg-neon-cyan text-deep-navy p-2 rounded-xl hover:bg-neon-cyan/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled={!message.trim()}>
                  <SendIcon size={20} />
                </button>
              </div>
            </div>
          </motion.div>}
      </AnimatePresence>
    </>;
}