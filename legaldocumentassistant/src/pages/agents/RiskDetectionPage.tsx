import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MainLayout } from '../../components/layout/MainLayout';
import {
  AlertTriangleIcon,
  ArrowLeftIcon,
  DownloadIcon,
  FileTextIcon,
  SaveIcon,
  CheckCircle2Icon,
  InfoIcon,
  ShieldAlertIcon,
  TrendingUpIcon,
  ZapIcon,
  CalendarIcon,
  DollarSignIcon,
  ShieldCheckIcon,
  ExternalLinkIcon
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { apiClient } from '../../services/api';
import { useAgentProcessing } from '../../hooks/useAgentProcessing';
import { AgentErrorState, AgentLoadingState, AgentNoDataState } from '../../components/common/AgentStates';

export default function RiskDetectionPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const documentId = location.state?.documentId || localStorage.getItem('uploaded_document_id');
  const [isDownloading, setIsDownloading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'risks' | 'insights' | 'suggestions'>('overview');

  // Use the new hook for agent processing
  const {
    data: riskAnalysis,
    error,
    loading: isFetching,
    processing: isProcessing,
    retryCount,
    processDocument,
    retryProcessing
  } = useAgentProcessing({
    documentId,
    agentType: 'risk',
    autoFetch: true
  });

  const handleDownload = async () => {
    if (!documentId) return;
    setIsDownloading(true);
    try {
      // Logic to download the PDF report
      window.open(`${apiClient.baseURL}/documents/${documentId}/report?agent=risk`, '_blank');
    } catch (err) {
      console.error('Download error:', err);
      alert('Failed to download report.');
    } finally {
      setIsDownloading(false);
    }
  };

  if (isFetching || isProcessing) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-[80vh]">
          <AgentLoadingState
            agentName="Risk Detection"
            message={isProcessing ? "Analyzing document risks and liabilities..." : "Loading analysis results..."}
          />
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <button onClick={() => navigate('/agent-selection')} className="mb-6 flex items-center text-blue-600 hover:text-blue-700 transition-colors">
              <ArrowLeftIcon size={20} className="mr-2" />
              Back to Agent Selection
            </button>

            <AgentErrorState
              error={error}
              retryCount={retryCount}
              onRetry={retryProcessing}
              loading={isProcessing}
              agentName="Risk Detection"
            />
          </motion.div>
        </div>
      </MainLayout>
    );
  }

  if (!riskAnalysis) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <button onClick={() => navigate('/agent-selection')} className="mb-6 flex items-center text-blue-600 hover:text-blue-700 transition-colors">
              <ArrowLeftIcon size={20} className="mr-2" />
              Back to Agent Selection
            </button>

            <AgentNoDataState
              agentName="Risk Detection"
              onProcess={processDocument}
              loading={isProcessing}
            />
          </motion.div>
        </div>
      </MainLayout>
    );
  }

  // Check for non-legal document
  if (riskAnalysis.is_legal_document === false) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <button onClick={() => navigate('/agent-selection')} className="mb-6 flex items-center text-blue-600 hover:text-blue-700 transition-colors">
              <ArrowLeftIcon size={20} className="mr-2" />
              Back to Agent Selection
            </button>

            <div className="bg-white border border-red-200 rounded-lg shadow-sm p-8 text-center max-w-2xl">
              <div className="inline-flex items-center justify-center p-4 bg-red-100 rounded-full mb-6">
                <ShieldAlertIcon size={48} className="text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Non-Legal Document Detected</h2>
              <p className="text-gray-600 mb-6">
                The uploaded document appears to be a <strong>{riskAnalysis.document_type?.replace(/_/g, ' ')}</strong> rather than a legal contract.
              </p>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-left mb-8">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3">Document Summary</h3>
                <p className="text-gray-700 leading-relaxed">
                  {riskAnalysis.summary}
                </p>
              </div>

              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => navigate('/my-documents')}
                  className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Go to My Documents
                </button>
                <button
                  onClick={() => navigate('/upload')}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Upload Another Document
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </MainLayout>
    );
  }

  const { risk_percentage, summary, tags, categories, key_insights, ai_suggestions, detailed_analysis } = riskAnalysis;
  const identifiedRisks = detailed_analysis?.identified_risks || [];

  const getSeverityColor = (severity: string) => {
    if (!severity) return 'text-gray-600 bg-gray-50 border-gray-100';
    switch (severity.toLowerCase()) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-100';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-100';
      case 'low': return 'text-green-600 bg-green-50 border-green-100';
      default: return 'text-gray-600 bg-gray-50 border-gray-100';
    }
  };

  const getSeverityIcon = (severity: string) => {
    if (!severity) return <InfoIcon className="w-5 h-5" />;
    switch (severity.toLowerCase()) {
      case 'critical': return <ShieldAlertIcon className="w-5 h-5" />;
      case 'high': return <AlertTriangleIcon className="w-5 h-5" />;
      case 'medium': return <InfoIcon className="w-5 h-5" />;
      case 'low': return <CheckCircle2Icon className="w-5 h-5" />;
      default: return <InfoIcon className="w-5 h-5" />;
    }
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/agent-selection')}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeftIcon className="w-6 h-6 text-gray-600" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Risk Intelligence</h1>
              <p className="text-gray-500 flex items-center mt-1">
                <FileTextIcon className="w-4 h-4 mr-2" />
                {riskAnalysis.filename || 'Document'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="flex items-center space-x-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all shadow-sm font-medium"
            >
              <DownloadIcon className="w-4 h-4" />
              <span>{isDownloading ? 'Preparing...' : 'Export Report'}</span>
            </button>
            <button
              className="flex items-center space-x-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 font-medium"
            >
              <SaveIcon className="w-4 h-4" />
              <span>Save Analysis</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-8 space-y-8">
            {/* Risk Score Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl shadow-xl shadow-gray-100 border border-gray-100 overflow-hidden"
            >
              <div className="p-8 flex flex-col md:flex-row items-center gap-8">
                <div className="relative w-48 h-48 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="96"
                      cy="96"
                      r="88"
                      stroke="currentColor"
                      strokeWidth="12"
                      fill="transparent"
                      className="text-gray-100"
                    />
                    <motion.circle
                      cx="96"
                      cy="96"
                      r="88"
                      stroke="currentColor"
                      strokeWidth="12"
                      fill="transparent"
                      strokeDasharray={552.92}
                      initial={{ strokeDashoffset: 552.92 }}
                      animate={{ strokeDashoffset: 552.92 - (552.92 * risk_percentage) / 100 }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className={`${risk_percentage >= 70 ? 'text-red-500' :
                        risk_percentage >= 40 ? 'text-orange-500' : 'text-green-500'
                        }`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-5xl font-black text-gray-900">{risk_percentage}%</span>
                    <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">Risk Score</span>
                  </div>
                </div>

                <div className="flex-1 text-center md:text-left">
                  <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-widest mb-4">
                    Executive Summary
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Risk Profile Overview</h2>
                  <p className="text-gray-600 leading-relaxed mb-6">
                    {summary}
                  </p>
                  <div className="flex flex-wrap justify-center md:justify-start gap-2">
                    {tags.map((tag: string, i: number) => (
                      <span key={i} className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-lg">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-gray-200">
              {(['overview', 'risks', 'insights', 'suggestions'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-4 text-sm font-bold capitalize transition-all relative ${activeTab === tab ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                  {tab}
                  {activeTab === tab && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t-full"
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === 'overview' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                          <TrendingUpIcon className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-gray-900">Analysis Confidence</h3>
                      </div>
                      <div className="flex items-end space-x-2">
                        <span className="text-3xl font-bold text-gray-900">{riskAnalysis.confidence_percentage}%</span>
                        <span className="text-sm text-gray-500 mb-1">AI Certainty</span>
                      </div>
                      <div className="mt-4 w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${riskAnalysis.confidence_percentage}%` }}
                          className="h-full bg-purple-500"
                        />
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                          <ShieldCheckIcon className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-gray-900">Document Integrity</h3>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle2Icon className="w-6 h-6 text-green-500" />
                        <span className="text-lg font-bold text-gray-900">Verified Legal Document</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-2">
                        Classified as: <span className="font-bold text-gray-700">{riskAnalysis.document_type}</span>
                      </p>
                    </div>

                    <div className="md:col-span-2 bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-3xl text-white shadow-xl shadow-blue-100">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-xl font-bold mb-2">Ready to mitigate these risks?</h3>
                          <p className="text-blue-100 mb-6 max-w-md">
                            Our AI can help you draft counter-clauses or suggest specific legal language to protect your interests.
                          </p>
                          <button
                            onClick={() => navigate('/agent-selection')}
                            className="px-6 py-3 bg-white text-blue-600 rounded-xl font-bold hover:bg-blue-50 transition-all flex items-center space-x-2"
                          >
                            <span>Explore Drafting Agent</span>
                            <ZapIcon className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="hidden md:block">
                          <ShieldCheckIcon className="w-24 h-24 text-white/20" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'risks' && (
                  <div className="space-y-4">
                    {identifiedRisks.length > 0 ? (
                      identifiedRisks.map((risk: any, i: number) => (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.1 }}
                          key={i}
                          className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              <div className={`p-2 rounded-lg ${getSeverityColor(risk.severity)}`}>
                                {getSeverityIcon(risk.severity)}
                              </div>
                              <div>
                                <h4 className="font-bold text-gray-900 capitalize">{risk.risk_type} Risk</h4>
                                <div className={`text-xs font-bold uppercase tracking-wider ${getSeverityColor(risk.severity).split(' ')[0]}`}>
                                  {risk.severity} Severity
                                </div>
                              </div>
                            </div>
                            <div className="text-2xl font-black text-gray-100 group-hover:text-gray-200 transition-colors">
                              {String(i + 1).padStart(2, '0')}
                            </div>
                          </div>
                          <p className="text-gray-700 leading-relaxed">
                            {risk.description}
                          </p>
                          <div className="mt-4 flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <div className="bg-gray-100 h-1.5 w-24 rounded-full overflow-hidden">
                                <div
                                  className={`h-full ${risk.risk_percentage >= 70 ? 'bg-red-500' :
                                    risk.risk_percentage >= 40 ? 'bg-orange-500' : 'bg-green-500'
                                    }`}
                                  style={{ width: `${risk.risk_percentage}%` }}
                                />
                              </div>
                              <span className="text-xs font-bold text-gray-500">{risk.risk_percentage}% Impact</span>
                            </div>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                        <CheckCircle2Icon className="w-12 h-12 text-green-400 mx-auto mb-4" />
                        <p className="text-gray-500 font-medium">No specific risks identified in this category.</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'insights' && (
                  <div className="grid grid-cols-1 gap-4">
                    {key_insights.map((insight: any, i: number) => (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={i}
                        className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-start space-x-4"
                      >
                        <div className="mt-1">
                          <div className={`p-2 rounded-lg ${getSeverityColor(insight.risk_level)}`}>
                            {getSeverityIcon(insight.risk_level)}
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-bold text-gray-900">{insight.clause_name}</h4>
                            <span className="text-xs font-semibold px-2 py-0.5 bg-gray-100 text-gray-500 rounded">
                              {insight.clause_type}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{insight.summary}</p>
                          <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                            <div className="flex items-center text-blue-800 text-xs font-bold mb-1">
                              <ShieldAlertIcon className="w-3 h-3 mr-1" />
                              STRATEGIC RISK DESCRIPTION
                            </div>
                            <p className="text-sm text-blue-900">{insight.risk_description}</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {activeTab === 'suggestions' && (
                  <div className="space-y-4">
                    {ai_suggestions.map((suggestion: any, i: number) => (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        key={i}
                        className="bg-white p-6 rounded-2xl border-l-4 border-l-blue-500 border-y border-r border-gray-100 shadow-sm flex items-start space-x-4"
                      >
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-full">
                          <ZapIcon className="w-5 h-5 fill-current" />
                        </div>
                        <div>
                          <p className="text-gray-800 font-medium leading-relaxed">
                            {typeof suggestion === 'string' ? suggestion : suggestion.issue}
                          </p>
                          {typeof suggestion !== 'string' && suggestion.suggested_change && (
                            <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200 font-mono text-xs text-gray-600">
                              {suggestion.suggested_change}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right Column - Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            {/* Document Details */}
            <div className="bg-white p-6 rounded-3xl shadow-lg shadow-gray-100 border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-6 flex items-center">
                <InfoIcon className="w-5 h-5 mr-2 text-blue-500" />
                Document Intelligence
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-50">
                  <div className="flex items-center text-gray-500 text-sm">
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    Upload Date
                  </div>
                  <span className="text-sm font-bold text-gray-700">
                    {new Date(riskAnalysis.created_at || '').toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-gray-50">
                  <div className="flex items-center text-gray-500 text-sm">
                    <ShieldCheckIcon className="w-4 h-4 mr-2" />
                    Agent Used
                  </div>
                  <span className="text-sm font-bold text-gray-700 capitalize">
                    {riskAnalysis.agent_type || 'Risk'}
                  </span>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-gray-50">
                  <div className="flex items-center text-gray-500 text-sm">
                    <ZapIcon className="w-4 h-4 mr-2" />
                    AI Model
                  </div>
                  <span className="text-sm font-bold text-gray-700">
                    {riskAnalysis.model_used || 'Gemini Pro'}
                  </span>
                </div>
              </div>

              <div className="mt-8">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Categories</h4>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat: string, i: number) => (
                    <span key={i} className="px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-bold rounded-xl border border-blue-100">
                      {cat}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Financial Summary if available */}
            {detailed_analysis?.financial_summary && (
              <div className="bg-white p-6 rounded-3xl shadow-lg shadow-gray-100 border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-6 flex items-center">
                  <DollarSignIcon className="w-5 h-5 mr-2 text-green-500" />
                  Financial Impact
                </h3>
                <div className="space-y-4">
                  {Object.entries(detailed_analysis.financial_summary).map(([key, value]: [string, any]) => (
                    <div key={key} className="flex items-center justify-between py-2">
                      <span className="text-sm text-gray-500 capitalize">{key.replace(/_/g, ' ')}</span>
                      <span className="text-sm font-black text-gray-900">
                        {typeof value === 'number' ? `$${value.toLocaleString()}` : value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-gray-900 p-6 rounded-3xl text-white shadow-xl shadow-gray-200">
              <h3 className="font-bold text-lg mb-4">Legal Actions</h3>
              <div className="space-y-3">
                <button className="w-full flex items-center justify-between p-4 bg-white/10 hover:bg-white/20 rounded-2xl transition-all group">
                  <span className="font-medium">Request Legal Review</span>
                  <ExternalLinkIcon className="w-4 h-4 opacity-50 group-hover:opacity-100" />
                </button>
                <button className="w-full flex items-center justify-between p-4 bg-white/10 hover:bg-white/20 rounded-2xl transition-all group">
                  <span className="font-medium">Compare with Templates</span>
                  <ExternalLinkIcon className="w-4 h-4 opacity-50 group-hover:opacity-100" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
