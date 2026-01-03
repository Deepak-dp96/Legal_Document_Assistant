import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangleIcon, LightbulbIcon, XIcon } from 'lucide-react';

interface RiskyWord {
  id: string;
  word: string;
  position: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  alternatives: string[];
  category: string;
  impact: string;
  context?: {
    before: string;
    word: string;
    after: string;
    fullContext: string;
  };
}

interface RiskWordHighlighterProps {
  documentText: string;
  riskyWords: RiskyWord[];
}

export function RiskWordHighlighter({ documentText, riskyWords }: RiskWordHighlighterProps) {
  const [selectedWord, setSelectedWord] = useState<RiskyWord | null>(null);
  const [hoveredWord, setHoveredWord] = useState<string | null>(null);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-600 text-white';
      case 'high': return 'bg-red-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getSeverityBorder = (severity: string) => {
    switch (severity) {
      case 'critical': return 'border-red-600 bg-red-50';
      case 'high': return 'border-red-500 bg-red-50';
      case 'medium': return 'border-yellow-500 bg-yellow-50';
      case 'low': return 'border-green-500 bg-green-50';
      default: return 'border-gray-500 bg-gray-50';
    }
  };

  const highlightText = () => {
    if (!riskyWords.length) return documentText;

    let highlightedText = documentText;
    const sortedWords = [...riskyWords].sort((a, b) => b.position - a.position);

    sortedWords.forEach((riskyWord) => {
      const beforeText = highlightedText.substring(0, riskyWord.position);
      const afterText = highlightedText.substring(riskyWord.position + riskyWord.word.length);
      
      const highlightedWord = `<span 
        class="risky-word ${getSeverityColor(riskyWord.severity)} px-1 py-0.5 rounded cursor-pointer hover:shadow-lg transition-all duration-200 relative"
        data-word-id="${riskyWord.id}"
        data-severity="${riskyWord.severity}"
      >
        ${riskyWord.word}
        <span class="absolute -top-1 -right-1 w-2 h-2 ${getSeverityColor(riskyWord.severity)} rounded-full animate-pulse"></span>
      </span>`;
      
      highlightedText = beforeText + highlightedWord + afterText;
    });

    return highlightedText;
  };

  const handleWordClick = (wordId: string) => {
    const word = riskyWords.find(w => w.id === wordId);
    setSelectedWord(word || null);
  };

  return (
    <div className="space-y-6">
      {/* Document Text with Highlighting */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <AlertTriangleIcon size={20} className="mr-2 text-orange-500" />
          Document Analysis with Risk Highlighting
        </h3>
        
        <div 
          className="prose max-w-none text-gray-700 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: highlightText() }}
          onClick={(e) => {
            const target = e.target as HTMLElement;
            if (target.classList.contains('risky-word')) {
              const wordId = target.getAttribute('data-word-id');
              if (wordId) handleWordClick(wordId);
            }
          }}
        />
        
        <div className="mt-4 flex flex-wrap gap-2">
          <div className="flex items-center text-sm text-gray-600">
            <span className="w-3 h-3 bg-red-600 rounded mr-2"></span>
            Critical/High Risk
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <span className="w-3 h-3 bg-yellow-500 rounded mr-2"></span>
            Medium Risk
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <span className="w-3 h-3 bg-green-500 rounded mr-2"></span>
            Low Risk
          </div>
        </div>
      </div>

      {/* Risk Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-2">Risk Density</h4>
          <div className="text-2xl font-bold text-red-600">
            {((riskyWords.length / documentText.split(' ').length) * 100).toFixed(1)}%
          </div>
          <p className="text-sm text-gray-600">
            {riskyWords.length} risky words out of {documentText.split(' ').length} total words
          </p>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-2">Severity Distribution</h4>
          <div className="space-y-1">
            {['critical', 'high', 'medium', 'low'].map(severity => {
              const count = riskyWords.filter(w => w.severity === severity).length;
              return (
                <div key={severity} className="flex justify-between text-sm">
                  <span className="capitalize">{severity}:</span>
                  <span className="font-medium">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-2">Risk Categories</h4>
          <div className="space-y-1">
            {Object.entries(
              riskyWords.reduce((acc, word) => {
                acc[word.category] = (acc[word.category] || 0) + 1;
                return acc;
              }, {} as Record<string, number>)
            ).map(([category, count]) => (
              <div key={category} className="flex justify-between text-sm">
                <span className="capitalize">{category.replace('-', ' ')}:</span>
                <span className="font-medium">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Word Details Modal */}
      <AnimatePresence>
        {selectedWord && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedWord(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">
                    Risk Analysis: "{selectedWord.word}"
                  </h3>
                  <button
                    onClick={() => setSelectedWord(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XIcon size={24} />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Severity Badge */}
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getSeverityColor(selectedWord.severity)}`}>
                      {selectedWord.severity.toUpperCase()} RISK
                    </span>
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                      {selectedWord.impact} Impact
                    </span>
                  </div>

                  {/* Context */}
                  {selectedWord.context && (
                    <div className={`border-l-4 ${getSeverityBorder(selectedWord.severity)} p-4 rounded`}>
                      <h4 className="font-semibold text-gray-900 mb-2">Context</h4>
                      <p className="text-gray-700">
                        {selectedWord.context.before}
                        <span className={`${getSeverityColor(selectedWord.severity)} px-1 py-0.5 rounded font-semibold`}>
                          {selectedWord.context.word}
                        </span>
                        {selectedWord.context.after}
                      </p>
                    </div>
                  )}

                  {/* Alternatives */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <LightbulbIcon size={18} className="mr-2 text-yellow-500" />
                      Suggested Alternatives
                    </h4>
                    <div className="grid gap-2">
                      {selectedWord.alternatives.map((alternative, index) => (
                        <div
                          key={index}
                          className="bg-green-50 border border-green-200 rounded-lg p-3 hover:bg-green-100 transition-colors cursor-pointer"
                        >
                          <span className="text-green-800 font-medium">"{alternative}"</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recommendation */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 mb-2">Recommendation</h4>
                    <p className="text-blue-800">
                      Consider replacing "{selectedWord.word}" with one of the suggested alternatives to reduce {selectedWord.impact.toLowerCase()} risk and improve contract terms.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}