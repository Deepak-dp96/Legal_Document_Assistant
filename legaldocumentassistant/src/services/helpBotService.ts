import { apiClient, ApiResponse } from './api';

export interface HelpBotMessage {
  message: string;
  context?: string;
}

export interface HelpBotResponse {
  response: string;
  suggestions?: string[];
  context?: string;
}

export interface RiskExplanation {
  term: string;
  explanation: string;
  risk_level: string;
  alternatives: string[];
}

export class HelpBotService {
  // Send message to help bot
  static async sendMessage(message: string, context?: string): Promise<HelpBotResponse> {
    try {
      const response: ApiResponse<HelpBotResponse> = await apiClient.post('/help-bot/chat', {
        message,
        context
      });
      
      if (response.success && response.data) {
        return response.data;
      }
      
      // Fallback to local responses if API fails
      return this.getLocalResponse(message);
    } catch (error) {
      console.warn('Help bot API unavailable, using local responses:', error);
      return this.getLocalResponse(message);
    }
  }

  // Get risk term explanation
  static async explainRiskTerm(term: string): Promise<RiskExplanation> {
    try {
      const response: ApiResponse<RiskExplanation> = await apiClient.post('/risk/explain-term', {
        term
      });
      
      if (response.success && response.data) {
        return response.data;
      }
      
      throw new Error('Failed to get risk explanation');
    } catch (error) {
      console.warn('Risk explanation API unavailable:', error);
      return this.getLocalRiskExplanation(term);
    }
  }

  // Get document analysis suggestions
  static async getAnalysisSuggestions(text: string): Promise<any> {
    try {
      const response: ApiResponse<any> = await apiClient.post('/risk/analyze-suggestions', {
        text
      });
      
      if (response.success && response.data) {
        return response.data;
      }
      
      throw new Error('Failed to get analysis suggestions');
    } catch (error) {
      console.warn('Analysis suggestions API unavailable:', error);
      return this.getLocalAnalysisSuggestions(text);
    }
  }

  // Local fallback responses
  private static getLocalResponse(message: string): HelpBotResponse {
    const msg = message.toLowerCase();
    
    if (msg.includes('risky') || msg.includes('risk')) {
      return {
        response: "🔍 Risky terms are words that could create legal liability. I can analyze your document and suggest safer alternatives. Would you like me to explain specific risky terms?",
        suggestions: ["Explain specific terms", "Upload document for analysis", "View risk categories"]
      };
    } else if (msg.includes('upload') || msg.includes('document')) {
      return {
        response: "📤 To upload a document: 1) Click 'Upload Document' 2) Select your file 3) Wait for analysis 4) Review highlighted risky terms. Would you like help with any specific step?",
        suggestions: ["Go to upload page", "Supported file formats", "Analysis process"]
      };
    } else if (msg.includes('alternative') || msg.includes('suggestion')) {
      return {
        response: "💡 I provide multiple safer alternatives for each risky term, explaining why each option is better. Click any highlighted word to see suggestions!",
        suggestions: ["View example alternatives", "Risk scoring system", "How to apply suggestions"]
      };
    } else if (msg.includes('export') || msg.includes('download')) {
      return {
        response: "📥 You can export your improved document in multiple formats: PDF, Word, or plain text. Go to 'Export' section after reviewing suggestions.",
        suggestions: ["Export formats", "Go to export page", "Download history"]
      };
    } else if (msg.includes('help') || msg.includes('how')) {
      return {
        response: "🤖 I can help with: analyzing risky terms, suggesting alternatives, explaining legal risks, document upload/export. What specific area interests you?",
        suggestions: ["Risk analysis", "Document upload", "Export options", "Legal explanations"]
      };
    } else {
      return {
        response: "🤔 I understand you're asking about legal document analysis. Could you be more specific? I can help with risky terms, document upload, suggestions, or export options.",
        suggestions: ["Risk terms", "Upload process", "Alternatives", "Export options"]
      };
    }
  }

  private static getLocalRiskExplanation(term: string): RiskExplanation {
    return {
      term,
      explanation: `The term "${term}" may create legal risks in your document. Consider using safer alternatives.`,
      risk_level: "medium",
      alternatives: ["safer alternative 1", "safer alternative 2", "safer alternative 3"]
    };
  }

  private static getLocalAnalysisSuggestions(text: string): any {
    return {
      risk_score: 25,
      risk_level: "low",
      suggestions: [
        {
          original: "risky term",
          alternatives: ["safer option 1", "safer option 2"],
          explanation: "This term could create liability"
        }
      ]
    };
  }
}