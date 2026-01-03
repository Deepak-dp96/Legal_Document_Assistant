import { useState } from 'react';
import { motion } from 'framer-motion';
import { MainLayout } from '../../components/layout/MainLayout';
import { BookOpenIcon, ArrowLeftIcon, DownloadIcon, ShareIcon, CheckCircleIcon, FileTextIcon, CalendarIcon, UsersIcon, ScaleIcon, InfoIcon, TagIcon, ShieldCheckIcon } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useAgentProcessing } from '../../hooks/useAgentProcessing';
import { AgentErrorState, AgentLoadingState, AgentNoDataState } from '../../components/common/AgentStates';

export function SummaryAgentPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const documentId = location.state?.documentId || localStorage.getItem('summary_document_id') || localStorage.getItem('uploaded_document_id');
  const documentName = location.state?.documentName || localStorage.getItem('uploaded_file_name') || 'Document';

  // Use the new hook for agent processing
  const {
    data: analysisResults,
    error,
    loading: isFetching,
    processing: isProcessing,
    retryCount,
    processDocument,
    retryProcessing
  } = useAgentProcessing({
    documentId,
    agentType: 'summary',
    autoFetch: true
  });

  // Helper to safely get string from potentially nested or object-wrapped data
  const getSafeString = (data: any, fallback: string = ''): string => {
    if (!data) return fallback;
    if (typeof data === 'string') return data;
    if (typeof data === 'object') {
      // Try common keys if it's an object
      return data.summary || data.executiveSummary || data.text || data.content || fallback;
    }
    return String(data);
  };

  // Adapt new data structure to component needs
  // The backend might return AgentAnalysis directly or wrapped in AnalysisResult
  const effectiveAnalysis = (analysisResults as any)?.response || analysisResults;

  const summaryData = {
    executiveSummary: getSafeString(effectiveAnalysis?.summary || (effectiveAnalysis as any)?.executiveSummary),
    keyHighlights: effectiveAnalysis?.key_insights || (effectiveAnalysis as any)?.keyHighlights || [],
    purpose: getSafeString(effectiveAnalysis?.document_type || (effectiveAnalysis as any)?.purpose || 'Legal Document'),
    documentType: getSafeString(effectiveAnalysis?.document_type || (effectiveAnalysis as any)?.documentType || 'Document'),
    tags: effectiveAnalysis?.tags || [],
    categories: effectiveAnalysis?.categories || [],
    aiSuggestions: effectiveAnalysis?.ai_suggestions || []
  };

  const detailed = effectiveAnalysis?.detailed_analysis || {};
  const parties = detailed.parties || detailed.parties_involved || [];
  const criticalDeadlines = detailed.critical_deadlines || [];

  const statsData = {
    wordCount: detailed.total_issues_found || 0,
    totalPages: 0, // Not available in new format
    partiesIdentified: Array.isArray(parties) ? parties.length : 0,
    obligationsFound: effectiveAnalysis?.key_insights?.length || 0,
    financialTerms: detailed.financial_terms ? Object.keys(detailed.financial_terms).length : 0,
    criticalDates: Array.isArray(detailed.key_dates) ? detailed.key_dates.length : 0,
    legalTermsExplained: effectiveAnalysis?.confidence_percentage || 0
  };

  // Helper to safely get array data
  const getArray = (data: any) => Array.isArray(data) ? data : [];

  const handleShare = () => {
    const text = `Summary for ${documentName}:
${summaryData.executiveSummary || 'No summary available.'}

Key Highlights:
${getArray(summaryData.keyHighlights).join('\n')}
`;
    navigator.clipboard.writeText(text);
    alert("Summary copied to clipboard!");
  };

  const handleDownload = () => {
    const text = `DOCUMENT SUMMARY REPORT
Document: ${documentName}
Date: ${new Date().toLocaleDateString()}

EXECUTIVE SUMMARY
${summaryData.executiveSummary || 'N/A'}

PURPOSE
${summaryData.purpose || 'N/A'}

KEY HIGHLIGHTS
${getArray(summaryData.keyHighlights).map((h: string) => `- ${h}`).join('\n')}

CRITICAL DATES
${getArray(detailed.key_dates).map((d: any) => `- ${d.event}: ${d.date}`).join('\n')}

FINANCIAL TERMS
${detailed.financial_terms ? Object.entries(detailed.financial_terms).map(([k, v]) => `- ${k}: ${v}`).join('\n') : 'None'}
`;

    const blob = new Blob([text], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Summary_${documentName}.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const handleDownloadPDF = () => {
    if (!documentId) return;
    // Use the backend endpoint for PDF generation if available, or fallback to client-side
    // For now, keeping client-side generation as it was implemented
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Title
    doc.setFontSize(20);
    doc.setTextColor(44, 62, 80);
    doc.text('Document Summary Report', pageWidth / 2, 20, { align: 'center' });

    // Document Info
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(`Document: ${documentName}`, 20, 35);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 42);
    doc.text(`Type: ${summaryData.documentType || 'Unknown'}`, 20, 49);
    doc.text(`Confidence: ${analysisResults?.confidence_percentage || 0}%`, 20, 56);

    let yPos = 70;

    // Executive Summary
    doc.setFontSize(14);
    doc.setTextColor(44, 62, 80);
    doc.text('Executive Summary', 20, yPos);
    yPos += 10;

    doc.setFontSize(10);
    doc.setTextColor(0);
    const splitSummary = doc.splitTextToSize(summaryData.executiveSummary || 'N/A', pageWidth - 40);
    doc.text(splitSummary, 20, yPos);
    yPos += splitSummary.length * 5 + 10;

    // Key Highlights
    doc.setFontSize(14);
    doc.setTextColor(44, 62, 80);
    doc.text('Key Highlights', 20, yPos);
    yPos += 10;

    doc.setFontSize(10);
    doc.setTextColor(0);
    getArray(summaryData.keyHighlights).forEach((highlight: string) => {
      const splitHighlight = doc.splitTextToSize(`• ${highlight}`, pageWidth - 45);
      doc.text(splitHighlight, 25, yPos);
      yPos += splitHighlight.length * 5 + 2;
    });
    yPos += 10;

    // Tags & Categories
    if (summaryData.tags.length > 0 || summaryData.categories.length > 0) {
      doc.setFontSize(14);
      doc.setTextColor(44, 62, 80);
      doc.text('Tags & Categories', 20, yPos);
      yPos += 10;
      doc.setFontSize(10);
      doc.setTextColor(100);
      const tagsText = [...summaryData.categories, ...summaryData.tags.map((t: string) => `#${t}`)].join(', ');
      const splitTags = doc.splitTextToSize(tagsText, pageWidth - 40);
      doc.text(splitTags, 20, yPos);
      yPos += splitTags.length * 5 + 10;
    }

    // Financial Terms
    const financialTerms = detailed.financial_terms;
    if (financialTerms && Object.keys(financialTerms).length > 0) {
      if (yPos > 250) { doc.addPage(); yPos = 20; }

      doc.setFontSize(14);
      doc.setTextColor(44, 62, 80);
      doc.text('Financial Terms', 20, yPos);
      yPos += 10;

      const financialData = Object.entries(financialTerms).map(([key, value]) => [
        key.replace(/_/g, ' ').toUpperCase(),
        String(value)
      ]);

      autoTable(doc, {
        startY: yPos,
        head: [['Term', 'Value']],
        body: financialData,
        theme: 'striped',
        headStyles: { fillColor: [41, 128, 185] }
      });

      // @ts-ignore
      yPos = doc.lastAutoTable.finalY + 20;
    }

    // Critical Dates Table
    const dates = getArray(detailed.key_dates);
    if (dates.length > 0) {
      if (yPos > 250) { doc.addPage(); yPos = 20; }

      doc.setFontSize(14);
      doc.setTextColor(44, 62, 80);
      doc.text('Critical Dates', 20, yPos);
      yPos += 10;

      const dateData = dates.map((d: any) => [
        d.event,
        d.date,
        'MEDIUM' // Default importance
      ]);

      autoTable(doc, {
        startY: yPos,
        head: [['Event', 'Date', 'Importance']],
        body: dateData,
        theme: 'striped',
        headStyles: { fillColor: [231, 76, 60] }
      });
    }

    doc.save(`Summary_Report_${documentName}.pdf`);
  };

  if (isFetching || isProcessing) {
    return (
      <MainLayout backgroundColor="bg-white">
        <div className="max-w-6xl mx-auto py-12">
          <AgentLoadingState
            agentName="Summary Agent"
            message={isProcessing ? "Analyzing and summarizing document..." : "Loading analysis results..."}
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
              agentName="Summary Agent"
            />
          </motion.div>
        </div>
      </MainLayout>
    );
  }

  if (!analysisResults) {
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
              agentName="Summary Agent"
              onProcess={processDocument}
              loading={isProcessing}
            />
          </motion.div>
        </div>
      </MainLayout>
    );
  }

  // Check for non-legal document
  if (analysisResults.is_legal_document === false) {
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
                <BookOpenIcon size={48} className="text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Non-Legal Document Detected</h2>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                The uploaded document appears to be a <strong>{analysisResults.document_type?.replace(/_/g, ' ')}</strong> rather than a legal contract.
              </p>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 max-w-3xl mx-auto text-left mb-8">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3">Document Summary</h3>
                <p className="text-gray-700 leading-relaxed">
                  {analysisResults.summary}
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

  return <MainLayout backgroundColor="bg-white">
    <div className="max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <button onClick={() => navigate('/agent-selection')} className="mb-6 flex items-center text-blue-600 hover:text-blue-700 transition-colors">
          <ArrowLeftIcon size={20} className="mr-2" />
          Back to Agent Selection
        </button>

        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-100 border border-green-300 mr-4">
              <BookOpenIcon size={32} className="text-green-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Document Summary Report</h1>
              <p className="text-gray-600">{documentName} <span className="ml-2 px-2 py-1 bg-gray-100 rounded text-xs text-gray-500">{summaryData.documentType || 'Document'}</span></p>
            </div>
          </div>
          <div className="flex space-x-3">
            <button onClick={handleShare} className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium">
              <ShareIcon size={18} className="mr-2" />
              Share
            </button>
            <button onClick={handleDownload} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
              <DownloadIcon size={18} className="mr-2" />
              Download Summary (TXT)
            </button>
            <button onClick={handleDownloadPDF} className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium">
              <FileTextIcon size={18} className="mr-2" />
              Download Report (PDF)
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">Confidence</span>
              <CheckCircleIcon size={20} className="text-green-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{statsData.legalTermsExplained}%</p>
            <p className="text-xs text-gray-500 mt-1">AI Confidence Score</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">Key Insights</span>
              <BookOpenIcon size={20} className="text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{statsData.obligationsFound || 0}</p>
            <p className="text-xs text-gray-500 mt-1">Major Findings</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">Critical Dates</span>
              <CalendarIcon size={20} className="text-purple-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{statsData.criticalDates || 0}</p>
            <p className="text-xs text-gray-500 mt-1">Important Deadlines</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">Financial Terms</span>
              <ScaleIcon size={20} className="text-yellow-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{statsData.financialTerms || 0}</p>
            <p className="text-xs text-gray-500 mt-1">Economic Clauses</p>
          </div>
        </div>

        {/* Executive Summary & Tags */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg shadow-sm p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Executive Summary</h2>
            <p className="text-gray-700 leading-relaxed text-lg">
              {summaryData.executiveSummary || 'No summary available.'}
            </p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <TagIcon size={20} className="text-blue-500 mr-2" />
              Categories & Tags
            </h2>
            <div className="flex flex-wrap gap-2 mb-4">
              {summaryData.categories.map((cat: string, idx: number) => (
                <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                  {cat}
                </span>
              ))}
            </div>
            <div className="flex flex-wrap gap-2 mb-6">
              {summaryData.tags.map((tag: string, idx: number) => (
                <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                  #{tag}
                </span>
              ))}
            </div>
            <div className="pt-4 border-t border-gray-100">
              <h3 className="text-sm font-bold text-gray-900 mb-2 flex items-center">
                <InfoIcon size={16} className="text-blue-600 mr-2" /> Document Purpose
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {summaryData.purpose || 'Purpose not identified.'}
              </p>
            </div>
          </div>
        </div>

        {/* Key Highlights */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Key Highlights</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {getArray(summaryData.keyHighlights).map((point: string, index: number) => (
              <motion.div key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: index * 0.1 }} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <CheckCircleIcon size={18} className="text-green-600 flex-shrink-0 mt-1" />
                  <p className="text-gray-700 text-sm">{point}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Financial Terms */}
        {detailed.financial_terms && Object.keys(detailed.financial_terms).length > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Financial Terms</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(detailed.financial_terms).map(([key, value], index) => (
                <div key={index} className="p-5 border border-gray-200 rounded-lg bg-green-50">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-lg text-gray-900 capitalize">{key.replace(/_/g, ' ')}</h3>
                  </div>
                  <p className="text-gray-700 mb-2">{String(value)}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Parties Involved */}
        {getArray(parties).length > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Parties Involved</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {getArray(parties).map((party: any, index: number) => (
                <div key={index} className="p-5 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-center space-x-3 mb-2">
                    <UsersIcon size={20} className="text-blue-600" />
                    <h3 className="font-bold text-lg text-gray-900">{party.name || party}</h3>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">{party.role || 'Party'}</p>
                  {party.obligations && getArray(party.obligations).length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Key Obligations</p>
                      <ul className="space-y-1">
                        {getArray(party.obligations).map((obl: string, idx: number) => (
                          <li key={idx} className="text-sm text-gray-700 flex items-start">
                            <span className="text-blue-500 mr-2">•</span>
                            {obl}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Critical Deadlines */}
        {getArray(criticalDeadlines).length > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Critical Deadlines</h2>
            <div className="space-y-3">
              {getArray(criticalDeadlines).map((deadline: string, index: number) => (
                <div key={index} className="flex items-start p-4 bg-red-50 border border-red-100 rounded-lg">
                  <CalendarIcon size={18} className="text-red-600 mt-0.5 mr-3 flex-shrink-0" />
                  <p className="text-red-800 font-medium">{deadline}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI Recommendations */}
        {getArray(summaryData.aiSuggestions).length > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">AI Recommendations</h2>
            <div className="space-y-4">
              {getArray(summaryData.aiSuggestions).map((suggestion: string, index: number) => (
                <div key={index} className="flex items-start p-4 bg-purple-50 border border-purple-100 rounded-lg">
                  <ShieldCheckIcon size={20} className="text-purple-600 mt-0.5 mr-3 flex-shrink-0" />
                  <p className="text-purple-800 leading-relaxed">{suggestion}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  </MainLayout>;
}