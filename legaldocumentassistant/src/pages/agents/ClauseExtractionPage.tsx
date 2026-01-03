import { motion } from 'framer-motion';
import { MainLayout } from '../../components/layout/MainLayout';
import { FileTextIcon, ArrowLeftIcon, DownloadIcon, ShareIcon, TagIcon, AlertCircleIcon, ShieldCheckIcon, ClockIcon } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useAgentProcessing } from '../../hooks/useAgentProcessing';
import { AgentErrorState, AgentLoadingState, AgentNoDataState } from '../../components/common/AgentStates';

export function ClauseExtractionPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const documentId = location.state?.documentId || localStorage.getItem('clause_document_id') || localStorage.getItem('uploaded_document_id');
  const documentName = location.state?.documentName || localStorage.getItem('uploaded_file_name') || 'Document';

  // Use the new hook for agent processing
  const {
    data: analysisResult,
    error,
    loading: isFetching,
    processing: isProcessing,
    retryCount,
    processDocument,
    retryProcessing
  } = useAgentProcessing({
    documentId,
    agentType: 'clause',
    autoFetch: true
  });

  // Derived data for rendering
  const clauses = analysisResult?.key_insights || [];
  const detailedAnalysis = analysisResult?.detailed_analysis || {};
  const riskScore = analysisResult?.risk_percentage || 0;
  const riskLevel = riskScore >= 70 ? 'High' : riskScore >= 30 ? 'Medium' : 'Low';
  const totalClauses = clauses.length;
  const tags = analysisResult?.tags || [];
  const categories = analysisResult?.categories || [];
  const summary = analysisResult?.summary || '';
  const confidenceScore = analysisResult?.confidence_percentage || 0;

  const getRiskColor = (risk: string) => {
    switch (risk?.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-700 border-red-300';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'low': return 'bg-green-100 text-green-700 border-green-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const handleDownload = () => {
    if (!analysisResult) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;

    // Title
    doc.setFontSize(20);
    doc.setTextColor(44, 62, 80);
    doc.text('Clause Extraction Report', pageWidth / 2, 20, { align: 'center' });

    // Document Info
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(`Document: ${documentName}`, 14, 35);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 42);

    // Summary Section
    let yPos = 55;
    if (summary) {
      doc.setFontSize(14);
      doc.setTextColor(44, 62, 80);
      doc.text('Executive Summary', 14, yPos);
      yPos += 10;
      doc.setFontSize(10);
      doc.setTextColor(0);
      const splitSummary = doc.splitTextToSize(summary, pageWidth - 28);
      doc.text(splitSummary, 14, yPos);
      yPos += splitSummary.length * 5 + 10;
    }

    // Analysis Stats
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(`Total Clauses: ${totalClauses}`, 14, yPos);
    doc.text(`Overall Risk Score: ${riskScore}/100`, 14, yPos + 7);
    doc.text(`Confidence Score: ${confidenceScore}%`, 14, yPos + 14);
    yPos += 25;

    // Key Findings (if available)
    if (analysisResult.key_insights && analysisResult.key_insights.length > 0) {
      if (yPos > 250) { doc.addPage(); yPos = 20; }
      doc.setFontSize(14);
      doc.setTextColor(44, 62, 80);
      doc.text('Key Insights', 14, yPos);
      yPos += 10;

      doc.setFontSize(10);
      doc.setTextColor(0);
      analysisResult.key_insights.forEach((clause: any) => {
        const insightText = clause.summary || clause;
        const splitText = doc.splitTextToSize(`• ${insightText}`, pageWidth - 28);
        doc.text(splitText, 14, yPos);
        yPos += splitText.length * 5 + 2;
      });
      yPos += 10;
    }

    // Clauses Table
    doc.setFontSize(14);
    doc.setTextColor(44, 62, 80);
    doc.text('Extracted Clauses', 14, yPos);
    yPos += 10;

    const tableData = clauses.map((clause: any) => [
      clause.clause_name || 'Clause',
      clause.summary || '',
      clause.risk_level || 'Low',
      `${clause.confidence_percentage || 0}%`
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['Name', 'Summary', 'Risk', 'Confidence']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185] },
      columnStyles: {
        0: { cellWidth: 35 },
        1: { cellWidth: 'auto' },
        2: { cellWidth: 20 },
        3: { cellWidth: 25 }
      }
    });

    doc.save(`Clause_Report_${documentName}.pdf`);
  };

  const handleShare = () => {
    const summaryText = `Clause Analysis for ${documentName}:
Total Clauses: ${totalClauses}
Risk Level: ${riskLevel}
Risk Score: ${riskScore}/100
Confidence: ${confidenceScore}%`;
    navigator.clipboard.writeText(summaryText);
    alert("Analysis summary copied to clipboard!");
  };

  if (isFetching || isProcessing) {
    return (
      <MainLayout backgroundColor="bg-white">
        <div className="max-w-6xl mx-auto py-12">
          <AgentLoadingState
            agentName="Clause Extraction"
            message={isProcessing ? "Analyzing document structure and extracting clauses..." : "Loading analysis results..."}
          />
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout backgroundColor="bg-white">
        <div className="max-w-6xl mx-auto py-12">
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
              agentName="Clause Extraction"
            />
          </motion.div>
        </div>
      </MainLayout>
    );
  }

  if (!analysisResult) {
    return (
      <MainLayout backgroundColor="bg-white">
        <div className="max-w-6xl mx-auto py-12">
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
              agentName="Clause Extraction"
              onProcess={processDocument}
              loading={isProcessing}
            />
          </motion.div>
        </div>
      </MainLayout>
    );
  }

  // Check for non-legal document
  if (analysisResult.is_legal_document === false) {
    return (
      <MainLayout backgroundColor="bg-white">
        <div className="max-w-6xl mx-auto py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <button onClick={() => navigate('/agent-selection')} className="mb-6 flex items-center text-blue-600 hover:text-blue-700 transition-colors">
              <ArrowLeftIcon size={20} className="mr-2" />
              Back to Agent Selection
            </button>

            <div className="bg-white border border-red-200 rounded-lg shadow-sm p-8 text-center">
              <div className="inline-flex items-center justify-center p-4 bg-red-100 rounded-full mb-6">
                <AlertCircleIcon size={48} className="text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Non-Legal Document Detected</h2>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                The uploaded document appears to be a <strong>{analysisResult.document_type?.replace(/_/g, ' ')}</strong> rather than a legal contract.
              </p>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 max-w-3xl mx-auto text-left mb-8">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3">Document Summary</h3>
                <p className="text-gray-700 leading-relaxed">
                  {analysisResult.summary}
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

  return (
    <MainLayout backgroundColor="bg-white">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <button onClick={() => navigate('/agent-selection')} className="mb-6 flex items-center text-blue-600 hover:text-blue-700 transition-colors">
            <ArrowLeftIcon size={20} className="mr-2" />
            Back to Agent Selection
          </button>

          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-blue-100 border border-blue-300 mr-4">
                <FileTextIcon size={32} className="text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Clause Extraction Report</h1>
                <p className="text-gray-600">{documentName} <span className="ml-2 px-2 py-1 bg-gray-100 rounded text-xs text-gray-500">Processed</span></p>
              </div>
            </div>
            <div className="flex space-x-3">
              <button onClick={handleShare} className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium">
                <ShareIcon size={18} className="mr-2" />
                Share
              </button>
              <button onClick={handleDownload} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                <DownloadIcon size={18} className="mr-2" />
                Download Report (PDF)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600 text-sm">Total Clauses</span>
                <FileTextIcon size={20} className="text-blue-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{totalClauses}</p>
              <p className="text-xs text-gray-500 mt-1">Identified Sections</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600 text-sm">Risk Score</span>
                <AlertCircleIcon size={20} className={riskScore > 50 ? "text-red-600" : "text-yellow-600"} />
              </div>
              <p className="text-3xl font-bold text-gray-900">{riskScore}/100</p>
              <p className="text-xs text-gray-500 mt-1">Level: {riskLevel}</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600 text-sm">Confidence</span>
                <ShieldCheckIcon size={20} className="text-green-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{confidenceScore}%</p>
              <p className="text-xs text-gray-500 mt-1">AI Accuracy Score</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600 text-sm">Status</span>
                <ClockIcon size={20} className="text-purple-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900">Complete</p>
              <p className="text-xs text-gray-500 mt-1">Model: {analysisResult?.model_used || 'Gemini Pro'}</p>
            </div>
          </div>

          {/* Executive Summary & Tags */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Executive Summary</h2>
              <p className="text-gray-700 leading-relaxed">
                {summary || 'No summary available for this clause extraction.'}
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <TagIcon size={20} className="text-blue-500 mr-2" />
                Categories & Tags
              </h2>
              <div className="flex flex-wrap gap-2 mb-4">
                {categories.map((cat: string, idx: number) => (
                  <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                    {cat}
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag: string, idx: number) => (
                  <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Detailed Analysis Section */}
          {Object.keys(detailedAnalysis).length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {detailedAnalysis.financial_summary && (
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <DownloadIcon size={20} className="text-green-600 mr-2" />
                    Financial Summary
                  </h3>
                  <div className="space-y-3">
                    {Object.entries(detailedAnalysis.financial_summary).map(([key, value]: [string, any]) => (
                      <div key={key} className="flex justify-between text-sm">
                        <span className="text-gray-500 capitalize">{key.replace(/_/g, ' ')}</span>
                        <span className="font-semibold text-gray-900">
                          {typeof value === 'number' ? `$${value.toLocaleString()}` : value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {detailedAnalysis.dates && (
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <TagIcon size={20} className="text-blue-600 mr-2" />
                    Key Dates
                  </h3>
                  <div className="space-y-3">
                    {Object.entries(detailedAnalysis.dates).map(([key, value]: [string, any]) => (
                      <div key={key} className="flex justify-between text-sm">
                        <span className="text-gray-500 capitalize">{key.replace(/_/g, ' ')}</span>
                        <span className="font-semibold text-gray-900">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-900">Extracted Clauses</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {clauses.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  No clauses found in this document.
                </div>
              ) : (
                clauses.map((clause: any, index: number) => (
                  <div key={index} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center">
                        <TagIcon size={16} className="text-gray-400 mr-2" />
                        <span className="font-medium text-gray-900 mr-3">{clause.clause_name || 'Clause'}</span>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getRiskColor(clause.risk_level)}`}>
                          {clause.risk_level || 'Low'} Risk
                        </span>
                      </div>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        Confidence: {clause.confidence_percentage || 0}%
                      </span>
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed mb-3 bg-gray-50 p-3 rounded border border-gray-100">
                      {clause.summary}
                    </p>
                    {clause.risk_description && (
                      <div className="flex items-start text-sm text-gray-600 mt-2">
                        <AlertCircleIcon size={16} className="text-orange-500 mr-2 mt-0.5" />
                        <div>
                          <span className="font-medium mr-1">Risk Analysis:</span>
                          {clause.risk_description}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </MainLayout>
  );
}