import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { XIcon, UploadIcon, FileTextIcon, ImageIcon, FileIcon, CheckIcon, LockIcon, EyeIcon, AlertTriangleIcon } from 'lucide-react';
import { AgentType } from '../dashboard/AgentCard';
interface UploadPanelProps {
  onClose: () => void;
  onStartAnalysis: (selectedAgents: AgentType[]) => void;
}
export function UploadPanel({
  onClose,
  onStartAnalysis
}: UploadPanelProps) {
  const [file, setFile] = useState<File | null>(null);
  const [selectedAgents, setSelectedAgents] = useState<AgentType[]>([]);
  const [autoAssign, setAutoAssign] = useState(false);
  const {
    register
  } = useForm();
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0]);
    }
  };
  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      setFile(event.dataTransfer.files[0]);
    }
  };
  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };
  const toggleAgent = (agent: AgentType) => {
    if (selectedAgents.includes(agent)) {
      setSelectedAgents(selectedAgents.filter(a => a !== agent));
    } else {
      setSelectedAgents([...selectedAgents, agent]);
    }
  };
  const handleStartAnalysis = () => {
    if (selectedAgents.length > 0 && file) {
      localStorage.setItem('uploaded_file_name', file.name);
      onStartAnalysis(selectedAgents);
    }
  };
  const getFileIcon = () => {
    if (!file) return null;
    const extension = file.name.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return <FileTextIcon size={40} className="text-red-500" />;
      case 'docx':
      case 'doc':
        return <FileTextIcon size={40} className="text-blue-500" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
        return <ImageIcon size={40} className="text-green-500" />;
      default:
        return <FileIcon size={40} className="text-gray-500" />;
    }
  };
  const slideVariants = {
    hidden: {
      x: '100%'
    },
    visible: {
      x: 0
    },
    exit: {
      x: '100%'
    }
  };
  return <motion.div className="fixed inset-y-0 right-0 w-full max-w-xl bg-deep-navy/95 backdrop-blur-xl shadow-xl border-l border-white/10 z-30 flex flex-col" variants={slideVariants} initial="hidden" animate="visible" exit="exit" transition={{
    type: 'tween',
    duration: 0.3
  }}>
      <div className="flex items-center justify-between border-b border-white/10 p-4">
        <h2 className="text-xl font-semibold text-white">Upload Document</h2>
        <button onClick={onClose} className="text-white/70 hover:text-white focus:outline-none">
          <XIcon size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className={`border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center ${file ? 'border-green-500/50 bg-green-500/10' : 'border-white/30 hover:border-neon-cyan/50 bg-white/5'}`} onDrop={handleDrop} onDragOver={handleDragOver}>
          {!file ? <>
              <UploadIcon size={40} className="text-white/50 mb-4" />
              <h3 className="text-lg font-medium text-white">
                Drag & Drop your document here
              </h3>
              <p className="text-sm text-white/60 mt-2">or</p>
              <label htmlFor="file-upload" className="btn-neon mt-4 cursor-pointer">
                <span>Select Files</span>
                <input id="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept=".pdf,.doc,.docx,.txt,.odt" />
              </label>
              <p className="text-xs text-white/50 mt-4">
                Supported formats: PDF, DOCX, TXT, ODT (Max 50MB)
              </p>
            </> : <div className="flex flex-col items-center">
              {getFileIcon()}
              <p className="mt-4 font-medium text-white">{file.name}</p>
              <p className="text-sm text-white/70">
                {(file.size / (1024 * 1024)).toFixed(2)} MB
              </p>
              <button onClick={() => setFile(null)} className="mt-4 btn-secondary text-sm">
                Remove
              </button>
            </div>}
        </div>

        {file && <>
            <div className="mt-8">
              <h3 className="text-lg font-medium text-white mb-4">
                Document Information
              </h3>
              <div className="glass-card p-4 border border-white/20">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-white/60">File Name</p>
                    <p className="font-medium text-white">{file.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-white/60">Size</p>
                    <p className="font-medium text-white">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-white/60">Uploaded By</p>
                    <p className="font-medium text-white">
                      deep.user@example.com
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-white/60">Upload Date</p>
                    <p className="font-medium text-white">
                      {new Date().toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-white">
                  Select Agents
                </h3>
                <label className="flex items-center text-sm">
                  <input type="checkbox" checked={autoAssign} onChange={() => setAutoAssign(!autoAssign)} className="h-4 w-4 text-neon-cyan focus:ring-neon-cyan border-white/30 rounded mr-2 bg-white/10" />
                  <span className="text-white/80">
                    Auto-assign based on document type
                  </span>
                </label>
              </div>
              <div className="space-y-3">
                <AgentOption type="clause-extraction" title="Clause Extraction Agent" description="Extract and categorize contract clauses" processingTime="~2 min" selected={selectedAgents.includes('clause-extraction')} onSelect={() => toggleAgent('clause-extraction')} icon={<FileTextIcon size={20} className="text-neon-cyan" />} />
                <AgentOption type="risk-detection" title="Risk Detection Agent" description="Identify legal risks and compliance issues" processingTime="~3 min" selected={selectedAgents.includes('risk-detection')} onSelect={() => toggleAgent('risk-detection')} icon={<AlertTriangleIcon size={20} className="text-red-400" />} />
                <AgentOption type="drafting" title="Drafting Agent" description="Generate and improve contract language" processingTime="~4 min" selected={selectedAgents.includes('drafting')} onSelect={() => toggleAgent('drafting')} icon={<FileTextIcon size={20} className="text-purple-400" />} />
                <AgentOption type="summary" title="Summary Agent" description="Create concise summaries of documents" processingTime="~1 min" selected={selectedAgents.includes('summary')} onSelect={() => toggleAgent('summary')} icon={<FileTextIcon size={20} className="text-green-400" />} />
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-medium text-white mb-4">
                Privacy Settings
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border border-white/20 rounded-lg bg-white/5">
                  <div className="flex items-center">
                    <LockIcon size={18} className="text-white/70 mr-2" />
                    <span className="text-sm text-white">Private Document</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" {...register('private')} className="sr-only peer" />
                    <div className="w-11 h-6 bg-white/20 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-neon-cyan/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-neon-cyan"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between p-3 border border-white/20 rounded-lg bg-white/5">
                  <div className="flex items-center">
                    <EyeIcon size={18} className="text-white/70 mr-2" />
                    <span className="text-sm text-white">Add Watermark</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" {...register('watermark')} className="sr-only peer" />
                    <div className="w-11 h-6 bg-white/20 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-neon-cyan/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-neon-cyan"></div>
                  </label>
                </div>
                <div className="flex items-center p-3 border border-white/20 rounded-lg bg-white/5">
                  <input type="checkbox" id="confidential" {...register('confidential')} className="h-4 w-4 text-neon-cyan focus:ring-neon-cyan border-white/30 rounded bg-white/10" />
                  <label htmlFor="confidential" className="ml-2 text-sm text-white">
                    Mark as confidential
                  </label>
                </div>
              </div>
            </div>
          </>}
      </div>

      <div className="border-t border-white/10 p-4 flex justify-between">
        <button onClick={onClose} className="btn-secondary">
          Cancel
        </button>
        <button onClick={handleStartAnalysis} className="btn-neon disabled:opacity-50 disabled:cursor-not-allowed" disabled={!file || selectedAgents.length === 0}>
          Continue to Agent Selection
        </button>
      </div>
    </motion.div>;
}
interface AgentOptionProps {
  type: AgentType;
  title: string;
  description: string;
  processingTime: string;
  selected: boolean;
  onSelect: () => void;
  icon: React.ReactNode;
}
function AgentOption({
  title,
  description,
  processingTime,
  selected,
  onSelect,
  icon
}: AgentOptionProps) {
  return <div className={`border rounded-lg p-4 cursor-pointer transition-colors ${selected ? 'border-neon-cyan bg-neon-cyan/10' : 'border-white/20 hover:border-white/30 bg-white/5'}`} onClick={onSelect}>
      <div className="flex items-start">
        <div className={`h-5 w-5 rounded-full border flex items-center justify-center ${selected ? 'border-neon-cyan bg-neon-cyan' : 'border-white/30 bg-white/10'}`}>
          {selected && <CheckIcon size={12} className="text-deep-navy" />}
        </div>
        <div className="ml-3 flex-1">
          <div className="flex items-center">
            <span className="p-1 rounded bg-white/10 mr-2">{icon}</span>
            <h4 className="font-medium text-white">{title}</h4>
          </div>
          <p className="text-sm text-white/70 mt-1">{description}</p>
          <div className="flex justify-between mt-2">
            <span className="text-xs text-white/60">
              Processing time: {processingTime}
            </span>
          </div>
        </div>
      </div>
    </div>;
}