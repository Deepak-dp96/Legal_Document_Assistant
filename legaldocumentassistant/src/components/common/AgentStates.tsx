import React from 'react';
import { AlertCircle, RefreshCw, Loader2 } from 'lucide-react';

interface AgentErrorStateProps {
  error: string;
  retryCount?: number;
  onRetry: () => void;
  loading?: boolean;
  agentName?: string;
}

export const AgentErrorState: React.FC<AgentErrorStateProps> = ({
  error,
  retryCount = 0,
  onRetry,
  loading = false,
  agentName = 'Agent'
}) => {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
      < div className="flex items-start" >
        <div className="flex-shrink-0">
          <AlertCircle className="h-6 w-6 text-red-600" />
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-red-800">
            {agentName} Processing Failed
          </h3>
          <div className="mt-2 text-sm text-red-700">
            <p>{error}</p>
            {retryCount > 0 && (
              <p className="mt-1 text-xs text-red-600">
                Retry attempts: {retryCount}
              </p>
            )}
          </div>
          <div className="mt-4">
            <button
              onClick={onRetry}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin h-4 w-4 mr-2" />
                  Retrying...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry Processing
                </>
              )}
            </button>
          </div>
        </div>
      </div >
    </div >
  );
};

interface AgentLoadingStateProps {
  agentName?: string;
  message?: string;
}

export const AgentLoadingState: React.FC<AgentLoadingStateProps> = ({
  agentName = 'Agent',
  message = 'Processing your document...'
}) => {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
      <div className="flex items-center">
        <Loader2 className="animate-spin h-6 w-6 text-blue-600 mr-3" />
        <div>
          <h3 className="text-sm font-medium text-blue-800">
            {agentName} Processing
          </h3>
          <p className="mt-1 text-sm text-blue-700">{message}</p>
        </div>
      </div>
    </div>
  );
};

interface AgentNoDataStateProps {
  agentName?: string;
  onProcess: () => void;
  loading?: boolean;
}

export const AgentNoDataState: React.FC<AgentNoDataStateProps> = ({
  agentName = 'Agent',
  onProcess,
  loading = false
}) => {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
      <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
      <h3 className="mt-2 text-sm font-medium text-gray-900">
        No {agentName} Analysis Available
      </h3>
      <p className="mt-1 text-sm text-gray-500">
        This document hasn't been analyzed by the {agentName} agent yet.
      </p>
      <div className="mt-6">
        <button
          onClick={onProcess}
          disabled={loading}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin h-4 w-4 mr-2" />
              Processing...
            </>
          ) : (
            <>
              Start {agentName} Analysis
            </>
          )}
        </button>
      </div>
    </div>
  );
};
