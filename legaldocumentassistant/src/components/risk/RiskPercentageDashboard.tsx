import { motion } from 'framer-motion';
import { TrendingUpIcon, AlertTriangleIcon, ShieldIcon, DollarSignIcon } from 'lucide-react';

interface RiskPercentages {
  financial: number;
  legal: number;
  operational: number;
  compliance: number;
}

interface RiskPercentageDashboardProps {
  riskPercentages: RiskPercentages;
  overallRiskScore: number;
  riskLevel: string;
}

export function RiskPercentageDashboard({ 
  riskPercentages, 
  overallRiskScore, 
  riskLevel 
}: RiskPercentageDashboardProps) {
  
  const getRiskLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'critical': return 'text-red-700 bg-red-100 border-red-300';
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'moderate': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-red-600';
    if (score >= 60) return 'text-orange-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-green-600';
  };

  const riskCategories = [
    {
      name: 'Financial Risk',
      percentage: riskPercentages.financial,
      icon: DollarSignIcon,
      color: 'bg-red-500',
      description: 'Monetary exposure and liability risks'
    },
    {
      name: 'Legal Risk',
      percentage: riskPercentages.legal,
      icon: ShieldIcon,
      color: 'bg-orange-500',
      description: 'Legal compliance and regulatory risks'
    },
    {
      name: 'Operational Risk',
      percentage: riskPercentages.operational,
      icon: TrendingUpIcon,
      color: 'bg-yellow-500',
      description: 'Business operation and process risks'
    },
    {
      name: 'Compliance Risk',
      percentage: riskPercentages.compliance,
      icon: AlertTriangleIcon,
      color: 'bg-blue-500',
      description: 'Regulatory and policy compliance risks'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Overall Risk Score */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900">Overall Risk Assessment</h3>
          <span className={`px-4 py-2 rounded-full text-sm font-semibold border ${getRiskLevelColor(riskLevel)}`}>
            {riskLevel.toUpperCase()} RISK
          </span>
        </div>
        
        <div className="flex items-center justify-center">
          <div className="relative w-32 h-32">
            <svg className="w-32 h-32 transform -rotate-90">
              <circle 
                cx="64" 
                cy="64" 
                r="56" 
                stroke="#E5E7EB" 
                strokeWidth="8" 
                fill="none" 
              />
              <motion.circle 
                cx="64" 
                cy="64" 
                r="56" 
                stroke="currentColor" 
                strokeWidth="8" 
                fill="none" 
                strokeDasharray={`${2 * Math.PI * 56}`}
                strokeDashoffset={`${2 * Math.PI * 56 * (1 - overallRiskScore / 100)}`}
                strokeLinecap="round"
                className={getScoreColor(overallRiskScore)}
                initial={{ strokeDashoffset: 2 * Math.PI * 56 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 56 * (1 - overallRiskScore / 100) }}
                transition={{ duration: 2, ease: "easeOut" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-3xl font-bold ${getScoreColor(overallRiskScore)}`}>
                {overallRiskScore}
              </span>
              <span className="text-xs text-gray-600">RISK SCORE</span>
            </div>
          </div>
        </div>
        
        <div className="mt-4 text-center">
          <p className="text-gray-600">
            Based on analysis of contract terms and legal language patterns
          </p>
        </div>
      </div>

      {/* Risk Category Breakdown */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Risk Category Breakdown</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {riskCategories.map((category, index) => (
            <motion.div
              key={category.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-gray-50 rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${category.color} text-white`}>
                    <category.icon size={20} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{category.name}</h4>
                    <p className="text-sm text-gray-600">{category.description}</p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-gray-900">
                  {category.percentage}%
                </span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div
                  className={`h-2 rounded-full ${category.color}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${category.percentage}%` }}
                  transition={{ duration: 1.5, delay: index * 0.2 }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Risk Impact Summary */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Risk Impact Summary</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
            <div className="text-3xl font-bold text-red-600 mb-2">
              {riskPercentages.financial + riskPercentages.legal}%
            </div>
            <div className="text-sm font-medium text-red-700">High Priority Risks</div>
            <div className="text-xs text-red-600 mt-1">Require immediate attention</div>
          </div>
          
          <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="text-3xl font-bold text-yellow-600 mb-2">
              {riskPercentages.operational}%
            </div>
            <div className="text-sm font-medium text-yellow-700">Medium Priority Risks</div>
            <div className="text-xs text-yellow-600 mt-1">Should be addressed soon</div>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {riskPercentages.compliance}%
            </div>
            <div className="text-sm font-medium text-green-700">Low Priority Risks</div>
            <div className="text-xs text-green-600 mt-1">Monitor and review</div>
          </div>
        </div>
      </div>
    </div>
  );
}