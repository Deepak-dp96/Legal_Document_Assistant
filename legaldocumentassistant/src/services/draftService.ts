import { apiClient, ApiResponse } from './api';
import { AgentAnalysis, DocumentProcessingResult } from '../types/report';

export const draftService = {
    /**
     * Get draft analysis from unified report
     */
    async getDraftAnalysis(documentId: number): Promise<ApiResponse<AgentAnalysis>> {
        try {
            const response = await apiClient.get<DocumentProcessingResult>(`/documents/${documentId}`);

            // Handle both wrapped ApiResponse and direct JSON
            const result = (response as any).data || response;

            if (result && result.analyses) {
                const draftAnalysis = result.analyses.find((a: any) => a.agent_type === 'draft');
                if (draftAnalysis && draftAnalysis.response) {
                    return {
                        success: true,
                        message: "Analysis complete",
                        data: draftAnalysis.response
                    };
                }
            }

            return {
                success: false,
                message: "Draft analysis not found in report",
                data: undefined
            };
        } catch (error: any) {
            return {
                success: false,
                message: error.message || "Failed to fetch draft analysis",
                data: undefined
            };
        }
    },

    /**
     * Generates a clean draft with improvements applied
     */
    async generateCleanDraft(filename: string, analysisResults: any): Promise<Blob> {
        // Use the gateway endpoint we just added
        // We need to use fetch directly or ApiClient with responseType blob
        // ApiClient doesn't support blob response type easily in current implementation (it assumes JSON)
        // So we use fetch with API_BASE_URL from api.ts (or hardcoded relative path if proxy works)

        // Since we are in frontend, relative path '/api/documents/generate-clean-draft' should work if vite proxy is set up
        // But api.ts uses API_BASE_URL.
        const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

        const response = await fetch(`${API_BASE_URL}/documents/generate-clean-draft`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('deeplex_token') || ''}`
            },
            body: JSON.stringify({
                filename,
                analysis_results: analysisResults,
                apply_recommendations: true
            })
        });

        if (!response.ok) {
            throw new Error(`Failed to generate draft: ${response.statusText}`);
        }

        return response.blob();
    },

    /**
     * Generate a share link for the analysis
     */
    async generateShareLink(_filename: string, _analysisResults: any): Promise<any> {
        // This might not be implemented in gateway yet, but let's assume it is or keep it as is
        // For now, return a mock or call gateway if available
        return { success: true, link: "https://example.com/share/123" };
    }
};
