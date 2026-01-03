import { useState, useEffect, useCallback } from 'react';
import { agentService, AgentType, AgentAnalysisResponse } from '../services/agentService';

interface UseAgentProcessingOptions {
    documentId: string | number;
    agentType: AgentType;
    autoFetch?: boolean;
}

interface UseAgentProcessingReturn {
    data: any | null;
    error: string | null;
    loading: boolean;
    processing: boolean;
    retryCount: number;
    canRetry: boolean;
    processDocument: () => Promise<void>;
    retryProcessing: () => Promise<void>;
    refreshAnalysis: () => Promise<void>;
}

export const useAgentProcessing = ({
    documentId,
    agentType,
    autoFetch = true
}: UseAgentProcessingOptions): UseAgentProcessingReturn => {
    const [data, setData] = useState<any | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [retryCount, setRetryCount] = useState(0);
    const [canRetry, setCanRetry] = useState(false);

    // Fetch existing analysis
    const fetchAnalysis = useCallback(async () => {
        if (!documentId) return;

        setLoading(true);
        setError(null);

        try {
            const response = await agentService.getAnalysis(documentId, agentType);

            // Check if response contains valid data or is the data itself
            // We check for success=true OR presence of is_legal_document (even if false)
            if (response.success && response.data) {
                setData(response.data);
                setError(null);
                setCanRetry(false);
            } else if (response.is_legal_document !== undefined) {
                // Response is likely the analysis object itself
                setData(response);
                setError(null);
                setCanRetry(false);
            } else if (response.error) {
                setError(response.error);
                setData(null);
                setCanRetry(response.can_retry);
            } else {
                // No analysis exists yet
                setData(null);
                setError(null);
                setCanRetry(true);
            }

            setRetryCount(response.retry_count || 0);
        } catch (err: any) {
            console.error(`Error fetching ${agentType} analysis:`, err);
            setError(err.message || 'Failed to fetch analysis');
            setCanRetry(true);
        } finally {
            setLoading(false);
        }
    }, [documentId, agentType]);

    // Process document with agent
    const processDocument = useCallback(async () => {
        if (!documentId) return;

        setProcessing(true);
        setError(null);

        try {
            const response = await agentService.processDocument(documentId, agentType);

            if (response.success && response.data) {
                setData(response.data);
                setError(null);
                setCanRetry(false);
            } else {
                setError(response.message || 'Processing failed');
                setCanRetry(true);
            }

            setRetryCount(response.retry_count || 0);
        } catch (err: any) {
            console.error(`Error processing with ${agentType} agent:`, err);
            setError(err.message || 'Processing failed');
            setCanRetry(true);

            // Refresh to get the error state from backend
            await fetchAnalysis();
        } finally {
            setProcessing(false);
        }
    }, [documentId, agentType, fetchAnalysis]);

    // Retry processing
    const retryProcessing = useCallback(async () => {
        await processDocument();
    }, [processDocument]);

    // Refresh analysis (alias for fetchAnalysis)
    const refreshAnalysis = useCallback(async () => {
        await fetchAnalysis();
    }, [fetchAnalysis]);

    // Auto-fetch on mount if enabled
    useEffect(() => {
        if (autoFetch && documentId) {
            fetchAnalysis();
        }
    }, [autoFetch, documentId, fetchAnalysis]);

    return {
        data,
        error,
        loading,
        processing,
        retryCount,
        canRetry,
        processDocument,
        retryProcessing,
        refreshAnalysis
    };
};
