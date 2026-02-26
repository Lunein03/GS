import { URL } from 'url';

export interface DriveExtractionResult {
  success: boolean;
  fileId: string | null;
  title: string;
  method: 'api' | 'oembed' | 'parsed-id' | 'fallback' | 'error';
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

const AUDIO_MIME_PREFIXES = ['audio/'];
const AUDIO_EXTENSIONS = ['.mp3', '.wav', '.m4a', '.aac', '.ogg', '.flac', '.wma', '.opus'];

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
  } catch {
    // Ignore parsing errors and fall through to null
  }

  return null;
}

function isAudioMime(mimeType: string | null): boolean {
  if (!mimeType) return false;
  return AUDIO_MIME_PREFIXES.some((prefix) => mimeType.toLowerCase().startsWith(prefix));
}

function isAudioByName(title: string): boolean {
  const lower = title.toLowerCase();
  return AUDIO_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

interface OEmbedResponse {
  title?: string;
  type?: string;
  provider_name?: string;
}

async function fetchOEmbed(fileId: string): Promise<{ title: string; method: string } | null> {
  try {
    const oembedUrl = `https://drive.google.com/file/d/${fileId}/view`;
    const endpoint = `https://noembed.com/embed?url=${encodeURIComponent(oembedUrl)}`;
    const response = await fetch(endpoint, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) return null;

    const data = (await response.json()) as OEmbedResponse;
    if (data.title && !data.title.includes('error')) {
      return { title: data.title, method: 'oembed' };
    }
  } catch {
    // Fallback silencioso
  }

  return null;
}

async function fetchPageTitle(fileId: string): Promise<{ title: string; mimeType: string | null; method: string } | null> {
  try {
    const viewUrl = `https://drive.google.com/file/d/${fileId}/view`;
    const response = await fetch(viewUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html',
      },
      redirect: 'follow',
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) return null;

    const html = await response.text();

    // Extract title from HTML
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    let title = titleMatch?.[1]?.replace(/ - Google Drive$/i, '').trim() || null;

    // Extract mimeType from meta tags or embedded JSON
    let mimeType: string | null = null;

    const mimeMetaMatch = html.match(/content-type["']?\s*:\s*["']?([^"'\s;,]+)/i);
    if (mimeMetaMatch?.[1] && mimeMetaMatch[1] !== 'text/html') {
      mimeType = mimeMetaMatch[1];
    }

    // Try to find mimeType from Drive's embedded config
    const mimeJsonMatch = html.match(/"mimeType"\s*:\s*"([^"]+)"/);
    if (mimeJsonMatch?.[1]) {
      mimeType = mimeJsonMatch[1];
    }

    // Also try to detect audio from download URLs in the page
    const downloadMatch = html.match(/\/uc\?.*?export=download/);
    if (downloadMatch && title && isAudioByName(title)) {
      mimeType = mimeType || 'audio/mpeg';
    }

    if (title) {
      return { title, mimeType, method: 'api' };
    }
  } catch {
    // Fallback silencioso
  }

  return null;
}

async function resolveRedirects(url: string, maxHops = 5): Promise<string> {
  let currentUrl = url;

  for (let i = 0; i < maxHops; i++) {
    try {
      const response = await fetch(currentUrl, {
        method: 'HEAD',
        redirect: 'manual',
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
        signal: AbortSignal.timeout(5000),
      });

      const location = response.headers.get('location');
      if (location && (response.status === 301 || response.status === 302 || response.status === 303 || response.status === 307 || response.status === 308)) {
        // Handle relative redirects
        currentUrl = location.startsWith('http') ? location : new URL(location, currentUrl).toString();
        console.log(`[drive-qr] Redirect hop ${i + 1}: ${currentUrl}`);
        continue;
      }

      // If response was a normal redirect that fetch auto-followed, check responseURL 
      if (response.url && response.url !== currentUrl) {
        currentUrl = response.url;
      }

      break;
    } catch {
      break;
    }
  }

  return currentUrl;
}

export async function extractDriveMetadata(url: string): Promise<DriveExtractionResult> {
  console.log(`[drive-qr] Processing URL: ${url}`);

  // Try direct extraction first
  let fileId = extractIdFromUrl(url);

  // If direct extraction fails, try resolving redirects
  if (!fileId) {
    console.log(`[drive-qr] Direct ID extraction failed, resolving redirects...`);
    try {
      const resolvedUrl = await resolveRedirects(url);
      console.log(`[drive-qr] Resolved URL: ${resolvedUrl}`);
      fileId = extractIdFromUrl(resolvedUrl);

      if (!fileId) {
        // Last resort: try GET request and check final URL
        const getResponse = await fetch(url, {
          method: 'GET',
          redirect: 'follow',
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          },
          signal: AbortSignal.timeout(8000),
        });

        const finalUrl = getResponse.url;
        console.log(`[drive-qr] GET final URL: ${finalUrl}`);
        fileId = extractIdFromUrl(finalUrl);

        // Also try to extract from the page HTML
        if (!fileId) {
          const html = await getResponse.text();
          // Look for file ID in Drive page source
          const driveIdMatch = html.match(/\/file\/d\/([a-zA-Z0-9_-]{10,})/);
          if (driveIdMatch?.[1]) {
            fileId = driveIdMatch[1];
            console.log(`[drive-qr] Extracted ID from page HTML: ${fileId}`);
          }
        }
      }
    } catch (error) {
      console.error(`[drive-qr] Failed to resolve redirects:`, error);
    }
  }

  if (!fileId) {
    console.log(`[drive-qr] Could not extract file ID from URL: ${url}`);
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

  console.log(`[drive-qr] File ID extracted: ${fileId}`);

  // Try multiple strategies to get metadata
  let title = `Arquivo ${fileId}`;
  let method: DriveExtractionResult['method'] = 'parsed-id';
  let detectedMimeType: string | null = null;

  // Strategy 1: fetch Drive page to get title + mimeType
  const pageResult = await fetchPageTitle(fileId);
  if (pageResult) {
    title = pageResult.title;
    method = pageResult.method as DriveExtractionResult['method'];
    detectedMimeType = pageResult.mimeType;
    console.log(`[drive-qr] Page title: "${title}", mimeType: ${detectedMimeType}`);
  } else {
    // Strategy 2: oEmbed fallback
    const oembedResult = await fetchOEmbed(fileId);
    if (oembedResult) {
      title = oembedResult.title;
      method = oembedResult.method as DriveExtractionResult['method'];
      console.log(`[drive-qr] oEmbed title: "${title}"`);
    }
  }

  // Detect audio by mimeType or by file title extension
  const audioByMime = isAudioMime(detectedMimeType);
  const audioByName = isAudioByName(title);
  const audioDetected = audioByMime || audioByName;

  console.log(`[drive-qr] Audio detection - byMime: ${audioByMime}, byName: ${audioByName}, detected: ${audioDetected}`);

  const downloadUrl = `https://drive.usercontent.google.com/uc?id=${fileId}&export=download`;
  const proxyPath = `/drive-qr/api/drive/audio/${fileId}`;

  return {
    success: true,
    fileId,
    title,
    method,
    audio: {
      isAudio: audioDetected,
      proxyPath: audioDetected ? proxyPath : null,
      downloadUrl: audioDetected ? downloadUrl : null,
      mimeType: detectedMimeType || (audioDetected ? 'audio/mpeg' : null),
    },
  };
}
