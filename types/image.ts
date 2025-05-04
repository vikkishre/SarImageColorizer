export interface ProcessedImage {
    id: string;
    originalUrl: string;
    colorizedUrl?: string;
    createdAt: Date;
    status: 'processing' | 'completed' | 'failed';
  }