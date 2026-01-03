import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRightIcon, ClockIcon, FileTextIcon, AlertTriangleIcon, PenToolIcon, BookOpenIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
export type AgentType = 'clause-extraction' | 'risk-detection' | 'drafting' | 'summary';
interface AgentCardProps {
  type: AgentType;
  status: 'idle' | 'processing' | 'completed' | 'error';
  lastDocument?: string;
  lastRunTime?: string;
  completionTime?: string;
  documentCount: number;
}
export function AgentCard({
  type,
  status,
  lastDocument,
  lastRunTime,
  completionTime,
  documentCount
}: AgentCardProps) {
  const getAgentInfo = () => {
    switch (type) {
      case 'clause-extraction':
        return {
          title: 'Clause Extraction Agent',
          icon: <FileTextIcon size={24} className="text-deep-blue" />,
          description: 'Extract and categorize contract clauses with structured metadata',
          route: '/agents/clause-extraction'
        };
      case 'risk-detection':
        return {
          title: 'Risk Detection Agent',
          icon: <AlertTriangleIcon size={24} className="text-warm-gold" />,
          description: 'Identify legal risks and compliance issues within contracts',
          route: '/agents/risk-detection'
        };
      case 'drafting':
        return {
          title: 'Drafting Agent',
          icon: <PenToolIcon size={24} className="text-neon-accent" />,
          description: 'Generate and improve contract language with AI assistance',
          route: '/agents/drafting'
        };
      case 'summary':
        return {
          title: 'Summary Agent',
          icon: <BookOpenIcon size={24} className="text-green-500" />,
          description: 'Create concise summaries of complex legal documents',
          route: '/agents/summary'
        };
    }
  };
  const getStatusBadge = () => {
    switch (status) {
      case 'idle':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
            Idle
          </span>;
      case 'processing':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
            Processing
          </span>;
      case 'completed':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
            Completed
          </span>;
      case 'error':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
            Error
          </span>;
    }
  };
  const agentInfo = getAgentInfo();
  return <motion.div className="glass-card hover:shadow-lg transition-shadow duration-300 overflow-hidden" whileHover={{
    y: -5
  }} transition={{
    duration: 0.3
  }}>
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center">
            <div className="rounded-lg p-2 bg-gray-100">{agentInfo.icon}</div>
            <div className="ml-3">
              <h3 className="text-lg font-semibold text-navy">
                {agentInfo.title}
              </h3>
              <p className="text-sm text-gray-600">{agentInfo.description}</p>
            </div>
          </div>
          {getStatusBadge()}
        </div>
        <div className="mt-6 space-y-3">
          {lastDocument && <div className="flex items-center text-sm">
              <FileTextIcon size={16} className="text-gray-400 mr-2" />
              <span className="text-gray-600">Last document:</span>
              <span className="ml-1 font-medium truncate">{lastDocument}</span>
            </div>}
          {lastRunTime && <div className="flex items-center text-sm">
              <ClockIcon size={16} className="text-gray-400 mr-2" />
              <span className="text-gray-600">Last run:</span>
              <span className="ml-1 font-medium">{lastRunTime}</span>
            </div>}
          <div className="flex items-center text-sm">
            <FileTextIcon size={16} className="text-gray-400 mr-2" />
            <span className="text-gray-600">Documents processed:</span>
            <span className="ml-1 font-medium">{documentCount}</span>
          </div>
        </div>
        <div className="mt-6 flex justify-between items-center">
          <div className="flex space-x-2">
            <button className="btn-secondary text-sm py-1.5 px-3">
              Configure
            </button>
            <button className="btn-primary text-sm py-1.5 px-3">Run</button>
          </div>
          <Link to={agentInfo.route} className="text-deep-blue hover:text-neon-accent flex items-center text-sm font-medium">
            View Details
            <ArrowRightIcon size={16} className="ml-1" />
          </Link>
        </div>
      </div>
    </motion.div>;
}