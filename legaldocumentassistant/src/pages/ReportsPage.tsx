import React, { useState, useEffect } from 'react';
import { Calendar, Download, Eye, RefreshCw, AlertCircle, BarChart3, TrendingUp, Brain } from 'lucide-react';
import { MainLayout } from '../components/layout/MainLayout';
import { HelpBotWidget } from '../components/common/HelpBotWidget';
import { apiClient, apiCall } from '../services/api';

interface Report {
  id: number;
  document_id: number;
  document_name: string;
  overall_risk_score: number;
  risk_level: string;
  status: string;
  created_at: string;
  summary: {
    total_risks: number;
    critical_risks: number;
    high_risks: number;
    medium_risks: number;
    low_risks: number;
    legal_threats: number;
    time_risks: number;
    complex_sentences: number;
    contract_dates: number;
    alternative_suggestions: number;
    tasks_completed: number;
  };
  analysis_metadata: {
    total_words: number;
    confidence: number;
    ai_model: string;
    version: string;
    analysis_system: string;
  };
}

const ReportsPage: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchReports = async () => {
    try {
      const response = await apiCall<{ reports: Report[] }>(() =>
        apiClient.get<{ reports: Report[] }>('/documents/reports')
      );

      // The API returns { data: { reports: [...] } } but apiCall extracts data.
      // However, our backend structure for this endpoint returns { success: true, data: { reports: [...] } }
      // So response here is { reports: [...] }

      if (response && response.reports) {
        setReports(response.reports);
        setError(null);
      } else {
        setReports([]);
      }
    } catch (err: any) {
      console.error('Error fetching reports:', err);
      setError(err.message || 'Failed to fetch reports');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchReports();
  };

  const handleDownloadReport = async (analysisId: number, documentName: string) => {
    try {
      // We need to handle the blob download manually as apiClient expects JSON by default
      const token = localStorage.getItem('deeplex_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/risk-detection/download-report-excel/${analysisId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = window.document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        const safeName = documentName.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_-]/g, '');
        a.download = `Risk_Report_${safeName}.xlsx`;
        window.document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        window.document.body.removeChild(a);
      } else {
        alert('Failed to download Excel report. Please try again.');
      }
    } catch (err) {
      console.error('Error downloading report:', err);
      alert('Network error occurred while downloading report.');
    }
  };

  const handleViewReport = (report: Report) => {
    // Open detailed report view in a new window
    const newWindow = window.open('', '_blank', 'width=900,height=800');
    if (newWindow) {
      newWindow.document.write(`
        <html>
          <head>
            <title>Risk Analysis Report - ${report.document_name}</title>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
            <style>
              :root {
                --primary: #2563eb;
                --success: #16a34a;
                --warning: #d97706;
                --danger: #dc2626;
                --gray-50: #f9fafb;
                --gray-100: #f3f4f6;
                --gray-200: #e5e7eb;
                --gray-800: #1f2937;
                --gray-900: #111827;
              }
              body { 
                font-family: 'Inter', sans-serif; 
                padding: 40px; 
                line-height: 1.6; 
                color: var(--gray-800);
                max-width: 1000px;
                margin: 0 auto;
                background-color: #fff;
              }
              .header { 
                border-bottom: 1px solid var(--gray-200); 
                padding-bottom: 24px; 
                margin-bottom: 32px; 
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
              }
              .header-content h1 { margin: 0 0 8px 0; font-size: 24px; color: var(--gray-900); }
              .header-content h2 { margin: 0; font-size: 16px; color: #6b7280; font-weight: 500; }
              .risk-badge {
                padding: 8px 16px;
                border-radius: 9999px;
                font-weight: 600;
                font-size: 14px;
                text-transform: uppercase;
                background-color: ${getRiskBadgeColor(report.risk_level).split(' ')[0].replace('bg-', '#').replace('-100', 'e0')};
                color: ${getRiskColor(report.risk_level)};
              }
              .score-card {
                background: var(--gray-50);
                padding: 24px;
                border-radius: 12px;
                margin-bottom: 32px;
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 24px;
                border: 1px solid var(--gray-200);
              }
              .score-item { text-align: center; }
              .score-item .label { font-size: 14px; color: #6b7280; margin-bottom: 4px; }
              .score-item .value { font-size: 24px; font-weight: 700; color: var(--gray-900); }
              
              .section-title { font-size: 18px; font-weight: 600; margin: 0 0 16px 0; color: var(--gray-900); }
              
              .summary-grid { 
                display: grid; 
                grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); 
                gap: 16px; 
                margin-bottom: 32px; 
              }
              .summary-item { 
                background: white; 
                padding: 16px; 
                border-radius: 8px; 
                border: 1px solid var(--gray-200);
                box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
              }
              .summary-item h4 { margin: 0 0 4px 0; font-size: 14px; color: #6b7280; font-weight: 500; }
              .summary-item p { margin: 0; font-size: 20px; font-weight: 600; color: var(--gray-900); }
              
              .ai-metadata { 
                background: #eff6ff; 
                padding: 20px; 
                border-radius: 12px; 
                border: 1px solid #bfdbfe;
              }
              .ai-metadata-grid {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 16px;
              }
              .meta-row { display: flex; justify-content: space-between; border-bottom: 1px solid rgba(0,0,0,0.05); padding: 8px 0; }
              .meta-row:last-child { border-bottom: none; }
              .meta-label { color: #1e40af; font-weight: 500; }
              .meta-value { color: #1e3a8a; font-family: monospace; }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="header-content">
                <h1>Risk Analysis Report</h1>
                <h2>${report.document_name}</h2>
                <p style="margin: 8px 0 0 0; font-size: 14px; color: #9ca3af;">Generated: ${new Date(report.created_at).toLocaleString()}</p>
              </div>
              <div class="risk-badge">
                ${report.risk_level} RISK
              </div>
            </div>
            
            <div class="score-card">
              <div class="score-item">
                <div class="label">Overall Risk Score</div>
                <div class="value" style="color: ${getRiskColor(report.risk_level)}">${report.overall_risk_score.toFixed(1)}%</div>
              </div>
              <div class="score-item">
                <div class="label">Total Issues Found</div>
                <div class="value">${report.summary.total_risks}</div>
              </div>
              <div class="score-item">
                <div class="label">AI Confidence</div>
                <div class="value">${(report.analysis_metadata.confidence * 100).toFixed(1)}%</div>
              </div>
            </div>
            
            <div class="section-title">Risk Breakdown</div>
            <div class="summary-grid">
              <div class="summary-item" style="border-left: 4px solid #dc2626;">
                <h4>Critical Risks</h4>
                <p>${report.summary.critical_risks}</p>
              </div>
              <div class="summary-item" style="border-left: 4px solid #ea580c;">
                <h4>High Risks</h4>
                <p>${report.summary.high_risks}</p>
              </div>
              <div class="summary-item" style="border-left: 4px solid #d97706;">
                <h4>Medium Risks</h4>
                <p>${report.summary.medium_risks}</p>
              </div>
              <div class="summary-item" style="border-left: 4px solid #16a34a;">
                <h4>Low Risks</h4>
                <p>${report.summary.low_risks}</p>
              </div>
            </div>
            
            <div class="section-title">Detailed Metrics</div>
            <div class="summary-grid">
              <div class="summary-item">
                <h4>Legal Threats</h4>
                <p>${report.summary.legal_threats}</p>
              </div>
              <div class="summary-item">
                <h4>Time Risks</h4>
                <p>${report.summary.time_risks}</p>
              </div>
              <div class="summary-item">
                <h4>Complex Sentences</h4>
                <p>${report.summary.complex_sentences}</p>
              </div>
              <div class="summary-item">
                <h4>Missing Dates</h4>
                <p>${report.summary.contract_dates}</p>
              </div>
            </div>
            
            <div class="section-title">AI Analysis Metadata</div>
            <div class="ai-metadata">
              <div class="ai-metadata-grid">
                <div class="meta-row">
                  <span class="meta-label">AI Model Used</span>
                  <span class="meta-value">${report.analysis_metadata.ai_model}</span>
                </div>
                <div class="meta-row">
                  <span class="meta-label">Analysis System</span>
                  <span class="meta-value">${report.analysis_metadata.analysis_system}</span>
                </div>
                <div class="meta-row">
                  <span class="meta-label">Confidence Score</span>
                  <span class="meta-value">${(report.analysis_metadata.confidence * 100).toFixed(1)}%</span>
                </div>
                <div class="meta-row">
                  <span class="meta-label">Analysis Version</span>
                  <span class="meta-value">${report.analysis_metadata.version}</span>
                </div>
              </div>
            </div>
          </body>
        </html>
      `);
    }
  };

  useEffect(() => {
    fetchReports();

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchReports, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString();
  };

  const getRiskColor = (riskLevel: string): string => {
    switch (riskLevel?.toLowerCase()) {
      case 'critical': return '#dc2626';
      case 'high': return '#ea580c';
      case 'medium': return '#d97706';
      case 'low': return '#16a34a';
      default: return '#6b7280';
    }
  };

  const getRiskBadgeColor = (riskLevel: string): string => {
    switch (riskLevel?.toLowerCase()) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <MainLayout backgroundColor="bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Risk Analysis Reports</h1>
            <p className="mt-2 text-gray-600">View detailed risk analysis reports for your documents</p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
              <span className="text-red-800">{error}</span>
            </div>
          </div>
        )}

        {reports.length === 0 ? (
          <div className="text-center py-12">
            <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No reports available</h3>
            <p className="mt-1 text-sm text-gray-500">Upload and analyze documents to generate reports</p>
          </div>
        ) : (
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">
                Analysis Reports ({reports.length})
              </h2>
            </div>
            <div className="divide-y divide-gray-200">
              {reports.map((report) => (
                <div key={report.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <BarChart3 className="h-8 w-8 text-blue-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {report.document_name}
                        </p>
                        <div className="flex items-center space-x-4 mt-1">
                          <p className="text-sm text-gray-500 flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {formatDate(report.created_at)}
                          </p>
                          <p className="text-sm text-gray-500 flex items-center">
                            <TrendingUp className="h-4 w-4 mr-1" />
                            {report.summary.total_risks} risks found
                          </p>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${report.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                            {report.status}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          Risk Score: {report.overall_risk_score.toFixed(1)}%
                        </p>
                        <div className="flex items-center justify-end space-x-2 mt-1">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRiskBadgeColor(report.risk_level)}`}>
                            {report.risk_level.toUpperCase()}
                          </span>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100" title={`Model: ${report.analysis_metadata.ai_model}`}>
                            <Brain className="w-3 h-3 mr-1" />
                            {report.analysis_metadata.ai_model.replace('gemini-', '').replace('models/', '')}
                          </span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewReport(report)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="View Report"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDownloadReport(report.id, report.document_name)}
                          className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg"
                          title="Download Excel Report"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <HelpBotWidget />
    </MainLayout>
  );
};

export { ReportsPage };