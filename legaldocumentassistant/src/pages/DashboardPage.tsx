import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import { HelpBotWidget } from '../components/common/HelpBotWidget';
import { UploadIcon, FileTextIcon, AlertTriangleIcon, ActivityIcon, RefreshCwIcon } from 'lucide-react';
import { apiClient } from '../services/api';

interface DashboardStats {
  // Strict counters - all start at 0
  total_documents: number;      // Increments on upload
  recent_uploads: number;       // Increments on upload
  all_reports: number;          // Increments on report download
  analysis_history: number;     // Increments on report download

  // Lists
  recent_uploads_list: Array<{
    id: number;
    document_name: string;
    uploaded_at: string;
    size: number;
    status: string;
  }>;
  all_reports_list: Array<{
    id: number;
    document_name: string;
    risk_level: string;
    risk_percentage: number;
    created_at: string;
    status: string;
  }>;

  // System status
  system_status: {
    all_systems_operational: boolean;
    available_features: number;
    total_features: number;
    capabilities: Record<string, boolean>;
  };
}

export function DashboardPage() {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setLoading(true);
      const result = await apiClient.get<any>('/dashboard/real-time-stats');

      if (result.success) {
        setDashboardData(result.data);
        setLastUpdated(new Date());
      } else {
        // Use fallback data if API fails
        setDashboardData(getFallbackData());
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Use fallback data if API fails
      setDashboardData(getFallbackData());
    } finally {
      setLoading(false);
    }
  };

  // STRICT INITIAL STATE: All counters = 0, all lists = empty
  const getFallbackData = (): DashboardStats => ({
    total_documents: 0,
    recent_uploads: 0,
    all_reports: 0,
    analysis_history: 0,
    recent_uploads_list: [],
    all_reports_list: [],
    system_status: {
      all_systems_operational: true,
      available_features: 5,
      total_features: 5,
      capabilities: {
        enhanced_agent_v2: true,
        export_agent: true,
        replacement_agent: true,
        hybrid_agent: true,
        help_bot: true
      }
    }
  });

  useEffect(() => {
    fetchDashboardData();
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchDashboardData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  if (loading && !dashboardData) {
    return (
      <MainLayout backgroundColor="bg-white">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading dashboard...</span>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout backgroundColor="bg-white">
      <motion.div variants={containerVariants} initial="hidden" animate="visible">
        {/* Header */}
        <motion.div variants={itemVariants} className="mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600 text-lg">
            Welcome back! Here's your real-time legal document analysis overview.
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div variants={itemVariants} className="flex justify-between items-center mb-10">
          <div className="flex space-x-4">
            <button onClick={() => navigate('/reports')} className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium">
              <FileTextIcon size={18} className="mr-2" />
              View All Reports
            </button>
            <button onClick={() => navigate('/upload-document')} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
              <UploadIcon size={18} className="mr-2" />
              Upload Document
            </button>
          </div>
          <div className="flex items-center space-x-4 text-sm">
            <span className="text-gray-500">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
            <button
              onClick={fetchDashboardData}
              disabled={loading}
              className="flex items-center text-blue-600 hover:text-blue-700 transition-colors font-medium disabled:opacity-50"
            >
              <RefreshCwIcon size={16} className={`mr-1 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </motion.div>

        {/* STRICT COUNTERS - All start at 0, update only on user action */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Total Documents - Increments on upload */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-sm font-medium text-gray-600 mb-1">
                  Total Documents
                </h3>
                <p className="text-3xl font-bold text-gray-900 mb-1">
                  {dashboardData?.total_documents || 0}
                </p>
                <p className="text-xs text-gray-500">
                  Uploaded documents
                </p>
              </div>
              <div className="flex flex-col items-end">
                <FileTextIcon size={24} className="text-blue-600 mb-2" />
              </div>
            </div>
          </div>

          {/* Recent Uploads - Increments on upload */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-sm font-medium text-gray-600 mb-1">
                  Recent Uploads
                </h3>
                <p className="text-3xl font-bold text-gray-900 mb-1">
                  {dashboardData?.recent_uploads || 0}
                </p>
                <p className="text-xs text-gray-500">
                  Latest uploads
                </p>
              </div>
              <div className="flex flex-col items-end">
                <UploadIcon size={24} className="text-green-600 mb-2" />
              </div>
            </div>
          </div>

          {/* All Reports - Increments on report download */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-sm font-medium text-gray-600 mb-1">
                  All Reports
                </h3>
                <p className="text-3xl font-bold text-gray-900 mb-1">
                  {dashboardData?.all_reports || 0}
                </p>
                <p className="text-xs text-gray-500">
                  Downloaded reports
                </p>
              </div>
              <div className="flex flex-col items-end">
                <AlertTriangleIcon size={24} className="text-yellow-600 mb-2" />
              </div>
            </div>
          </div>

          {/* Analysis History - Increments on report download */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-sm font-medium text-gray-600 mb-1">
                  Analysis History
                </h3>
                <p className="text-3xl font-bold text-gray-900 mb-1">
                  {dashboardData?.analysis_history || 0}
                </p>
                <p className="text-xs text-gray-500">
                  Completed analyses
                </p>
              </div>
              <div className="flex flex-col items-end">
                <ActivityIcon size={24} className="text-purple-600 mb-2" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* AI Agents Section - Real-time Status */}
        <motion.div variants={itemVariants}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">AI Agents</h2>
            <span className="text-sm text-gray-500">Real-time status</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Risk Detection Agent V2
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    Advanced risk analysis
                  </p>
                  <p className="text-xs text-gray-500">
                    Ready for document analysis
                  </p>
                </div>
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${dashboardData?.system_status?.capabilities?.enhanced_agent_v2
                  ? 'bg-green-100 text-green-700 border border-green-300'
                  : 'bg-red-100 text-red-700 border border-red-300'
                  }`}>
                  {dashboardData?.system_status?.capabilities?.enhanced_agent_v2 ? 'Online' : 'Offline'}
                </span>
              </div>
              <button onClick={() => navigate('/upload-document', { state: { initialAgent: 'risk-detection' } })} className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm">
                Upload for Risk Detection
              </button>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Clause Extraction Agent
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    Extract and categorize clauses
                  </p>
                  <p className="text-xs text-gray-500">
                    Ready for extraction
                  </p>
                </div>
                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700 border border-green-300">
                  Online
                </span>
              </div>
              <button onClick={() => navigate('/upload-document', { state: { initialAgent: 'clause-extraction' } })} className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm">
                Upload for Clause Extraction
              </button>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Document Export Agent
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    Professional document generation
                  </p>
                  <p className="text-xs text-gray-500">
                    Ready for document export
                  </p>
                </div>
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${dashboardData?.system_status?.capabilities?.export_agent
                  ? 'bg-green-100 text-green-700 border border-green-300'
                  : 'bg-red-100 text-red-700 border border-red-300'
                  }`}>
                  {dashboardData?.system_status?.capabilities?.export_agent ? 'Ready' : 'Offline'}
                </span>
              </div>
              <button onClick={() => navigate('/agents/document-export')} className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm">
                Open Agent
              </button>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Replacement Agent
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    Clickable risk replacements
                  </p>
                  <p className="text-xs text-gray-500">
                    Interactive risk mitigation
                  </p>
                </div>
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${dashboardData?.system_status?.capabilities?.replacement_agent
                  ? 'bg-green-100 text-green-700 border border-green-300'
                  : 'bg-red-100 text-red-700 border border-red-300'
                  }`}>
                  {dashboardData?.system_status?.capabilities?.replacement_agent ? 'Ready' : 'Offline'}
                </span>
              </div>
              <button onClick={() => navigate('/agents/replacement')} className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm">
                Open Agent
              </button>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Hybrid Excel Agent
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    100K+ risk terms detection
                  </p>
                  <p className="text-xs text-gray-500">
                    Advanced risk analysis
                  </p>
                </div>
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${dashboardData?.system_status?.capabilities?.hybrid_agent
                  ? 'bg-green-100 text-green-700 border border-green-300'
                  : 'bg-red-100 text-red-700 border border-red-300'
                  }`}>
                  {dashboardData?.system_status?.capabilities?.hybrid_agent ? 'Ready' : 'Offline'}
                </span>
              </div>
              <button onClick={() => navigate('/agents/hybrid')} className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm">
                Open Agent
              </button>
            </div>
          </div>
        </motion.div>

        {/* Recent Uploads List - Shows only uploaded documents */}
        <motion.div variants={itemVariants}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Recent Uploads</h2>
            <button onClick={() => navigate('/recent')} className="text-blue-600 hover:text-blue-700 transition-colors font-medium">
              View All Uploads →
            </button>
          </div>

          {dashboardData?.recent_uploads_list && dashboardData.recent_uploads_list.length > 0 ? (
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden mb-12">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr className="border-b border-gray-200">
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Document
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Size
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Uploaded
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {dashboardData.recent_uploads_list.map((doc) => (
                      <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                          {doc.document_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {(doc.size / 1024).toFixed(1)} KB
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700 border border-green-300">
                            {doc.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {new Date(doc.uploaded_at).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-12 text-center mb-12">
              <UploadIcon size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Recent Uploads</h3>
              <p className="text-gray-600 mb-6">Upload your first document to see it here.</p>
              <button
                onClick={() => navigate('/upload-document')}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Upload Your First Document
              </button>
            </div>
          )}
        </motion.div>

        {/* All Reports List - Shows only downloaded reports */}
        <motion.div variants={itemVariants}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">All Reports</h2>
            <button onClick={() => navigate('/reports')} className="text-blue-600 hover:text-blue-700 transition-colors font-medium">
              View All Reports →
            </button>
          </div>

          {dashboardData?.all_reports_list && dashboardData.all_reports_list.length > 0 ? (
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr className="border-b border-gray-200">
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Document
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Risk Level
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Risk %
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {dashboardData.all_reports_list.map((report) => (
                      <tr key={report.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                          {report.document_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${report.risk_level === 'critical' ? 'bg-red-100 text-red-700 border border-red-300' :
                            report.risk_level === 'high' ? 'bg-orange-100 text-orange-700 border border-orange-300' :
                              report.risk_level === 'medium' ? 'bg-yellow-100 text-yellow-700 border border-yellow-300' :
                                'bg-green-100 text-green-700 border border-green-300'
                            }`}>
                            {report.risk_level}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {report.risk_percentage}%
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700 border border-green-300">
                            {report.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {new Date(report.created_at).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-12 text-center">
              <FileTextIcon size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Reports Yet</h3>
              <p className="text-gray-600 mb-6">Download a report after analyzing a document to see it here.</p>
            </div>
          )}
        </motion.div>
      </motion.div>

      <HelpBotWidget />
    </MainLayout>
  );
}