import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import { FileTextIcon, AlertTriangleIcon, PenToolIcon, BookOpenIcon, ArrowRightIcon, CheckCircle2Icon } from 'lucide-react';
import { AgentType } from '../components/dashboard/AgentCard';
export function AgentSelectionPage() {
  const navigate = useNavigate();
  const [selectedAgents, setSelectedAgents] = useState<AgentType[]>([]);
  const [uploadedFile, setUploadedFile] = useState<string>('');
  useEffect(() => {
    const agents = localStorage.getItem('selected_agents');
    if (agents) {
      setSelectedAgents(JSON.parse(agents));
    }
    const file = localStorage.getItem('uploaded_file_name');
    if (file) {
      setUploadedFile(file);
    }
  }, []);
  const handleAgentClick = (agentType: AgentType) => {
    navigate(`/agents/${agentType}`);
  };
  const agents = [{
    type: 'clause-extraction' as AgentType,
    title: 'Clause Extraction Agent',
    description: 'Extract and categorize contract clauses with structured metadata',
    icon: <FileTextIcon size={32} className="text-blue-600" />,
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-300',
    hoverBorder: 'hover:border-blue-500'
  }, {
    type: 'risk-detection' as AgentType,
    title: 'Risk Detection Agent',
    description: 'Identify legal risks and compliance issues within contracts',
    icon: <AlertTriangleIcon size={32} className="text-red-600" />,
    bgColor: 'bg-red-50',
    borderColor: 'border-red-300',
    hoverBorder: 'hover:border-red-500'
  }, {
    type: 'drafting' as AgentType,
    title: 'Drafting Agent',
    description: 'Generate and improve contract language with AI assistance',
    icon: <PenToolIcon size={32} className="text-purple-600" />,
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-300',
    hoverBorder: 'hover:border-purple-500'
  }, {
    type: 'summary' as AgentType,
    title: 'Summary Agent',
    description: 'Create concise summaries of complex legal documents',
    icon: <BookOpenIcon size={32} className="text-green-600" />,
    bgColor: 'bg-green-50',
    borderColor: 'border-green-300',
    hoverBorder: 'hover:border-green-500'
  }];
  return <MainLayout backgroundColor="bg-white">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.5
      }}>
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Select an Agent
            </h1>
            <p className="text-gray-600 text-lg">
              Choose which AI agent you want to use to analyze your document
            </p>
            {uploadedFile && <div className="mt-4 bg-white border border-gray-200 rounded-lg shadow-sm p-4 inline-flex items-center">
                <FileTextIcon size={20} className="text-blue-600 mr-2" />
                <span className="text-sm font-medium text-gray-900">
                  Analyzing: {uploadedFile}
                </span>
              </div>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {agents.map((agent, index) => <motion.div key={agent.type} initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.5,
            delay: index * 0.1
          }} className={`bg-white border-2 rounded-lg shadow-sm p-6 cursor-pointer transition-all duration-300 ${selectedAgents.includes(agent.type) ? agent.borderColor : 'border-gray-200'} ${agent.hoverBorder} hover:shadow-md`} onClick={() => handleAgentClick(agent.type)}>
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-lg ${agent.bgColor} border ${agent.borderColor}`}>
                    {agent.icon}
                  </div>
                  {selectedAgents.includes(agent.type) && <CheckCircle2Icon size={24} className="text-green-600" />}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {agent.title}
                </h3>
                <p className="text-gray-600 mb-4">{agent.description}</p>
                <div className="flex items-center text-blue-600 font-medium">
                  <span>Start Analysis</span>
                  <ArrowRightIcon size={16} className="ml-2" />
                </div>
              </motion.div>)}
          </div>

          <motion.div initial={{
          opacity: 0
        }} animate={{
          opacity: 1
        }} transition={{
          duration: 0.5,
          delay: 0.4
        }} className="mt-8 bg-white border border-gray-200 rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              What happens next?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold mr-3">
                  1
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Select Agent</h4>
                  <p className="text-sm text-gray-600">
                    Choose the AI agent that best fits your analysis needs
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold mr-3">
                  2
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Processing</h4>
                  <p className="text-sm text-gray-600">
                    The agent analyzes your document using advanced AI
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold mr-3">
                  3
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">View Results</h4>
                  <p className="text-sm text-gray-600">
                    Review detailed insights and recommendations
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </MainLayout>;
}