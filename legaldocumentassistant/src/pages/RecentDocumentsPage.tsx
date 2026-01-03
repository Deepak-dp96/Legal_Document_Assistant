import React, { useState, useEffect } from 'react';
import { Upload, FileText, Calendar, RefreshCw, AlertCircle, Eye } from 'lucide-react';
import { documentService, Document } from '../services/documentService';
import { MainLayout } from '../components/layout/MainLayout';
import { HelpBotWidget } from '../components/common/HelpBotWidget';


const RecentDocumentsPage: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRecentDocuments = async () => {
    try {
      const response = await documentService.getDocuments();

      if (response.success && response.data) {
        // Filter documents uploaded in the last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const recentDocs = response.data.documents.filter(doc => {
          const uploadDate = new Date(doc.upload_date || doc.createdAt);
          return uploadDate >= sevenDaysAgo;
        });

        // Sort by upload date, newest first
        recentDocs.sort((a, b) => {
          const dateA = new Date(a.upload_date || a.createdAt).getTime();
          const dateB = new Date(b.upload_date || b.createdAt).getTime();
          return dateB - dateA;
        });

        setDocuments(recentDocs);
        setError(null);
      } else {
        setDocuments([]);
        setError(response.message || 'Failed to fetch documents');
      }
    } catch (err) {
      console.error('Error fetching recent documents:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch documents');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchRecentDocuments();
  };

  useEffect(() => {
    fetchRecentDocuments();

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchRecentDocuments, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
            <h1 className="text-3xl font-bold text-gray-900">Recent Uploads</h1>
            <p className="mt-2 text-gray-600">View your recently uploaded documents with real-time status</p>
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

        {documents.length === 0 ? (
          <div className="text-center py-12">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No recent uploads</h3>
            <p className="mt-1 text-sm text-gray-500">Upload your first document to get started</p>
          </div>
        ) : (
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">
                Recent Documents ({documents.length})
              </h2>
            </div>
            <div className="divide-y divide-gray-200">
              {documents.map((document) => (
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
                          {/* <p className="text-sm text-gray-500">
                            {formatFileSize(document.size)}
                          </p>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${document.status === 'uploaded' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                            {document.status}
                          </span> */}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      {/* Risk analysis removed - not available in Document interface */}
                      <div className="flex space-x-2">

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

export { RecentDocumentsPage };