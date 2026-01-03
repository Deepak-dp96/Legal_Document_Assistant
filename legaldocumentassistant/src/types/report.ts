export interface AgentAnalysis {
    agent_name: string;
    model_used: string;
    is_legal_document: boolean;
    document_type: string;
    confidence_percentage: number;
    risk_percentage: number;
    categories: string[];
    tags: string[];
    key_insights: any[]; // We can refine this later if needed
    summary: string;
    ai_suggestions: any[]; // We can refine this later if needed
    detailed_analysis: any; // Specific structure per agent
}

export interface AnalysisResult {
    agent_type: string;
    response: AgentAnalysis;
    success: boolean;
    extracted_text?: string;
    model_used?: string | null;
    ai_provider?: string | null;
    user_id?: number;
    document_id?: number;
    created_at?: string;
    id?: number;
    error?: string | null;
    meta_data?: any;
    retry_count?: number;
}

export interface DocumentMetadata {
    file_path: string;
    id: number;
    user_id: number;
    upload_date: string;
    filename: string;
    extracted_text: string;
}

export interface ReportMetadata {
    id: number;
    document_id: number;
    created_at: string;
    user_id: number;
    agent_type: string;
    file_path: string;
}

export interface DocumentProcessingResult {
    document: DocumentMetadata;
    analyses: AnalysisResult[];
    report: ReportMetadata;
}
