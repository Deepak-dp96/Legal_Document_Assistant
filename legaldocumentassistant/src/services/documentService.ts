import { apiClient, apiCall, PaginatedResponse } from './api';

// Document Types
export interface Document {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  uploadedBy: string;
  documentType: 'contract' | 'agreement' | 'policy' | 'legal-document' | 'other';
  status: 'uploaded' | 'processing' | 'processed' | 'failed';
  metadata: {
    pageCount?: number;
    wordCount?: number;
    language?: string;
    confidence?: number;
  };
  privacy: {
    isPrivate: boolean;
    hasWatermark: boolean;
    isConfidential: boolean;
  };
  tags: string[];
  processingHistory: ProcessingHistoryItem[];
  createdAt: string;
  updatedAt: string;
  upload_date?: string; // Backend returns this field
  file_path?: string; // Backend returns this field
  extracted_text?: string;
}

export interface ProcessingHistoryItem {
  agent: 'clause-extraction' | 'risk-detection' | 'drafting' | 'summary';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  startedAt: string;
  completedAt?: string;
  result?: any;
  error?: string;
}

export interface UploadDocumentData {
  privacy?: {
    isPrivate?: boolean;
    hasWatermark?: boolean;
    isConfidential?: boolean;
  };
}

export interface UpdateDocumentData {
  tags?: string[];
  privacy?: {
    isPrivate?: boolean;
    hasWatermark?: boolean;
    isConfidential?: boolean;
  };
}

export interface DocumentQuery {
  page?: number;
  limit?: number;
  status?: string;
  documentType?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Document Service Class
class DocumentService {
  async uploadDocument(file: File, data?: UploadDocumentData): Promise<Document> {
    // Backend returns the document object directly
    return apiCall(() =>
      apiClient.uploadFile<Document>('/documents/upload', file, data)
    );
  }

  async getDocuments(query?: DocumentQuery): Promise<PaginatedResponse<{ documents: Document[] }>> {
    // Fetch documents from backend
    const response = await apiClient.get<any>('/documents', query);

    console.log("Raw API response:", response);

    // Extract documents array from response
    // Handle different response structures:
    // 1. Response.data is an array (most common - backend returns array in data field)
    // 2. Response.data.documents is an array
    // 3. Response.documents is an array
    // 4. Response itself is an array (shouldn't happen with apiClient wrapper)
    let documents: Document[] = [];

    // Check if response.data exists and is an array (most common case)
    if (response.data && Array.isArray(response.data)) {
      documents = response.data;
    }
    // Check if response.data.documents exists
    else if (response.data?.documents && Array.isArray(response.data.documents)) {
      documents = response.data.documents;
    }
    // Check if response.documents exists
    else if (response.documents && Array.isArray(response.documents)) {
      documents = response.documents;
    }
    // If none of the above, response might be the array itself
    else if (Array.isArray(response)) {
      documents = response;
    }

    console.log("Documents extracted:", documents);
    console.log("Documents length:", documents?.length || 0);

    // Wrap in paginated structure to match interface
    return {
      success: true,
      message: 'Documents fetched successfully',
      data: { documents },
      meta: {
        pagination: {
          current: 1,
          pages: 1,
          total: documents?.length || 0,
          limit: documents?.length || 0,
          hasNext: false,
          hasPrev: false,
          next: null,
          prev: null
        }
      }
    };
  }

  async getDocument(id: string): Promise<Document> {
    return apiCall(() =>
      apiClient.get<any>(`/documents/${id}`)
    ).then(data => {
      // Handle both wrapped response and direct document
      if (data.document) {
        return data.document;
      }
      // If the response is the document itself
      return data;
    });
  }

  async updateDocument(id: string, updateData: UpdateDocumentData): Promise<Document> {
    return apiCall(() =>
      apiClient.put<{ document: Document }>(`/documents/${id}`, updateData)
    ).then(data => data.document);
  }

  async deleteDocument(id: string): Promise<void> {
    await apiCall(() =>
      apiClient.delete(`/documents/${id}`)
    );
  }

  async downloadDocument(id: string): Promise<void> {
    const response = await fetch(`${apiClient['baseURL']}/documents/${id}/download`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('deeplex_token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to download document');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = response.headers.get('Content-Disposition')?.split('filename=')[1] || 'document';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  async viewDocument(id: string): Promise<void> {
    // Open document in new tab for inline viewing
    const token = localStorage.getItem('deeplex_token');
    const url = `${apiClient['baseURL']}/documents/${id}/view`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to view document');
    }

    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);

    // Open in new tab
    window.open(blobUrl, '_blank');

    // Clean up after a delay to ensure the tab has loaded
    setTimeout(() => {
      window.URL.revokeObjectURL(blobUrl);
    }, 1000);
  }
}

export const documentService = new DocumentService();