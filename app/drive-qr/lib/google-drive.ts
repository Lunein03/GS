import * as cheerio from 'cheerio';

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

const AUDIO_EXTENSIONS = ['.mp3', '.wav', '.m4a', '.aac', '.ogg', '.flac', '.wma'];

export interface DriveAudioInfo {
  isAudio: boolean;
  proxyPath: string | null;
  downloadUrl: string | null;
  mimeType: string | null;
}

export interface DriveExtractionResult {
  success: boolean;
  fileId: string | null;
  title: string;
  method: string;
  audio: DriveAudioInfo;
}

export async function extractDriveMetadata(url: string): Promise<DriveExtractionResult> {
  const fileId = extractFileId(url);

  if (!fileId) {
    return {
      success: false,
      fileId: null,
      title: 'ID não encontrado no link informado',
      method: 'missing-id',
      audio: buildAudioInfo({ fileId: null, title: null, url }),
    };
  }

  const candidateUrls = buildCandidateUrls(fileId);

  for (const candidate of candidateUrls) {
    try {
      const html = await fetchDriveDocument(candidate);
      if (!html) {
        continue;
      }

      const title = extractTitleFromHtml(html);
      const cleanedTitle = cleanTitle(title);

      if (cleanedTitle && cleanedTitle.length > 1 && !cleanedTitle.toLowerCase().includes('sign in')) {
        return {
          success: true,
          fileId,
          title: cleanedTitle,
          method: 'nodejs-scraping',
          audio: buildAudioInfo({ fileId, title: cleanedTitle, url }),
        };
      }
    } catch (error) {
      console.error('Erro ao tentar extrair título do Google Drive', error);
      continue;
    }
  }

  const fallbackTitle = buildFallbackTitle(fileId);
  return {
    success: false,
    fileId,
    title: fallbackTitle,
    method: 'fallback',
    audio: buildAudioInfo({ fileId, title: fallbackTitle, url }),
  };
}

function extractFileId(url: string): string | null {
  const patterns = [
    /\/file\/d\/([a-zA-Z0-9-_]+)/,
    /\/document\/d\/([a-zA-Z0-9-_]+)/,
    /\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/,
    /\/presentation\/d\/([a-zA-Z0-9-_]+)/,
    /\/folders\/([a-zA-Z0-9-_]+)/,
    /[?&]id=([a-zA-Z0-9-_]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match?.[1]) {
      return match[1];
    }
  }

  const fallbackMatch = url.match(/([a-zA-Z0-9-_]{25,})/);
  return fallbackMatch?.[1] ?? null;
}

function buildCandidateUrls(fileId: string): string[] {
  return [
    `https://drive.google.com/file/d/${fileId}/view`,
    `https://drive.google.com/open?id=${fileId}`,
    `https://docs.google.com/document/d/${fileId}/edit`,
    `https://docs.google.com/spreadsheets/d/${fileId}/edit`,
    `https://docs.google.com/presentation/d/${fileId}/edit`,
  ];
}

async function fetchDriveDocument(url: string): Promise<string | null> {
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'User-Agent': USER_AGENT,
    },
    cache: 'no-store',
    redirect: 'follow',
  });

  if (!response.ok) {
    return null;
  }

  return await response.text();
}

function extractTitleFromHtml(html: string): string {
  const $ = cheerio.load(html);
  const candidates = [
    $('title').first().text(),
    $('meta[property="og:title"]').attr('content'),
    $('meta[name="title"]').attr('content'),
  ];

  return candidates.find((value) => value && value.trim().length > 0)?.trim() ?? '';
}

function cleanTitle(title: string): string {
  return title
    .replace(/\s*-\s*Google\s+(Drive|Docs|Sheets|Slides).*$/i, '')
    .replace(/Google\s+(Drive|Docs|Sheets|Slides)/gi, '')
    .replace(/^\s*-\s*/, '')
    .replace(/\s*-\s*$/, '')
    .trim();
}

function buildFallbackTitle(fileId: string): string {
  const shortId = fileId.length > 12 ? `${fileId.slice(0, 8)}...${fileId.slice(-4)}` : fileId;
  return `Arquivo do Google Drive (${shortId})`;
}

function buildAudioInfo({
  fileId,
  title,
  url,
}: {
  fileId: string | null;
  title: string | null;
  url?: string | null;
}): DriveAudioInfo {
  if (!fileId) {
    return {
      isAudio: false,
      proxyPath: null,
      downloadUrl: null,
      mimeType: null,
    };
  }

  const normalizedInputs = [title, url].filter(Boolean).map((value) => value!.toLowerCase());
  const isAudio = normalizedInputs.some((value) =>
    AUDIO_EXTENSIONS.some((extension) => value.includes(extension))
  );

  if (!isAudio) {
    return {
      isAudio: false,
      proxyPath: null,
      downloadUrl: null,
      mimeType: null,
    };
  }

  const mimeType = detectMimeType(title);

  return {
    isAudio: true,
    proxyPath: `/drive-qr/api/drive/audio/${fileId}`,
    downloadUrl: buildDriveDownloadUrl(fileId),
    mimeType,
  };
}

function buildDriveDownloadUrl(fileId: string): string {
  return `https://drive.usercontent.google.com/uc?id=${fileId}&export=download`;
}

function detectMimeType(title: string | null): string {
  if (!title) {
    return 'audio/mpeg';
  }

  const normalized = title.toLowerCase();
  const mimeTypeMap: Record<string, string> = {
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
    '.m4a': 'audio/mp4',
    '.aac': 'audio/aac',
    '.ogg': 'audio/ogg',
    '.flac': 'audio/flac',
    '.wma': 'audio/x-ms-wma',
  };

  for (const [extension, mimeType] of Object.entries(mimeTypeMap)) {
    if (normalized.includes(extension)) {
      return mimeType;
    }
  }

  return 'audio/mpeg';
}
