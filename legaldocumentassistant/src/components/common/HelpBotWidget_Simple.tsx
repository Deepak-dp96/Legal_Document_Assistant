import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Loader2, MessageCircle } from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

interface ClickableQuery {
  id: string;
  question: string;
  icon: string;
}

export function HelpBotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      addWelcomeMessage();
    }
  }, [isOpen]);

  const addWelcomeMessage = () => {
    const welcomeMessage: Message = {
      id: Date.now().toString(),
      type: 'bot',
      content: "Hello! I'm your Legal AI Assistant. I can help you navigate the system and answer questions about document analysis, risk detection, and more. How can I assist you today?",
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  };

  const addMessage = (content: string, type: 'user' | 'bot') => {
    const message: Message = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, message]);
  };

  const quickQueries: ClickableQuery[] = [
    {
      id: 'nav_upload_document',
      question: '📤 How do I upload and analyze a document?',
      icon: '📤'
    },
    {
      id: 'nav_manage_documents',
      question: '📁 How do I manage and download my processed documents?',
      icon: '📁'
    },
    {
      id: 'nav_export_documents',
      question: '💾 How do I export my improved documents and reports?',
      icon: '💾'
    },
    {
      id: 'nav_track_history',
      question: '📈 How do I track my document analysis history?',
      icon: '📈'
    }
  ];

  const handleQuickQuery = async (queryId: string, questionText: string) => {
    addMessage(questionText, 'user');
    setIsLoading(true);

    try {
      const response = await fetch('/api/help/navigation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query_id: queryId })
      });

      const data = await response.json();

      if (data.success && data.data) {
        let responseText = data.data.response || data.data.title || 'Here\'s the information you requested.';
        
        // Format step-by-step guides
        if (data.data.type === 'step_by_step_guide' && data.data.steps) {
          responseText += '\n\nHere are the steps:\n';
          data.data.steps.forEach((step: any, index: number) => {
            responseText += `\n${step.step}. ${step.title}\n${step.description}`;
            if (step.visual_cue) {
              responseText += `\n💡 Look for: ${step.visual_cue}`;
            }
          });
        }

        addMessage(responseText, 'bot');
      } else {
        addMessage('Sorry, I couldn\'t process that request. Please try again or ask me a different question.', 'bot');
      }
    } catch (error) {
      console.error('Navigation query failed:', error);
      addMessage('Sorry, there was an error processing your request. Please make sure the backend server is running.', 'bot');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = inputValue.trim();
    addMessage(userMessage, 'user');
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/help/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          query: userMessage,
          context: 'help_widget'
        })
      });

      const data = await response.json();

      if (data.success && data.response) {
        let responseText = data.response.response || data.response.title || 'I\'m here to help!';
        
        // Add features if available
        if (data.response.features) {
          responseText += '\n\nFeatures:\n' + data.response.features.map((f: string) => `• ${f}`).join('\n');
        }
        
        // Add steps if available
        if (data.response.steps) {
          responseText += '\n\nSteps:\n' + data.response.steps.map((s: string, i: number) => `${i + 1}. ${s}`).join('\n');
        }

        addMessage(responseText, 'bot');
      } else {
        addMessage('Sorry, I couldn\'t understand that. Try asking about navigation, uploading documents, or viewing results.', 'bot');
      }
    } catch (error) {
      console.error('Help query failed:', error);
      addMessage('Sorry, there was an error. Please make sure the backend server is running and try again.', 'bot');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg z-50 flex items-center justify-center transition-all duration-300 ${
          isOpen 
            ? 'bg-red-500 hover:bg-red-600' 
            : 'bg-blue-500 hover:bg-blue-600'
        }`}
        onClick={() => setIsOpen(!isOpen)}
        title="Legal AI Assistant"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X size={24} className="text-white" />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <MessageCircle size={24} className="text-white" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Chat Widget */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-24 right-6 w-96 h-[500px] bg-white rounded-lg shadow-2xl z-40 flex flex-col overflow-hidden border border-gray-200"
          >
            {/* Header */}
            <div className="bg-blue-500 text-white p-4 flex items-center justify-between">
              <h3 className="font-semibold text-lg">Legal AI Assistant</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Quick Questions */}
            {messages.length <= 1 && (
              <div className="border-b border-gray-200 p-3 bg-gray-50">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Quick Questions:</h4>
                <div className="space-y-2">
                  {quickQueries.map((query) => (
                    <button
                      key={query.id}
                      onClick={() => handleQuickQuery(query.id, query.question)}
                      className="w-full text-left p-2 text-xs bg-white border border-gray-200 rounded-md hover:bg-blue-50 hover:border-blue-300 transition-colors"
                    >
                      {query.question}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] rounded-lg p-3 ${
                    message.type === 'user' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                    <div className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </motion.div>
              ))}
              
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-gray-100 rounded-lg p-3 flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin text-blue-500" />
                    <span className="text-sm text-gray-600">Thinking...</span>
                  </div>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t border-gray-200 p-4">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything about the system..."
                  disabled={isLoading}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={isLoading || !inputValue.trim()}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}