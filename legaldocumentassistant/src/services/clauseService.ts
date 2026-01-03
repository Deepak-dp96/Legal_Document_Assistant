import { apiClient, ApiResponse } from './api';
import { AgentAnalysis, DocumentProcessingResult } from '../types/report';

// Re-export types for compatibility or use AgentAnalysis directly
export type ClauseAnalysisResult = AgentAnalysis;

export const clauseService = {
    /**
     * Analyze document (Synchronous)
     * Calls GET /documents/{id}/report which returns unified analysis
     */
    analyzeDocument: async (documentId: number): Promise<ApiResponse<ClauseAnalysisResult>> => {
        try {
            const response = await apiClient.get<DocumentProcessingResult>(`/documents/${documentId}`);

            // Handle both wrapped ApiResponse and direct JSON
            const result = (response as any).data || response;

            if (result && result.analyses) {
                const clauseAnalysis = result.analyses.find((a: any) => a.agent_type === 'clause');
                if (clauseAnalysis && clauseAnalysis.response) {
                    return {
                        success: true,
                        message: "Analysis complete",
                        data: clauseAnalysis.response
                    };
                }
            }

            return {
                success: false,
                message: "Clause analysis not found in report",
                data: undefined
            };
        } catch (error: any) {
            return {
                success: false,
                message: error.message || "Failed to fetch clause analysis",
                data: undefined
            };
        }
    },

    // Keep these for compatibility if needed
    startExtraction: async (documentId: number) => {
        return clauseService.analyzeDocument(documentId);
    },

    getJobStatus: async (_jobId: string) => {
        return { success: true, message: "Completed", data: { status: 'completed', progress: 100 } } as any;
    },

    getDocumentClauses: async (documentId: number) => {
        const res = await clauseService.analyzeDocument(documentId);
        return { ...res, data: res.data?.detailed_analysis?.clauses };
    },

    downloadClauses: async (clauses: any[]) => {
        // Implementation for downloading clauses
        // This might need to be updated to use backend endpoint or client-side generation
        // For now, we can use client-side generation in the component
        return new Blob([JSON.stringify(clauses, null, 2)], { type: 'application/json' });
    }
};
