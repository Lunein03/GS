import { URL } from 'url';

export interface DriveExtractionResult {
  success: boolean;
  fileId: string | null;
  title: string;
  method: 'parsed-id' | 'fallback' | 'error';
  audio: {
    isAudio: boolean;
    proxyPath: string | null;
    downloadUrl: string | null;
    mimeType: string | null;
  };
}

const DRIVE_PATTERNS = [
  /https?:\/\/drive\.google\.com\/file\/d\/([^/?]+)/i,
  /https?:\/\/drive\.google\.com\/open\?id=([^&]+)/i,
  /https?:\/\/drive\.google\.com\/uc\?id=([^&]+)/i,
  /https?:\/\/drive\.google\.com\/u\/\d+\/uc\?id=([^&]+)/i,
  /https?:\/\/drive\.google\.com\/drive\/(?:folders|u\/\d+\/folders)\/([^/?]+)/i,
];

function extractIdFromUrl(rawUrl: string): string | null {
  for (const pattern of DRIVE_PATTERNS) {
    const match = rawUrl.match(pattern);
    if (match?.[1]) {
      return match[1];
    }
  }

  try {
    const parsed = new URL(rawUrl);
    const id = parsed.searchParams.get('id');
    if (id) {
      return id;
    }
  } catch (error) {
    // Ignore parsing errors and fall through to null
  }

  return null;
}

export async function extractDriveMetadata(url: string): Promise<DriveExtractionResult> {
  const fileId = extractIdFromUrl(url);

  if (!fileId) {
    return {
      success: false,
      fileId: null,
      title: 'URL inválida ou ID não encontrado',
      method: 'error',
      audio: {
        isAudio: false,
        proxyPath: null,
        downloadUrl: null,
        mimeType: null,
      },
    };
  }

  return {
    success: true,
    fileId,
    title: `Arquivo ${fileId}`,
    method: 'parsed-id',
    audio: {
      isAudio: false,
      proxyPath: null,
      downloadUrl: null,
      mimeType: null,
    },
  };
}
