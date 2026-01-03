import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { useNavigate, useLocation } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import { UploadIcon, FileTextIcon, ImageIcon, FileIcon, CheckIcon, LockIcon, EyeIcon, AlertTriangleIcon, ArrowLeftIcon } from 'lucide-react';
import { AgentType } from '../components/dashboard/AgentCard';
import { FullScreenLoader } from '../components/common/FullScreenLoader';

export function UploadDocumentPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [file, setFile] = useState<File | null>(null);
  const [selectedAgents, setSelectedAgents] = useState<AgentType[]>(
    location.state?.initialAgent ? [location.state.initialAgent] : []
  );
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
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const handleStartAnalysis = async () => {
    if (!file) return;

    // Clear old document data to prevent stale analysis
    localStorage.removeItem('uploaded_document_text');
    localStorage.removeItem('uploaded_file_name');
    localStorage.removeItem('uploaded_document_id');
    localStorage.removeItem('clause_document_id');
    localStorage.removeItem('risk_document_id');
    localStorage.removeItem('draft_document_id');
    localStorage.removeItem('summary_document_id');
    localStorage.removeItem('summary_analysis_results');
    localStorage.removeItem('clause_analysis_results');
    localStorage.removeItem('draft_analysis_results');
    localStorage.removeItem('risk_analysis_results');

    // Auto-select risk-detection if no agents selected
    let agentsToUse = [...selectedAgents];
    if (agentsToUse.length === 0) {
      agentsToUse = ['risk-detection'];
      setSelectedAgents(['risk-detection']);
    }

    setIsUploading(true);
    setUploadError('');

    try {
      // 1. Upload to Gateway
      const formData = new FormData();
      formData.append('file', file);

      // Use the unified upload endpoint
      const uploadResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/documents/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('deeplex_token')}`
        },
        body: formData
      });

      if (!uploadResponse.ok) {
        throw new Error(`Upload failed: ${uploadResponse.status} ${uploadResponse.statusText}`);
      }

      const uploadData = await uploadResponse.json();
      const docId = uploadData.id || uploadData.data?.id || uploadData.document?.id;

      if (!docId) {
        // Fallback: Fetch latest document if ID is not returned
        const docsResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/documents`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('deeplex_token')}` }
        });
        const docs = await docsResponse.json();
        if (docs && docs.length > 0) {
          throw new Error('Document ID not returned from upload.');
        }
      }

      localStorage.setItem('uploaded_document_id', docId);

      // Set specific IDs for compatibility
      localStorage.setItem('clause_document_id', docId);
      localStorage.setItem('risk_document_id', docId);
      localStorage.setItem('draft_document_id', docId);
      localStorage.setItem('summary_document_id', docId);

      console.log(`Upload successful. ID: ${docId}`);

      // 2. Trigger Processing for Selected Agents
      const agentMapping: Record<string, string> = {
        'clause-extraction': 'clause',
        'risk-detection': 'risk',
        'drafting': 'draft',
        'summary': 'summary'
      };

      const priorityAgents = agentsToUse.map(a => agentMapping[a] || a);

      const processResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/process-document/${docId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('deeplex_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ priority_agents: priorityAgents })
      });

      if (!processResponse.ok) {
        console.warn('Processing trigger failed, but upload was successful.');
      }

      // 3. Navigate
      if (agentsToUse.length > 1) {
        navigate('/agent-selection', {
          state: {
            documentName: file.name,
            fromUpload: true,
            documentId: docId
          }
        });
      } else {
        const firstAgent = agentsToUse[0];
        const navigateAgent = firstAgent === 'drafting' ? 'drafting' : firstAgent;
        navigate(`/agents/${navigateAgent}`, {
          state: {
            documentId: docId,
            documentName: file.name,
            fromUpload: true
          }
        });
      }

    } catch (error) {
      console.error('Upload process error:', error);
      setUploadError(error instanceof Error ? error.message : 'An unexpected error occurred during upload.');
    } finally {
      if (window.location.pathname === '/upload-document') {
        setIsUploading(false);
      }
    }
  };
  const getFileIcon = () => {
    if (!file) return null;
    const extension = file.name.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return <FileTextIcon size={40} className="text-red-600" />;
      case 'docx':
      case 'doc':
        return <FileTextIcon size={40} className="text-blue-600" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
        return <ImageIcon size={40} className="text-green-600" />;
      default:
        return <FileIcon size={40} className="text-gray-600" />;
    }
  };

  return <MainLayout backgroundColor="bg-white">
    {isUploading && (
      <FullScreenLoader
        message="Uploading & Analyzing Document"
        subMessage="Please wait while we process your file and initialize the AI agents..."
      />
    )}
    <div className="max-w-5xl mx-auto">
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
            Upload Document
          </h1>
          <p className="text-gray-600 text-lg">
            Upload your legal document for AI-powered analysis
          </p>
        </div>

        {/* Upload Area */}
        <div className={`border-2 border-dashed rounded-lg p-12 flex flex-col items-center justify-center mb-8 transition-colors ${file ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-blue-500 bg-gray-50 hover:bg-blue-50'}`} onDrop={handleDrop} onDragOver={handleDragOver}>
          {!file ? <>
            <UploadIcon size={48} className="text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Drag & Drop your document here
            </h3>
            <p className="text-gray-600 mb-4">or</p>
            <label htmlFor="file-upload" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer font-medium">
              <span>Select Files</span>
              <input id="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept=".pdf,.doc,.docx,.txt,.odt" />
            </label>
            <p className="text-sm text-gray-500 mt-4">
              Supported formats: PDF, DOCX, TXT, ODT (Max 50MB)
            </p>
          </> : <div className="flex flex-col items-center">
            {getFileIcon()}
            <p className="mt-4 font-semibold text-gray-900 text-lg">
              {file.name}
            </p>
            <p className="text-gray-600">
              {(file.size / (1024 * 1024)).toFixed(2)} MB
            </p>
            <button onClick={() => setFile(null)} className="mt-4 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium">
              Remove File
            </button>
          </div>}
        </div>

        {file && <>
          {/* Upload Error */}
          {uploadError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{uploadError}</p>
            </div>
          )}

          {/* Document Information */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Document Information
            </h3>
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600 mb-1">File Name</p>
                  <p className="font-medium text-gray-900">{file.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Size</p>
                  <p className="font-medium text-gray-900">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Uploaded By</p>
                  <p className="font-medium text-gray-900">
                    deep.user@example.com
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Upload Date</p>
                  <p className="font-medium text-gray-900">
                    {new Date().toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Select Agents */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">
                Select AI Agents
              </h3>
              <label className="flex items-center text-sm">
                <input type="checkbox" checked={autoAssign} onChange={() => setAutoAssign(!autoAssign)} className="h-4 w-4 text-blue-600 focus:ring-blue-600 border-gray-300 rounded mr-2" />
                <span className="text-gray-700">
                  Auto-assign based on document type
                </span>
              </label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AgentOption type="clause-extraction" title="Clause Extraction Agent" description="Extract and categorize contract clauses" processingTime="~2 min" selected={selectedAgents.includes('clause-extraction')} onSelect={() => toggleAgent('clause-extraction')} icon={<FileTextIcon size={20} className="text-blue-600" />} />
              <AgentOption type="risk-detection" title="Risk Detection Agent" description="Identify legal risks and compliance issues" processingTime="~3 min" selected={selectedAgents.includes('risk-detection')} onSelect={() => toggleAgent('risk-detection')} icon={<AlertTriangleIcon size={20} className="text-red-600" />} />
              <AgentOption type="drafting" title="Drafting Agent" description="Generate and improve contract language" processingTime="~4 min" selected={selectedAgents.includes('drafting')} onSelect={() => toggleAgent('drafting')} icon={<FileTextIcon size={20} className="text-purple-600" />} />
              <AgentOption type="summary" title="Summary Agent" description="Create concise summaries of documents" processingTime="~1 min" selected={selectedAgents.includes('summary')} onSelect={() => toggleAgent('summary')} icon={<FileTextIcon size={20} className="text-green-600" />} />
            </div>
          </div>

          {/* Privacy Settings */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Privacy Settings
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-gray-50">
                <div className="flex items-center">
                  <LockIcon size={18} className="text-gray-600 mr-3" />
                  <span className="text-gray-900 font-medium">
                    Private Document
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" {...register('private')} className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-gray-50">
                <div className="flex items-center">
                  <EyeIcon size={18} className="text-gray-600 mr-3" />
                  <span className="text-gray-900 font-medium">
                    Add Watermark
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" {...register('watermark')} className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <div className="flex items-center p-4 border border-gray-200 rounded-lg bg-gray-50">
                <input type="checkbox" id="confidential" {...register('confidential')} className="h-4 w-4 text-blue-600 focus:ring-blue-600 border-gray-300 rounded" />
                <label htmlFor="confidential" className="ml-3 text-gray-900 font-medium">
                  Mark as confidential
                </label>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between pt-6 border-t border-gray-200">
            <button onClick={() => navigate('/dashboard')} className="px-6 py-3 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium">
              Cancel
            </button>
            <button onClick={handleStartAnalysis} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed" disabled={!file || isUploading}>
              {isUploading ? 'Uploading & Analyzing...' : 'Start Risk Analysis'}
            </button>
          </div>
        </>}
      </motion.div>
    </div>
  </MainLayout>;
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
  return <div className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${selected ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300 bg-white hover:shadow-md'}`} onClick={onSelect}>
    <div className="flex items-start">
      <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${selected ? 'border-blue-600 bg-blue-600' : 'border-gray-300 bg-white'}`}>
        {selected && <CheckIcon size={12} className="text-white" />}
      </div>
      <div className="ml-3 flex-1">
        <div className="flex items-center mb-2">
          <span className="p-1.5 rounded bg-gray-100 mr-2">{icon}</span>
          <h4 className="font-semibold text-gray-900">{title}</h4>
        </div>
        <p className="text-sm text-gray-600 mb-2">{description}</p>
        <span className="text-xs text-gray-500">
          Processing time: {processingTime}
        </span>
      </div>
    </div>
  </div>;
}