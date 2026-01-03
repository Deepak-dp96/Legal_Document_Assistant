import { apiClient, ApiResponse } from './api';
import { DocumentProcessingResult, AgentAnalysis } from '../types/report';

export type SummaryAnalysisResult = AgentAnalysis;

class SummaryService {
    async uploadAndAnalyze(file: File): Promise<DocumentProcessingResult> {
        // The backend returns the unified result
        const response = await apiClient.uploadFile<DocumentProcessingResult>('/documents/upload', file);
        if (response.success && response.data) {
            return response.data;
        }
        throw new Error(response.message || 'Upload failed');
    }

    async getSummary(docId: string): Promise<ApiResponse<AgentAnalysis>> {
        try {
            const response = await apiClient.get<DocumentProcessingResult>(`/documents/${docId}`);

            // Handle both wrapped ApiResponse and direct JSON
            const result = (response as any).data || response;

            if (result && result.analyses) {
                const summaryAnalysis = result.analyses.find((a: any) => a.agent_type === 'summary');
                if (summaryAnalysis && summaryAnalysis.response) {
                    return {
                        success: true,
                        message: "Analysis complete",
                        data: summaryAnalysis.response
                    };
                }
            }

            return {
                success: false,
                message: "Summary analysis not found in report",
                data: undefined
            };
        } catch (error: any) {
            return {
                success: false,
                message: error.message || "Failed to fetch summary",
                data: undefined
            };
        }
    }
}

export const summaryService = new SummaryService();
