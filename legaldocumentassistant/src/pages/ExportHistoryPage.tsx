import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MainLayout } from '../components/layout/MainLayout';
import { HelpBotWidget } from '../components/common/HelpBotWidget';
import { useNavigate } from 'react-router-dom';
import { DownloadIcon, FileTextIcon, CalendarIcon, CheckCircleIcon, ClockIcon, XCircleIcon, ArrowLeftIcon } from 'lucide-react';
export function ExportHistoryPage() {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch export history from backend
  React.useEffect(() => {
    const fetchExportHistory = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/documents/export-history`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        const data = await response.json();
        if (data.success) {
          // data.data.exports contains both documents and reports
          setDocuments(data.data.exports || []);
          setReports([]);
        } else {
          setDocuments([]);
          setReports([]);
        }
      } catch (error) {
        console.error('Error fetching export history:', error);
        setDocuments([]);
        setReports([]);
      } finally {
        setLoading(false);
      }
    };

    fetchExportHistory();
  }, [navigate]);

  const exports = documents.map(item => ({
    id: item.id,
    fileName: item.document_name,
    originalDocument: item.document_name,
    agent: item.export_type,
    exportDate: new Date(item.export_date).toLocaleDateString(),
    status: item.status,
    fileSize: item.size ? (item.size / 1024).toFixed(1) + ' KB' : 'N/A',
    format: item.file_format,
    type: item.type, // 'document' or 'report'
    riskScore: item.risk_level
  }));

  const stats = {
    total: exports.length,
    completed: exports.filter(e => e.status === 'completed').length,
    processing: exports.filter(e => e.status === 'processing').length,
    failed: exports.filter(e => e.status === 'failed').length
  };

  const handleDownload = async (exportItem: any) => {
    try {
      const token = localStorage.getItem('token');
      // Use different endpoints for documents vs reports
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const url = exportItem.type === 'report'
        ? `${baseUrl}/risk-detection/download-report-excel/${exportItem.id}`
        : `${baseUrl}/documents/${exportItem.id.replace('doc_', '')}/download`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = window.document.createElement('a');
        a.style.display = 'none';
        a.href = downloadUrl;

        // Ensure correct filename extension
        let downloadName = exportItem.fileName;
        if (exportItem.type === 'report' && !downloadName.toLowerCase().endsWith('.xlsx')) {
          downloadName = `Risk_Report_${downloadName.replace(/\s+/g, '_')}.xlsx`;
        }

        a.download = downloadName;
        window.document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(downloadUrl);
        window.document.body.removeChild(a);
      } else {
        alert('Failed to download file. Please try again.');
      }
    } catch (error) {
      console.error('Download error:', error);
      alert('Error downloading file. Please try again.');
    }
  };
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon size={20} className="text-green-600" />;
      case 'processing':
        return <ClockIcon size={20} className="text-blue-600" />;
      case 'failed':
        return <XCircleIcon size={20} className="text-red-600" />;
      default:
        return null;
    }
  };
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700 border border-green-300">
          Completed
        </span>;
      case 'processing':
        return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700 border border-blue-300">
          Processing
        </span>;
      case 'failed':
        return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-700 border border-red-300">
          Failed
        </span>;
      default:
        return null;
    }
  };
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
        {/* Back Button */}
        <button onClick={() => navigate('/dashboard')} className="mb-6 flex items-center text-blue-600 hover:text-blue-700 transition-colors">
          <ArrowLeftIcon size={20} className="mr-2" />
          Back to Dashboard
        </button>

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Export History
          </h1>
          <p className="text-gray-600 text-lg">
            View and download all your exported reports
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">Total Exports</span>
              <FileTextIcon size={20} className="text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">Completed</span>
              <CheckCircleIcon size={20} className="text-green-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {stats.completed}
            </p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">Processing</span>
              <ClockIcon size={20} className="text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {stats.processing}
            </p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">Failed</span>
              <XCircleIcon size={20} className="text-red-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.failed}</p>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-8 h-8 animate-spin mx-auto mb-4 border-4 border-blue-600 border-t-transparent rounded-full"></div>
              <p className="text-gray-600">Loading export history...</p>
            </div>
          </div>
        )}

        {/* Export History List */}
        {!loading && (
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Export History
              </h2>
              <div className="flex space-x-4 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded"></div>
                  <span>Documents ({documents.length})</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded"></div>
                  <span>Reports ({reports.length})</span>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              {exports.map((exportItem, index) => <motion.div key={exportItem.id} initial={{
                opacity: 0,
                y: 20
              }} animate={{
                opacity: 1,
                y: 0
              }} transition={{
                duration: 0.5,
                delay: index * 0.05
              }} className="bg-gray-50 border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      {getStatusIcon(exportItem.status)}
                      <div className={`w-3 h-3 rounded ${exportItem.type === 'report' ? 'bg-red-500' : 'bg-blue-500'}`}></div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {exportItem.fileName}
                      </h3>
                      {getStatusBadge(exportItem.status)}
                      <span className={`px-2 py-1 text-xs font-medium rounded ${exportItem.type === 'report' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                        {exportItem.type === 'report' ? 'Report' : 'Document'}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500 mb-1">
                          Original Document
                        </p>
                        <p className="text-gray-900">
                          {exportItem.originalDocument}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 mb-1">Agent Used</p>
                        <p className="text-gray-900">{exportItem.agent}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 mb-1">Export Date</p>
                        <p className="text-gray-900 flex items-center">
                          <CalendarIcon size={14} className="mr-1" />
                          {exportItem.exportDate}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 mb-1">File Size</p>
                        <p className="text-gray-900">
                          {exportItem.fileSize} • {exportItem.format}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="ml-4">
                    {exportItem.status === 'completed' && <button onClick={() => handleDownload(exportItem)} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm">
                      <DownloadIcon size={16} className="mr-2" />
                      Download
                    </button>}
                    {exportItem.status === 'processing' && <button disabled className="flex items-center px-4 py-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed font-medium text-sm">
                      <ClockIcon size={16} className="mr-2" />
                      Processing
                    </button>}
                    {exportItem.status === 'failed' && <button className="flex items-center px-4 py-2 bg-red-100 text-red-700 border border-red-300 rounded-lg hover:bg-red-200 transition-colors font-medium text-sm">
                      <XCircleIcon size={16} className="mr-2" />
                      Retry
                    </button>}
                  </div>
                </div>
              </motion.div>)}
            </div>
          </div>
        )}

        {!loading && exports.length === 0 && (
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-12 text-center">
            <FileTextIcon size={48} className="text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No exports found
            </h3>
            <p className="text-gray-600">
              Your exported documents and reports will appear here
            </p>
          </div>
        )}
      </motion.div>
    </div>
    <HelpBotWidget />
  </MainLayout>;
}