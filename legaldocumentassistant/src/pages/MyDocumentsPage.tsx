import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Calendar, Download, Eye, RefreshCw, AlertCircle, Search } from 'lucide-react';
import { MainLayout } from '../components/layout/MainLayout';
import { HelpBotWidget } from '../components/common/HelpBotWidget';
import { documentService, Document } from '../services/documentService';

const MyDocumentsPage: React.FC = () => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchMyDocuments = async () => {
    try {
      const response = await documentService.getDocuments();
      console.log("Documents fetched successfully", response.data);
      if (response.success && response.data) {
        setDocuments(response.data.documents);
        setError(null);
      } else {
        setDocuments([]);
        setError(response.message || 'Failed to fetch documents');
      }
    } catch (err: any) {
      console.error('Error fetching my documents:', err);
      setError(err.message || 'Failed to fetch documents');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchMyDocuments();
  };

  const handleViewDocument = async (documentId: string) => {
    try {
      // Use the new viewDocument service to open the actual file in browser
      await documentService.viewDocument(documentId);
    } catch (err: any) {
      console.error('Error viewing document:', err);
      alert('Error viewing document: ' + err.message);
    }
  };

  const handleDownloadDocument = async (documentId: string) => {
    try {
      await documentService.downloadDocument(documentId);
    } catch (err) {
      console.error('Error downloading document:', err);
      alert('Failed to download document');
    }
  };

  useEffect(() => {
    fetchMyDocuments();

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchMyDocuments, 30000);
    return () => clearInterval(interval);
  }, []);

  const filteredDocuments = Array.isArray(documents) ? documents.filter(doc =>
    (doc.originalName || doc.filename || '').toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  const formatFileSize = (bytes: number): string => {
    if (bytes === undefined || bytes === null || isNaN(bytes)) return 'Unknown Size';
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + (sizes[i] || 'Bytes');
  };

  const formatDate = (dateString: string): string => {
    try {
      if (!dateString) return 'Unknown Date';

      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      // Show relative time for recent dates
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
      if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays} days ago`;

      // For older dates, show formatted date
      const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      };

      return date.toLocaleDateString('en-US', options);
    } catch (e) {
      return 'Invalid Date';
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
            <h1 className="text-3xl font-bold text-gray-900">My Documents</h1>
            <p className="mt-2 text-gray-600">Manage and view all your uploaded documents</p>
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

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {filteredDocuments.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {searchTerm ? 'No documents found' : 'No documents uploaded'}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm ? 'Try adjusting your search terms' : 'Upload your first document to get started'}
            </p>
          </div>
        ) : (
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">
                Documents ({filteredDocuments.length})
              </h2>
            </div>
            <div className="divide-y divide-gray-200">
              {filteredDocuments.map((document) => (
                <div key={document.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <FileText className="h-8 w-8 text-blue-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {document.originalName || document.filename}
                        </p>
                        <div className="flex items-center space-x-4 mt-1">
                          <p className="text-sm text-gray-500 flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {formatDate(document.upload_date || document.createdAt)}
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatFileSize(document.size)}
                          </p>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${(document.status || '').toLowerCase() === 'uploaded' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                            {document.status || 'Unknown'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      {/* Risk analysis display logic removed as it's not in Document interface from service */}
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewDocument(document.id)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="View Document"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => navigate('/agents/clause-extraction', { state: { documentId: document.id, documentName: document.originalName || document.filename } })}
                          className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg"
                          title="Extract Clauses"
                        >
                          <Search className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDownloadDocument(document.id)}
                          className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg"
                          title="Download Document"
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

export { MyDocumentsPage };