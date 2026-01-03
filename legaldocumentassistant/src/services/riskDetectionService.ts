import { apiClient, apiCall, PaginatedResponse } from './api';

// Risk Detection Types
export interface RiskItem {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  location: string;
  recommendation: string;
  impact: 'Financial' | 'Legal' | 'Operational' | 'Compliance' | 'Reputational';
  category: 'liability' | 'intellectual-property' | 'termination' | 'payment' | 'confidentiality' | 'compliance' | 'other';
  confidence?: number;
  riskScore: number;
}

export interface RiskAnalysis {
  id: string;
  document: {
    id: string;
    originalName: string;
    documentType: string;
    createdAt: string;
  };
  analyzedBy: string;
  overallRiskScore: number;
  riskLevel: 'low' | 'moderate' | 'high' | 'critical';
  risks: RiskItem[];
  summary: {
    totalRisks: number;
    highRisks: number;
    mediumRisks: number;
    lowRisks: number;
    criticalRisks: number;
  };
  analysisMetadata: {
    processingTime: number;
    aiModel: string;
    version: string;
    confidence: number;
  };
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RiskAnalysisQuery {
  page?: number;
  limit?: number;
  status?: string;
  riskLevel?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface UpdateRiskData {
  severity?: 'low' | 'medium' | 'high' | 'critical';
  title?: string;
  description?: string;
  recommendation?: string;
  impact?: 'Financial' | 'Legal' | 'Operational' | 'Compliance' | 'Reputational';
  category?: 'liability' | 'intellectual-property' | 'termination' | 'payment' | 'confidentiality' | 'compliance' | 'other';
}

export interface RiskStatistics {
  totalAnalyses: number;
  averageRiskScore: number;
  riskDistribution: {
    low: number;
    moderate: number;
    high: number;
    critical: number;
  };
  commonRiskCategories: Record<string, number>;
  recentAnalyses: RiskAnalysis[];
}

// Risk Detection Service Class
class RiskDetectionService {
  async analyzeDocument(documentId: string): Promise<{ analysisId: string; status: string }> {
    return apiCall(() => 
      apiClient.post<{ analysisId: string; status: string }>(`/risk-detection/analyze/${documentId}`)
    );
  }

  async getAnalysis(analysisId: string): Promise<RiskAnalysis> {
    return apiCall(() => 
      apiClient.get<{ analysis: RiskAnalysis }>(`/risk-detection/analysis/${analysisId}`)
    ).then(data => data.analysis);
  }

  async getDocumentAnalysis(documentId: string): Promise<RiskAnalysis> {
    return apiCall(() => 
      apiClient.get<{ analysis: RiskAnalysis }>(`/risk-detection/document/${documentId}`)
    ).then(data => data.analysis);
  }

  async getAnalyses(query?: RiskAnalysisQuery): Promise<PaginatedResponse<{ analyses: RiskAnalysis[] }>> {
    const response = await apiClient.get<{ analyses: RiskAnalysis[] }>('/risk-detection/analyses', query);
    return response as PaginatedResponse<{ analyses: RiskAnalysis[] }>;
  }

  async getStatistics(): Promise<RiskStatistics> {
    return apiCall(() => 
      apiClient.get<{ statistics: RiskStatistics }>('/risk-detection/statistics')
    ).then(data => data.statistics);
  }

  async updateRisk(analysisId: string, riskId: string, updateData: UpdateRiskData): Promise<RiskItem> {
    return apiCall(() => 
      apiClient.put<{ risk: RiskItem }>(`/risk-detection/analysis/${analysisId}/risks/${riskId}`, updateData)
    ).then(data => data.risk);
  }

  async deleteAnalysis(analysisId: string): Promise<void> {
    await apiCall(() => 
      apiClient.delete(`/risk-detection/analysis/${analysisId}`)
    );
  }

  // Helper methods for risk analysis
  getRiskSeverityColor(severity: string): string {
    switch (severity) {
      case 'critical': return 'text-red-700 bg-red-100 border-red-300';
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  }

  getRiskLevelColor(riskLevel: string): string {
    switch (riskLevel) {
      case 'critical': return 'text-red-700';
      case 'high': return 'text-red-600';
      case 'moderate': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  }

  calculateRiskPercentage(score: number): number {
    return Math.min(100, Math.max(0, score));
  }

  formatProcessingTime(milliseconds: number): string {
    const seconds = Math.floor(milliseconds / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ${seconds % 60}s`;
  }
}

export const riskDetectionService = new RiskDetectionService();