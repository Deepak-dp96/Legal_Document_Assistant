import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Loader2, Bot, ChevronDown, ChevronUp, Star, HelpCircle, MessageCircle } from 'lucide-react';

interface ClickableQuery {
  id: string;
  question: string;
  category: string;
  icon: string;
  priority: number;
}

interface StepGuide {
  type: string;
  title: string;
  icon: string;
  steps: Array<{
    step: number;
    title: string;
    description: string;
    visual_cue?: string;
    supported_formats?: string[];
    options?: string[];
    risk_levels?: Record<string, string>;
    what_happens?: string[];
    selection_tips?: string[];
    wait_time?: string;
    color_guide?: Record<string, string>;
  }>;
  next_actions?: string[];
  pro_tips?: string[];
  troubleshooting?: Record<string, string>;
}

interface HelpResponse {
  type: string;
  title: string;
  response: string;
  features?: string[];
  url?: string;
  action?: string;
  pages?: Record<string, string>;
  suggestion?: string;
  categories?: Record<string, string[]>;
  steps?: string[];
  locations?: Record<string, string>;
  formats?: string[];
}

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  helpResponse?: HelpResponse;
  stepGuide?: StepGuide;
}

export function HelpBotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showQuickMenu, setShowQuickMenu] = useState(true);
  const [clickableQueries, setClickableQueries] = useState<ClickableQuery[]>([]);
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set());
  const [userRating, setUserRating] = useState<number>(0);
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

  // Load clickable queries when widget opens
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      loadClickableQueries();
      addWelcomeMessage();
    }
  }, [isOpen]);

  const loadClickableQueries = async () => {
    try {
      const response = await fetch('/api/help/menu');
      const data = await response.json();
      
      if (data.success && data.menu?.clickable_queries) {
        setClickableQueries(data.menu.clickable_queries);
      }
    } catch (error) {
      console.error('Failed to load clickable queries:', error);
      // Fallback to default queries
      setClickableQueries([
        {
          id: 'nav_upload_document',
          question: '📤 How do I upload and analyze a document?',
          category: 'Getting Started',
          icon: '📤',
          priority: 1
        },
        {
          id: 'nav_view_results',
          question: '📊 Where can I see my analysis results and reports?',
          category: 'Results & Reports',
          icon: '📊',
          priority: 2
        },
        {
          id: 'nav_understand_risks',
          question: '⚠️ How do I understand and fix risky terms?',
          category: 'Risk Analysis',
          icon: '⚠️',
          priority: 3
        },
        {
          id: 'nav_export_documents',
          question: '💾 How do I export my improved documents?',
          category: 'Export & Download',
          icon: '💾',
          priority: 4
        }
      ]);
    }
  };

  const addWelcomeMessage = () => {
    const welcomeMessage: Message = {
      id: Date.now().toString(),
      type: 'bot',
      content: "👋 Hi! I'm your navigation assistant with advanced features. I can help you find your way around the Legal Document Assistant with step-by-step guides, visual cues, and interactive help. Click any question below or ask me anything!",
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  };

  const addMessage = (content: string, type: 'user' | 'bot', helpResponse?: HelpResponse, stepGuide?: StepGuide) => {
    const message: Message = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date(),
      helpResponse,
      stepGuide
    };
    setMessages(prev => [...prev, message]);
  };

  const handleClickableQuery = async (queryId: string, questionText: string) => {
    addMessage(questionText, 'user');
    setIsLoading(true);
    setShowQuickMenu(false);

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
        if (data.data.type === 'step_by_step_guide') {
          addMessage('Here\'s your detailed step-by-step guide:', 'bot', undefined, data.data);
        } else {
          addMessage(data.data.response || 'Here\'s the information you requested.', 'bot', data.data);
        }
      } else {
        addMessage('Sorry, I couldn\'t process that request. Please try again or ask me a different question.', 'bot');
      }
    } catch (error) {
      console.error('Navigation query failed:', error);
      addMessage('Sorry, there was an error processing your request. The backend server might not be running.', 'bot');
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
    setShowQuickMenu(false);

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
        const helpResponse = data.response;
        let responseText = helpResponse.response || helpResponse.title || 'I\'m here to help!';
        
        // Add additional information based on response type
        if (helpResponse.features) {
          responseText += '\n\n**Features:**\n' + helpResponse.features.map((f: string) => `• ${f}`).join('\n');
        }
        
        if (helpResponse.steps) {
          responseText += '\n\n**Steps:**\n' + helpResponse.steps.map((s: string, i: number) => `${i + 1}. ${s}`).join('\n');
        }
        
        if (helpResponse.locations) {
          responseText += '\n\n**Locations:**\n' + Object.entries(helpResponse.locations).map(([key, value]) => `• **${key}:** ${value}`).join('\n');
        }

        addMessage(responseText, 'bot', helpResponse);
      } else {
        addMessage('Sorry, I couldn\'t understand that. Try asking about navigation, uploading documents, or viewing results. You can also click the quick questions below!', 'bot');
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

  const toggleStepExpansion = (stepIndex: number) => {
    const newExpanded = new Set(expandedSteps);
    if (newExpanded.has(stepIndex)) {
      newExpanded.delete(stepIndex);
    } else {
      newExpanded.add(stepIndex);
    }
    setExpandedSteps(newExpanded);
  };

  const submitRating = async (rating: number, messageId: string) => {
    setUserRating(rating);
    try {
      await fetch('/api/help/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rating,
          messageId,
          timestamp: new Date().toISOString()
        })
      });
      addMessage(`Thank you for rating this response ${rating}/5 stars! Your feedback helps me improve.`, 'bot');
    } catch (error) {
      console.error('Failed to submit rating:', error);
    }
  };

  const renderStepGuide = (guide: StepGuide) => {
    return (
      <div className="step-guide bg-white border border-gray-200 rounded-lg overflow-hidden mt-3 shadow-sm">
        <div className="step-guide-header bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <span className="text-xl">{guide.icon}</span>
            {guide.title}
          </h3>
        </div>
        
        <div className="step-guide-content p-4 space-y-4">
          {guide.steps.map((step, index) => (
            <div key={index} className="step border-l-4 border-blue-500 bg-gray-50 rounded-r-lg overflow-hidden">
              <div 
                className="step-header flex items-center justify-between p-4 cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => toggleStepExpansion(index)}
              >
                <div className="flex items-center gap-3">
                  <div className="step-number bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-sm">
                    {step.step}
                  </div>
                  <h4 className="font-semibold text-gray-800">{step.title}</h4>
                </div>
                <motion.div
                  animate={{ rotate: expandedSteps.has(index) ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown size={20} className="text-gray-500" />
                </motion.div>
              </div>
              
              <AnimatePresence>
                {expandedSteps.has(index) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="step-content px-4 pb-4"
                  >
                    <p className="text-gray-700 mb-3 leading-relaxed">{step.description}</p>
                    
                    {step.visual_cue && (
                      <div className="visual-cue bg-green-50 border border-green-200 rounded-md p-3 mb-3">
                        <div className="flex items-center gap-2 text-green-700">
                          <span>💡</span>
                          <span className="font-medium">Visual Cue:</span>
                        </div>
                        <p className="text-green-600 mt-1">{step.visual_cue}</p>
                      </div>
                    )}
                    
                    {step.supported_formats && (
                      <div className="formats bg-blue-50 border border-blue-200 rounded-md p-3 mb-3">
                        <h5 className="font-medium text-blue-800 mb-2 flex items-center gap-1">
                          📄 Supported Formats:
                        </h5>
                        <ul className="list-disc list-inside text-blue-700 space-y-1">
                          {step.supported_formats.map((format, i) => (
                            <li key={i}>{format}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {step.options && (
                      <div className="options bg-purple-50 border border-purple-200 rounded-md p-3 mb-3">
                        <h5 className="font-medium text-purple-800 mb-2 flex items-center gap-1">
                          ⚙️ Available Options:
                        </h5>
                        <ul className="list-disc list-inside text-purple-700 space-y-1">
                          {step.options.map((option, i) => (
                            <li key={i}>{option}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {step.risk_levels && (
                      <div className="risk-levels mb-3">
                        <h5 className="font-medium text-gray-800 mb-2 flex items-center gap-1">
                          🎯 Risk Levels:
                        </h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {Object.entries(step.risk_levels).map(([level, description], i) => {
                            const colorClass = level.includes('Critical') ? 'bg-red-100 border-red-300 text-red-800' :
                                             level.includes('High') ? 'bg-orange-100 border-orange-300 text-orange-800' :
                                             level.includes('Medium') ? 'bg-yellow-100 border-yellow-300 text-yellow-800' :
                                             'bg-green-100 border-green-300 text-green-800';
                            
                            return (
                              <div key={i} className={`risk-level border rounded-md p-3 text-center ${colorClass}`}>
                                <div className="font-bold text-sm">{level}</div>
                                <div className="text-xs mt-1">{description}</div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    
                    {step.what_happens && (
                      <div className="what-happens bg-indigo-50 border border-indigo-200 rounded-md p-3 mb-3">
                        <h5 className="font-medium text-indigo-800 mb-2 flex items-center gap-1">
                          🔄 What Happens:
                        </h5>
                        <ul className="list-disc list-inside text-indigo-700 space-y-1">
                          {step.what_happens.map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {step.wait_time && (
                      <div className="wait-time bg-gray-100 border border-gray-300 rounded-md p-2 text-center">
                        <span className="text-gray-700 flex items-center justify-center gap-1">
                          ⏱️ Expected time: {step.wait_time}
                        </span>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
          
          {guide.next_actions && (
            <div className="next-actions bg-blue-50 border border-blue-200 rounded-md p-4">
              <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                🎯 Next Actions:
              </h4>
              <ul className="list-disc list-inside text-blue-700 space-y-1">
                {guide.next_actions.map((action, i) => (
                  <li key={i}>{action}</li>
                ))}
              </ul>
            </div>
          )}
          
          {guide.pro_tips && (
            <div className="pro-tips bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <h4 className="font-semibold text-yellow-800 mb-2 flex items-center gap-2">
                💡 Pro Tips:
              </h4>
              <ul className="list-disc list-inside text-yellow-700 space-y-1">
                {guide.pro_tips.map((tip, i) => (
                  <li key={i}>{tip}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderMessage = (message: Message) => {
    return (
      <motion.div
        key={message.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`message flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
      >
        <div className={`max-w-[85%] ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
          {message.type === 'bot' && (
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-sm">
                <Bot size={16} className="text-white" />
              </div>
              <span className="text-sm font-medium text-gray-600">Navigation Assistant</span>
            </div>
          )}
          
          <div className={`rounded-lg p-3 shadow-sm ${
            message.type === 'user' 
              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white' 
              : 'bg-gray-100 text-gray-800'
          }`}>
            <div className="whitespace-pre-wrap">{message.content}</div>
            
            {message.stepGuide && renderStepGuide(message.stepGuide)}
            
            {message.helpResponse && message.helpResponse.features && (
              <div className="mt-3 p-3 bg-white bg-opacity-20 rounded">
                <h4 className="font-semibold mb-2">Features:</h4>
                <ul className="list-disc list-inside space-y-1">
                  {message.helpResponse.features.map((feature, i) => (
                    <li key={i}>{feature}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          {/* Rating system for bot messages */}
          {message.type === 'bot' && message.stepGuide && (
            <div className="flex items-center gap-2 mt-2 px-2">
              <span className="text-xs text-gray-500">Rate this guide:</span>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => submitRating(star, message.id)}
                  className={`text-sm transition-colors ${
                    star <= userRating ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-300'
                  }`}
                >
                  <Star size={14} fill={star <= userRating ? 'currentColor' : 'none'} />
                </button>
              ))}
            </div>
          )}
          
          <div className="text-xs text-gray-500 mt-1 px-2">
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <>
      {/* Help Bot Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg z-50 flex items-center justify-center transition-all duration-300 ${
          isOpen 
            ? 'bg-red-500 hover:bg-red-600' 
            : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
        }`}
        onClick={() => setIsOpen(!isOpen)}
        title="Help & Navigation Assistant"
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
              key="bot"
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

      {/* Help Bot Widget */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-24 right-6 w-96 h-[600px] bg-white rounded-lg shadow-2xl z-40 flex flex-col overflow-hidden border border-gray-200"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <Bot size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="font-semibold">Navigation Assistant</h3>
                  <p className="text-sm opacity-90">Step-by-step guidance</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Quick Menu */}
            {showQuickMenu && clickableQueries.length > 0 && (
              <div className="border-b border-gray-200 p-3 bg-gray-50">
                <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                  <HelpCircle size={16} />
                  Quick Navigation
                </h4>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {clickableQueries.slice(0, 4).map((query) => (
                    <button
                      key={query.id}
                      onClick={() => handleClickableQuery(query.id, query.question)}
                      className="w-full text-left p-2 text-xs bg-white border border-gray-200 rounded-md hover:bg-blue-50 hover:border-blue-300 transition-colors flex items-center gap-2"
                    >
                      <span className="text-sm">{query.icon}</span>
                      <span className="truncate">{query.question}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map(renderMessage)}
              
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
            <div className="border-t border-gray-200 p-4 bg-gray-50">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about navigation, features, or anything else..."
                  disabled={isLoading}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={isLoading || !inputValue.trim()}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                >
                  <Send size={16} />
                </button>
              </div>
              
              {!showQuickMenu && clickableQueries.length > 0 && (
                <button
                  onClick={() => setShowQuickMenu(true)}
                  className="mt-2 text-xs text-blue-500 hover:text-blue-600 flex items-center gap-1"
                >
                  <HelpCircle size={12} />
                  Show quick questions
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}