import { apiClient } from './api';

export type AgentType = 'clause' | 'risk' | 'summary' | 'draft';

export interface AgentAnalysisResponse {
    success: boolean;
    message: string;
    data: any;
    error: string | null;
    retry_count: number;
    can_retry: boolean;
    model_used?: string;
    ai_provider?: string;
    created_at?: string;
    agent_type?: AgentType;
    is_legal_document?: boolean;
}

class AgentService {
    /**
     * Process a document with a specific agent
     * @param documentId - The document ID to process
     * @param agentType - The type of agent (clause, risk, summary, draft)
     * @returns Promise with the analysis result
     */
    async processDocument(documentId: string | number, agentType: AgentType): Promise<AgentAnalysisResponse> {
        try {
            const response = await apiClient.post<AgentAnalysisResponse>(
                `/documents/${documentId}/process/${agentType}`
            );

            return response.data || response as any;
        } catch (error: any) {
            // Extract error details from response
            const errorMessage = error.response?.data?.detail || error.message || 'Processing failed';

            throw new Error(errorMessage);
        }
    }

    /**
     * Get the latest analysis result for a specific agent
     * @param documentId - The document ID
     * @param agentType - The type of agent
     * @returns Promise with the analysis result or error state
     */
    async getAnalysis(documentId: string | number, agentType: AgentType): Promise<AgentAnalysisResponse> {
        try {
            const response = await apiClient.get<AgentAnalysisResponse>(
                `/documents/${documentId}/analysis/${agentType}`
            );

            return response.data || response as any;
        } catch (error: any) {
            const errorMessage = error.response?.data?.detail || error.message || 'Failed to fetch analysis';

            throw new Error(errorMessage);
        }
    }

    /**
     * Retry processing a document with a specific agent
     * This is the same as processDocument but semantically clearer for retry operations
     */
    async retryProcessing(documentId: string | number, agentType: AgentType): Promise<AgentAnalysisResponse> {
        try {
            const response = await apiClient.post<AgentAnalysisResponse>(
                `/api/retry-agent/${documentId}/${agentType}`
            );

            return response.data || response as any;
        } catch (error: any) {
            const errorMessage = error.response?.data?.detail || error.message || 'Retry failed';
            throw new Error(errorMessage);
        }
    }
}

export const agentService = new AgentService();
