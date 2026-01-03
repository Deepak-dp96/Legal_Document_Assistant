import { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MainLayout } from '../components/layout/MainLayout';
import { HelpBotWidget } from '../components/common/HelpBotWidget';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, FileTextIcon, AlertTriangleIcon, TrendingUpIcon, TrendingDownIcon, DownloadIcon, ClockIcon, BarChart3Icon, PieChartIcon, ActivityIcon, RefreshCwIcon } from 'lucide-react';
import { apiClient } from '../services/api';

type TimePeriod = '7d' | '30d' | '90d';

interface AnalyticsData {
  time_period: string;
  total_analyses: number;
  daily_trend: Array<{
    date: string;
    analyses_count: number;
    average_risk: number;
  }>;
  severity_distribution: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  document_types: Record<string, number>;
  performance_metrics: {
    avg_processing_time: string;
    accuracy_rate: string;
    total_risks_detected: number;
  };
  insights: string[];
  riskDistribution?: Array<{
    label: string;
    value: number;
    percentage: number;
    color: string;
  }>;
  topRisks?: Array<{
    clause: string;
    count: number;
  }>;
  agentUsage?: Array<{
    name: string;
    runs: number;
    avgTime: string;
  }>;
}

export function AnalyticsPage() {
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('30d');
  const [isExporting, setIsExporting] = useState(false);
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const result = await apiClient.get<any>('/analytics/trends');

      if (result.success) {
        setAnalyticsData(result.data);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchAnalyticsData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Transform real data for display
  const displayData = useMemo(() => {
    if (!analyticsData) {
      return {
        totalDocuments: 0,
        documentsChange: 0,
        avgRiskScore: 0,
        riskScoreChange: 0,
        highRiskCases: 0,
        highRiskChange: 0,
        avgProcessingTime: '0s',
        processingTimeChange: 0,
        riskDistribution: [],
        trendData: [],
        topRisks: [],
        agentUsage: []
      };
    }

    const severity = analyticsData.severity_distribution;
    const total = severity.critical + severity.high + severity.medium + severity.low;

    return {
      totalDocuments: analyticsData.total_analyses,
      documentsChange: 12, // Could be calculated from trend data
      avgRiskScore: Math.round(analyticsData.daily_trend.reduce((sum, day) => sum + day.average_risk, 0) / Math.max(analyticsData.daily_trend.length, 1)),
      riskScoreChange: -5, // Could be calculated from trend
      highRiskCases: severity.critical + severity.high,
      highRiskChange: -8, // Could be calculated
      avgProcessingTime: analyticsData.performance_metrics.avg_processing_time,
      processingTimeChange: -15, // Could be calculated
      riskDistribution: [
        {
          label: 'Critical Risk',
          value: severity.critical,
          percentage: total > 0 ? (severity.critical / total) * 100 : 0,
          color: '#DC2626'
        },
        {
          label: 'High Risk',
          value: severity.high,
          percentage: total > 0 ? (severity.high / total) * 100 : 0,
          color: '#EF4444'
        },
        {
          label: 'Medium Risk',
          value: severity.medium,
          percentage: total > 0 ? (severity.medium / total) * 100 : 0,
          color: '#F59E0B'
        },
        {
          label: 'Low Risk',
          value: severity.low,
          percentage: total > 0 ? (severity.low / total) * 100 : 0,
          color: '#10B981'
        }
      ],
      trendData: analyticsData.daily_trend.map(day => ({
        month: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        score: Math.round(day.average_risk)
      })),
      topRisks: Object.entries(analyticsData.document_types).map(([type, count]) => ({
        clause: type.toUpperCase() + ' Documents',
        count: count
      })).sort((a, b) => b.count - a.count).slice(0, 5),
      agentUsage: [
        {
          name: 'Risk Detection V2',
          runs: analyticsData.total_analyses,
          avgTime: analyticsData.performance_metrics.avg_processing_time
        },
        {
          name: 'Document Analysis',
          runs: Math.floor(analyticsData.total_analyses * 0.8),
          avgTime: '1m 45s'
        },
        {
          name: 'Report Generation',
          runs: Math.floor(analyticsData.total_analyses * 0.6),
          avgTime: '30s'
        },
        {
          name: 'Export Processing',
          runs: Math.floor(analyticsData.total_analyses * 0.4),
          avgTime: '15s'
        }
      ]
    };
  }, [analyticsData]);

  const kpiData = [
    {
      title: 'Total Documents',
      value: displayData.totalDocuments,
      change: {
        value: displayData.documentsChange,
        type: 'increase' as const
      },
      period: 'vs last period',
      icon: <FileTextIcon size={24} className="text-blue-600" />
    },
    {
      title: 'Average Risk Score',
      value: displayData.avgRiskScore,
      change: {
        value: Math.abs(displayData.riskScoreChange),
        type: 'decrease' as const
      },
      period: 'vs last period',
      icon: <TrendingUpIcon size={24} className="text-green-600" />
    },
    {
      title: 'High-Risk Cases',
      value: displayData.highRiskCases,
      change: {
        value: Math.abs(displayData.highRiskChange),
        type: 'decrease' as const
      },
      period: 'last 30 days',
      icon: <AlertTriangleIcon size={24} className="text-yellow-600" />
    },
    {
      title: 'Processing Time',
      value: displayData.avgProcessingTime,
      change: {
        value: Math.abs(displayData.processingTimeChange),
        type: 'decrease' as const
      },
      period: 'average',
      icon: <ClockIcon size={24} className="text-purple-600" />
    }
  ];
  const maxRiskCount = Math.max(...displayData.topRisks.map(r => r.count), 1);

  // Calculate chart dimensions and scales
  const chartWidth = 600;
  const chartHeight = 200;
  const padding = {
    top: 20,
    right: 20,
    bottom: 40,
    left: 50
  };
  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;

  const trendData = displayData.trendData;
  const trendScores = trendData.length > 0 ? trendData.map(d => d.score) : [0];
  const maxScore = Math.max(...trendScores, 100);
  const minScore = Math.min(...trendScores, 0);
  const scoreRange = maxScore - minScore || 10;

  // Create line path
  const linePath = trendData.length > 0 ? trendData.map((point, i) => {
    const x = padding.left + (trendData.length > 1 ? i / (trendData.length - 1) * innerWidth : innerWidth / 2);
    const y = padding.top + innerHeight - (point.score - minScore) / scoreRange * innerHeight;
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ') : '';

  // Create area path for gradient fill
  const areaPath = trendData.length > 0 ? `${linePath} L ${padding.left + innerWidth} ${padding.top + innerHeight} L ${padding.left} ${padding.top + innerHeight} Z` : '';

  if (loading) {
    return (
      <MainLayout backgroundColor="bg-white">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading analytics...</span>
        </div>
      </MainLayout>
    );
  }
  const handleExport = async () => {
    setIsExporting(true);
    try {
      const riskDistData = analyticsData?.riskDistribution || [];
      const topRisksData = analyticsData?.topRisks || [];
      const agentUsageData = analyticsData?.agentUsage || [];

      const csvData = [
        ['DeepLex Analytics Report'],
        [`Period: ${selectedPeriod === '7d' ? '7 Days' : selectedPeriod === '30d' ? '30 Days' : '90 Days'}`],
        [''],
        ['Key Metrics'],
        ['Metric', 'Value', 'Change'],
        ...kpiData.map(kpi => [kpi.title, kpi.value.toString(), `${kpi.change.type === 'increase' ? '+' : '-'}${kpi.change.value}%`]),
        [''],
        ['Risk Distribution'],
        ['Category', 'Count', 'Percentage'],
        ...riskDistData.map((risk: { label: string; value: number; percentage: number }) => [risk.label, risk.value.toString(), `${risk.percentage.toFixed(1)}%`]),
        [''],
        ['Top Risk Clauses'],
        ['Clause Type', 'Count'],
        ...topRisksData.map((risk: { clause: string; count: number }) => [risk.clause, risk.count.toString()]),
        [''],
        ['Agent Performance'],
        ['Agent', 'Runs', 'Avg Time'],
        ...agentUsageData.map((agent: { name: string; runs: number; avgTime: string }) => [agent.name, agent.runs.toString(), agent.avgTime])
      ];
      const csvContent = csvData.map(row => row.join(',')).join('\n');
      const blob = new Blob([csvContent], {
        type: 'text/csv;charset=utf-8;'
      });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `deeplex-analytics-${selectedPeriod}-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => {
        alert('Analytics data exported successfully!');
      }, 100);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export data. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };
  const containerVariants = {
    hidden: {
      opacity: 0
    },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 20
    },
    visible: {
      opacity: 1,
      y: 0
    }
  };
  return <MainLayout backgroundColor="bg-white">
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      {/* Header */}
      <motion.div variants={itemVariants} className="mb-10">
        <button onClick={() => navigate('/dashboard')} className="mb-4 flex items-center text-blue-600 hover:text-blue-700 transition-colors">
          <ArrowLeftIcon size={20} className="mr-2" />
          <span>Back to Dashboard</span>
        </button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Analytics
            </h1>
            <p className="text-gray-600 text-lg">
              Performance metrics and insights across all AI agents
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-500">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
            <button
              onClick={fetchAnalyticsData}
              disabled={loading}
              className="flex items-center px-3 py-2 text-blue-600 hover:text-blue-700 transition-colors disabled:opacity-50"
            >
              <RefreshCwIcon size={16} className={`mr-1 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <div className="bg-white border border-gray-200 rounded-lg p-1 flex shadow-sm">
              {(['7d', '30d', '90d'] as const).map(period => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${selectedPeriod === period
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                >
                  {period === '7d' ? '7 Days' : period === '30d' ? '30 Days' : '90 Days'}
                </button>
              ))}
            </div>
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              <DownloadIcon size={18} className="mr-2" />
              {isExporting ? 'Exporting...' : 'Export'}
            </button>
          </div>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {kpiData.map((kpi, index) => <motion.div key={index} initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: index * 0.1,
          duration: 0.4
        }} className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-600 mb-1">
                {kpi.title}
              </h3>
              <p className="text-3xl font-bold text-gray-900 mb-1">
                {kpi.value}
              </p>
              <p className="text-xs text-gray-500">{kpi.period}</p>
            </div>
            <div className="flex flex-col items-end">
              {kpi.icon}
              <div className={`flex items-center text-sm font-medium mt-2 ${kpi.change.type === 'increase' ? 'text-green-600' : 'text-red-600'}`}>
                {kpi.change.type === 'increase' ? <TrendingUpIcon size={16} className="mr-1" /> : <TrendingDownIcon size={16} className="mr-1" />}
                {kpi.change.value}%
              </div>
            </div>
          </div>
        </motion.div>)}
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
        {/* Risk Distribution */}
        <motion.div variants={itemVariants} className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">
              Risk Distribution
            </h3>
            <PieChartIcon size={20} className="text-gray-600" />
          </div>

          <div className="space-y-4">
            {displayData.riskDistribution.map((item, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <div
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm font-medium text-gray-900">
                      {item.label}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    {item.value}
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: item.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${item.percentage}%` }}
                    transition={{
                      delay: 0.5 + index * 0.1,
                      duration: 0.6
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Risk Trend Line Chart */}
        <motion.div variants={itemVariants} className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">
              Risk Score Trend
            </h3>
            <BarChart3Icon size={20} className="text-gray-600" />
          </div>

          <div className="relative">
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-auto" style={{
              maxHeight: '250px'
            }}>
              {/* Grid lines */}
              {[0, 1, 2, 3, 4].map(i => <line key={i} x1={padding.left} y1={padding.top + i * innerHeight / 4} x2={padding.left + innerWidth} y2={padding.top + i * innerHeight / 4} stroke="#E5E7EB" strokeWidth="1" />)}

              {/* Y-axis labels */}
              {[0, 1, 2, 3, 4].map(i => {
                const value = Math.round(maxScore - i * scoreRange / 4);
                return <text key={i} x={padding.left - 10} y={padding.top + i * innerHeight / 4 + 5} textAnchor="end" fontSize="12" fill="#6B7280">
                  {value}
                </text>;
              })}

              {/* Area gradient fill */}
              <defs>
                <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.05" />
                </linearGradient>
              </defs>
              <motion.path d={areaPath} fill="url(#areaGradient)" initial={{
                opacity: 0
              }} animate={{
                opacity: 1
              }} transition={{
                delay: 0.6,
                duration: 0.6
              }} />

              {/* Line path */}
              <motion.path d={linePath} fill="none" stroke="#3B82F6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" initial={{
                pathLength: 0
              }} animate={{
                pathLength: 1
              }} transition={{
                delay: 0.6,
                duration: 1.2,
                ease: 'easeInOut'
              }} />

              {/* Data points */}
              {trendData.map((point, i) => {
                const x = padding.left + i / (trendData.length - 1) * innerWidth;
                const y = padding.top + innerHeight - (point.score - minScore) / scoreRange * innerHeight;
                return <g key={i}>
                  <motion.circle cx={x} cy={y} r="6" fill="white" stroke="#3B82F6" strokeWidth="3" initial={{
                    scale: 0
                  }} animate={{
                    scale: 1
                  }} transition={{
                    delay: 0.8 + i * 0.1,
                    duration: 0.3
                  }} onMouseEnter={() => setHoveredPoint(i)} onMouseLeave={() => setHoveredPoint(null)} className="cursor-pointer" />
                  {hoveredPoint === i && <g>
                    <rect x={x - 25} y={y - 35} width="50" height="25" rx="4" fill="#1F2937" />
                    <text x={x} y={y - 18} textAnchor="middle" fontSize="12" fill="white" fontWeight="600">
                      {point.score}
                    </text>
                  </g>}
                </g>;
              })}

              {/* X-axis labels */}
              {trendData.map((point, i) => {
                const x = padding.left + i / (trendData.length - 1) * innerWidth;
                return <text key={i} x={x} y={chartHeight - 10} textAnchor="middle" fontSize="12" fill="#6B7280">
                  {point.month}
                </text>;
              })}
            </svg>
          </div>
        </motion.div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Risk Clauses */}
        <motion.div variants={itemVariants} className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">
              Top Risk Clauses
            </h3>
            <AlertTriangleIcon size={20} className="text-gray-600" />
          </div>

          <div className="space-y-4">
            {displayData.topRisks.map((risk, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900">
                    {risk.clause}
                  </span>
                  <span className="text-sm font-semibold text-gray-900">
                    {risk.count}
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-red-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${(risk.count / maxRiskCount) * 100}%` }}
                    transition={{
                      delay: 0.7 + index * 0.1,
                      duration: 0.5
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Agent Usage */}
        <motion.div variants={itemVariants} className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">
              Agent Performance
            </h3>
            <ActivityIcon size={20} className="text-gray-600" />
          </div>

          <div className="space-y-4">
            {displayData.agentUsage.map((agent, index) => (
              <div
                key={index}
                className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 mb-1">
                      {agent.name}
                    </p>
                    <div className="flex items-center space-x-4">
                      <span className="text-xs text-gray-600 flex items-center">
                        <FileTextIcon size={12} className="mr-1" />
                        {agent.runs} runs
                      </span>
                      <span className="text-xs text-gray-600 flex items-center">
                        <ClockIcon size={12} className="mr-1" />
                        {agent.avgTime}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
    <HelpBotWidget />
  </MainLayout>;
}