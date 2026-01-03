import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Loader2, MessageCircle, AlertTriangle, Lightbulb, BookOpen } from 'lucide-react';

interface RiskExplanation {
  term: string;
  risk_level: string;
  risk_percentage: number;
  explanation: string;
  suggestions: Array<{
    suggestion: string;
    explanation: string;
    risk_reduction: string;
    legal_benefit: string;
  }>;
}

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  riskExplanation?: RiskExplanation;
}

export function EnhancedRiskChatbot() {
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
      content: "🎯 Hello! I'm your Legal Risk Assistant. I can help you understand risky legal terms and provide safer alternatives. Try asking me about terms like 'indemnify', 'waive', 'penalty', or paste any legal text for analysis.",
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  };

  const addMessage = (content: string, type: 'user' | 'bot', riskExplanation?: RiskExplanation) => {
    const message: Message = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date(),
      riskExplanation
    };
    setMessages(prev => [...prev, message]);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = inputValue.trim();
    addMessage(userMessage, 'user');
    setInputValue('');
    setIsLoading(true);

    try {
      // Check if it's a single term or document analysis
      const isSingleTerm = userMessage.split(' ').length <= 2;
      
      let response;
      if (isSingleTerm) {
        // Single term explanation
        response = await fetch('/api/risk/explain-term', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ term: userMessage })
        });
      } else {
        // Document analysis
        response = await fetch('/api/risk/analyze-suggestions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            text: userMessage,
            document_name: "Chat Analysis"
          })
        });
      }

      const data = await response.json();

      if (data.success) {
        if (isSingleTerm && data.explanation) {
          // Single term response
          const explanation = data.explanation;
          let responseText = `📖 **${explanation.term.toUpperCase()}**\n\n`;
          
          if (explanation.found) {
            responseText += `🎯 **Risk Level:** ${explanation.risk_data.risk_level.toUpperCase()} (${explanation.risk_data.risk_percentage}%)\n\n`;
            responseText += `⚠️ **Why it's risky:** ${explanation.risk_data.explanation}\n\n`;
            
            if (explanation.suggestions && explanation.suggestions.length > 0) {
              responseText += `💡 **Safer Alternatives:**\n`;
              explanation.suggestions.forEach((suggestion: any, index: number) => {
                responseText += `\n${index + 1}. **${suggestion.suggestion}**\n`;
                responseText += `   📝 ${suggestion.explanation}\n`;
                responseText += `   📉 Risk Reduction: ${suggestion.risk_reduction}\n`;
                responseText += `   ⚖️ Legal Benefit: ${suggestion.legal_benefit}\n`;
              });
            }
            
            addMessage(responseText, 'bot', explanation);
          } else {
            addMessage(`The term "${explanation.term}" was not found in our risk database. This might be a safe term, but consider the overall context of your document.`, 'bot');
          }
        } else if (data.analysis) {
          // Document analysis response
          const analysis = data.analysis;
          let responseText = `📊 **DOCUMENT ANALYSIS COMPLETE**\n\n`;
          responseText += `🎯 **Overall Risk Score:** ${analysis.overall_risk_score}%\n`;
          responseText += `📈 **Risk Level:** ${analysis.risk_level.toUpperCase()}\n`;
          responseText += `⚠️ **${analysis.risk_message}**\n\n`;
          
          if (analysis.detected_risks && analysis.detected_risks.length > 0) {
            responseText += `🔍 **Risky Terms Found:**\n`;
            analysis.detected_risks.forEach((risk: any, index: number) => {
              responseText += `\n${index + 1}. **${risk.term}** (${risk.risk_level} - ${risk.risk_percentage}%)\n`;
              responseText += `   📝 ${risk.explanation}\n`;
            });
          }
          
          if (analysis.suggestions && analysis.suggestions.length > 0) {
            responseText += `\n\n💡 **Suggestions for Improvement:**\n`;
            analysis.suggestions.forEach((suggestion: any, index: number) => {
              responseText += `\n**${suggestion.risky_term.toUpperCase()}:**\n`;
              responseText += `❌ Why risky: ${suggestion.why_risky}\n`;
              responseText += `✅ Alternatives:\n`;
              suggestion.suggestions.forEach((alt: any, altIndex: number) => {
                responseText += `   ${altIndex + 1}. ${alt.suggestion} (${alt.risk_reduction} reduction)\n`;
              });
            });
          }
          
          if (analysis.recommendations && analysis.recommendations.length > 0) {
            responseText += `\n\n📋 **Recommendations:**\n`;
            analysis.recommendations.forEach((rec: string) => {
              responseText += `• ${rec}\n`;
            });
          }
          
          addMessage(responseText, 'bot');
        } else {
          addMessage('I analyzed your text but couldn\'t find specific risk information. Try asking about specific legal terms or provide more context.', 'bot');
        }
      } else {
        addMessage('Sorry, I encountered an error analyzing your request. Please try again or rephrase your question.', 'bot');
      }
    } catch (error) {
      console.error('Risk analysis failed:', error);
      addMessage('Sorry, there was an error connecting to the risk analysis service. Please make sure the backend is running and try again.', 'bot');
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

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel?.toLowerCase()) {
      case 'critical': return 'text-red-600 bg-red-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-blue-600 bg-blue-50';
      case 'safe': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel?.toLowerCase()) {
      case 'critical': return <AlertTriangle className="text-red-500" size={16} />;
      case 'high': return <AlertTriangle className="text-orange-500" size={16} />;
      case 'medium': return <AlertTriangle className="text-yellow-500" size={16} />;
      case 'low': return <Lightbulb className="text-blue-500" size={16} />;
      case 'safe': return <BookOpen className="text-green-500" size={16} />;
      default: return <BookOpen className="text-gray-500" size={16} />;
    }
  };

  const renderMessage = (message: Message) => {
    return (
      <motion.div
        key={message.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
      >
        <div className={`max-w-[85%] ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
          {message.type === 'bot' && (
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-sm">
                <MessageCircle size={16} className="text-white" />
              </div>
              <span className="text-sm font-medium text-gray-600">Legal Risk Assistant</span>
            </div>
          )}
          
          <div className={`rounded-lg p-4 shadow-sm ${
            message.type === 'user' 
              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white' 
              : 'bg-white border border-gray-200 text-gray-800'
          }`}>
            <div className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</div>
            
            {/* Risk Explanation Card */}
            {message.riskExplanation && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
                <div className="flex items-center gap-2 mb-3">
                  {getRiskIcon(message.riskExplanation.risk_level)}
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskLevelColor(message.riskExplanation.risk_level)}`}>
                    {message.riskExplanation.risk_level.toUpperCase()} RISK ({message.riskExplanation.risk_percentage}%)
                  </span>
                </div>
                
                <h4 className="font-semibold text-gray-800 mb-2">Risk Analysis:</h4>
                <p className="text-sm text-gray-600 mb-3">{message.riskExplanation.explanation}</p>
                
                {message.riskExplanation.suggestions && message.riskExplanation.suggestions.length > 0 && (
                  <div>
                    <h5 className="font-medium text-gray-800 mb-2 flex items-center gap-1">
                      <Lightbulb size={14} />
                      Safer Alternatives:
                    </h5>
                    <div className="space-y-2">
                      {message.riskExplanation.suggestions.map((suggestion, index) => (
                        <div key={index} className="bg-white p-3 rounded border-l-4 border-green-400">
                          <div className="font-medium text-sm text-gray-800">{suggestion.suggestion}</div>
                          <div className="text-xs text-gray-600 mt-1">{suggestion.explanation}</div>
                          <div className="flex gap-4 mt-2 text-xs">
                            <span className="text-green-600">📉 Risk Reduction: {suggestion.risk_reduction}</span>
                            <span className="text-blue-600">⚖️ {suggestion.legal_benefit}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            <div className="text-xs opacity-70 mt-2">
              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>
      </motion.div>
    );
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
            : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
        }`}
        onClick={() => setIsOpen(!isOpen)}
        title="Legal Risk Assistant"
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
            className="fixed bottom-24 right-6 w-96 h-[600px] bg-white rounded-lg shadow-2xl z-40 flex flex-col overflow-hidden border border-gray-200"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <AlertTriangle size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Legal Risk Assistant</h3>
                  <p className="text-sm opacity-90">Get risk explanations & suggestions</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Quick Examples */}
            {messages.length <= 1 && (
              <div className="border-b border-gray-200 p-3 bg-gray-50">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Try asking about:</h4>
                <div className="flex flex-wrap gap-2">
                  {['indemnify', 'waive', 'penalty', 'exclusive'].map((term) => (
                    <button
                      key={term}
                      onClick={() => setInputValue(term)}
                      className="px-2 py-1 text-xs bg-white border border-gray-200 rounded hover:bg-blue-50 hover:border-blue-300 transition-colors"
                    >
                      {term}
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
                    <span className="text-sm text-gray-600">Analyzing risks...</span>
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
                  placeholder="Ask about legal terms or paste text to analyze..."
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
              <div className="text-xs text-gray-500 mt-2">
                💡 Ask about specific terms or paste legal text for analysis
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}