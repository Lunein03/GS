export interface DriveQrAudioPreview {
  url: string;
  type?: string | null;
  durationSeconds?: number | null;
  downloadUrl?: string | null;
}

export interface DriveQrResult {
  id: string;
  fileName: string;
  status: 'processing' | 'success' | 'error';
  imageUrl?: string | null;
  link?: string | null;
  title?: string | null;
  content?: string | null;
  extractionMethod?: string | null;
  fileId?: string | null;
  audio?: DriveQrAudioPreview | null;
  errorMessage?: string | null;
  processedAt?: string | null;
}
