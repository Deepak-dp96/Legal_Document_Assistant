import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MainLayout } from '../../components/layout/MainLayout';
import { PenToolIcon, ArrowLeftIcon, DownloadIcon, ShareIcon, ClockIcon, CheckCircleIcon, FileTextIcon, AlertCircleIcon, ShieldCheckIcon, AlertTriangleIcon, TagIcon } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { draftService } from '../../services/draftService';
import { AgentAnalysis } from '../../types/report';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useAgentProcessing } from '../../hooks/useAgentProcessing';
import { AgentErrorState, AgentLoadingState, AgentNoDataState } from '../../components/common/AgentStates';

export function DraftingAgentPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const documentId = location.state?.documentId || localStorage.getItem('draft_document_id') || localStorage.getItem('uploaded_document_id');
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
    agentType: 'draft',
    autoFetch: true
  });

  // Extract data from analysis results
  // The backend might return AgentAnalysis directly or wrapped in AnalysisResult
  const effectiveAnalysis = (analysisResult as any)?.response || analysisResult;

  const detailed = effectiveAnalysis?.detailed_analysis || {};
  const keyInsights = effectiveAnalysis?.key_insights || [];
  const tags = effectiveAnalysis?.tags || [];
  const categories = effectiveAnalysis?.categories || [];
  const summary = effectiveAnalysis?.summary || '';

  const improvements = effectiveAnalysis?.ai_suggestions?.map((rec: any, index: number) => ({
    id: index,
    section: rec.issue || 'General',
    original: rec.location || '(Location not provided)',
    improved: rec.suggested_change,
    reasoning: rec.issue || 'To improve clarity and legal protection.',
    impact: 'medium', // Default
    confidence: 95
  })) || [];

  const stats = {
    totalIssues: detailed.total_issues_found || 0,
    criticalIssues: detailed.critical_issues || 0,
    riskScore: effectiveAnalysis?.risk_percentage || 0,
    confidenceScore: effectiveAnalysis?.confidence_percentage || 0,
    docType: effectiveAnalysis?.document_type?.replace(/_/g, ' ').toUpperCase() || 'UNKNOWN',
    docConfidence: effectiveAnalysis?.confidence_percentage || 0
  };

  const handleDownloadDraft = async () => {
    try {
      // Pass the full analysis result as expected by the backend
      // We might need to reconstruct the structure if backend expects specific keys
      // But for now let's pass detailed_analysis
      const blob = await draftService.generateCleanDraft(documentName, detailed);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Improved_${documentName}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Download failed", error);
      alert("Failed to download draft. Please try again.");
    }
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Title
    doc.setFontSize(20);
    doc.setTextColor(44, 62, 80);
    doc.text('Drafting Analysis Report', pageWidth / 2, 20, { align: 'center' });

    // Document Info
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(`Document: ${documentName}`, 20, 35);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 42);
    doc.text(`Risk Score: ${stats.riskScore}/100`, 20, 49);
    doc.text(`Confidence Score: ${stats.confidenceScore}%`, 20, 56);

    let yPos = 70;

    // Summary
    if (summary) {
      doc.setFontSize(14);
      doc.setTextColor(44, 62, 80);
      doc.text('Executive Summary', 20, yPos);
      yPos += 10;
      doc.setFontSize(10);
      doc.setTextColor(0);
      const splitSummary = doc.splitTextToSize(summary, pageWidth - 40);
      doc.text(splitSummary, 20, yPos);
      yPos += splitSummary.length * 5 + 10;
    }

    // Key Findings
    if (keyInsights.length > 0) {
      if (yPos > 250) { doc.addPage(); yPos = 20; }
      doc.setFontSize(14);
      doc.setTextColor(44, 62, 80);
      doc.text('Key Findings', 20, yPos);
      yPos += 10;

      keyInsights.forEach((insight: string) => {
        const splitInsight = doc.splitTextToSize(`• ${insight}`, pageWidth - 45);
        doc.text(splitInsight, 25, yPos);
        yPos += splitInsight.length * 5 + 2;
      });
      yPos += 10;
    }

    // Improvements
    doc.setFontSize(14);
    doc.setTextColor(44, 62, 80);
    doc.text('Suggested Improvements', 20, yPos);
    yPos += 10;

    const improvementData = improvements.map((item: any) => [
      item.section,
      item.impact.toUpperCase(),
      item.improved,
      item.reasoning
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['Issue', 'Impact', 'Suggestion', 'Details']],
      body: improvementData,
      theme: 'grid',
      headStyles: { fillColor: [142, 68, 173] },
      columnStyles: {
        0: { cellWidth: 35 },
        1: { cellWidth: 20 },
        2: { cellWidth: 60 },
        3: { cellWidth: 'auto' }
      }
    });

    doc.save(`Draft_Analysis_${documentName}.pdf`);
  };

  const handleShare = () => {
    const summaryText = `Draft Analysis for ${documentName}:
Risk Level: ${stats.riskScore >= 80 ? 'Critical' : stats.riskScore >= 60 ? 'High' : 'Medium'}
Score: ${stats.riskScore}/100
Confidence: ${stats.confidenceScore}%
Improvements: ${improvements.length} suggested`;
    navigator.clipboard.writeText(summaryText);
    alert("Analysis summary copied to clipboard!");
  };

  if (isFetching || isProcessing) {
    return (
      <MainLayout backgroundColor="bg-white">
        <div className="max-w-6xl mx-auto py-12">
          <AgentLoadingState
            agentName="Drafting Agent"
            message={isProcessing ? "Analyzing and improving contract language..." : "Loading analysis results..."}
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
              agentName="Drafting Agent"
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
              agentName="Drafting Agent"
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
                <PenToolIcon size={48} className="text-red-600" />
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

  return <MainLayout backgroundColor="bg-white">
    <div className="max-w-7xl mx-auto">
      <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.5
      }}>
        <button onClick={() => navigate('/agent-selection')} className="mb-6 flex items-center text-blue-600 hover:text-blue-700 transition-colors">
          <ArrowLeftIcon size={20} className="mr-2" />
          Back to Agent Selection
        </button>

        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-purple-100 border border-purple-300 mr-4">
              <PenToolIcon size={32} className="text-purple-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Drafting Improvements Report
              </h1>
              <p className="text-gray-600">
                {documentName} <span className="ml-2 px-2 py-1 bg-gray-100 rounded text-xs text-gray-500">{stats.docType} ({stats.docConfidence}%)</span>
              </p>
            </div>
          </div>
          <div className="flex space-x-3">
            <button onClick={handleShare} className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium">
              <ShareIcon size={18} className="mr-2" />
              Share
            </button>
            <button onClick={handleDownloadDraft} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
              <DownloadIcon size={18} className="mr-2" />
              Download Draft (DOCX)
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
              <span className="text-gray-600 text-sm">Critical Issues</span>
              <AlertCircleIcon size={20} className="text-red-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {stats.criticalIssues}
            </p>
            <p className="text-xs text-gray-500 mt-1">Total Found: {stats.totalIssues}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">Risk Score</span>
              <AlertTriangleIcon size={20} className={stats.riskScore > 50 ? "text-red-600" : "text-yellow-600"} />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {stats.riskScore}/100
            </p>
            <p className="text-xs text-gray-500 mt-1">Level: {stats.riskScore >= 80 ? 'CRITICAL' : stats.riskScore >= 60 ? 'HIGH' : 'MEDIUM'}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">Compliance Score</span>
              <ShieldCheckIcon size={20} className="text-green-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {stats.confidenceScore}%
            </p>
            <p className="text-xs text-gray-500 mt-1">Status: {stats.confidenceScore >= 80 ? 'Compliant' : 'Non-Compliant'}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">Processing Time</span>
              <ClockIcon size={20} className="text-purple-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {analysisResult?.model_used ? 'AI' : 'N/A'}
            </p>
            <p className="text-xs text-gray-500 mt-1">Model: {analysisResult?.model_used || 'Unknown'}</p>
          </div>
        </div>

        {/* Executive Summary & Tags */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Executive Summary</h2>
            <p className="text-gray-700 leading-relaxed">
              {summary || 'No summary available for this draft analysis.'}
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Improvements */}
          <div className="lg:col-span-2 space-y-8">
            {/* Improvements */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Suggested Improvements
              </h2>
              {improvements.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No specific improvements suggested for this document.</p>
              ) : (
                <div className="space-y-6">
                  {improvements.map((item: any, index: number) => <motion.div key={item.id} initial={{
                    opacity: 0,
                    y: 20
                  }} animate={{
                    opacity: 1,
                    y: 0
                  }} transition={{
                    duration: 0.5,
                    delay: index * 0.1
                  }} className="bg-gray-50 border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full border border-purple-300">
                            {item.section}
                          </span>
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${item.impact === 'high' ? 'bg-red-100 text-red-700 border border-red-300' : 'bg-yellow-100 text-yellow-700 border border-yellow-300'}`}>
                            {item.impact ? item.impact.toUpperCase() : 'MEDIUM'} IMPACT
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {item.improved && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <p className="text-xs font-semibold text-blue-700 mb-2">
                            SUGGESTION
                          </p>
                          <p className="text-gray-900 font-medium leading-relaxed">
                            {item.improved}
                          </p>
                        </div>
                      )}

                      <div className="bg-gray-100 border border-gray-200 rounded-lg p-4">
                        <p className="text-xs font-semibold text-gray-600 mb-2">
                          DETAILS
                        </p>
                        <p className="text-gray-700 text-sm">{item.reasoning}</p>
                      </div>
                    </div>
                  </motion.div>)}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Missing Clauses & Compliance */}
          <div className="space-y-8">
            {/* Key Insights */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <ShieldCheckIcon size={20} className="text-blue-500 mr-2" />
                Key Findings
              </h3>
              <div className="space-y-4">
                {keyInsights.map((insight: string, idx: number) => (
                  <div key={idx} className="flex items-start text-sm text-gray-700">
                    <span className="mr-2 text-blue-500 font-bold">•</span>
                    {insight}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  </MainLayout>;
}