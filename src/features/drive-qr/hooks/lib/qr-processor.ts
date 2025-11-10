'use client';

import jsQR from 'jsqr';

export const AUDIO_EXTENSIONS = ['.mp3', '.wav', '.m4a', '.aac', '.ogg', '.flac', '.wma'] as const;

export async function scanQrCode(file: File): Promise<string | null> {
  const dataUrl = await readFileAsDataUrl(file);
  if (!dataUrl) {
    return null;
  }

  const image = await loadImage(dataUrl);
  if (!image) {
    return null;
  }

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) {
    return null;
  }

  canvas.width = image.width;
  canvas.height = image.height;
  context.drawImage(image, 0, 0, image.width, image.height);

  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  const code = jsQR(imageData.data, imageData.width, imageData.height);

  return code?.data ?? null;
}

export function isGoogleDriveLink(url: string): boolean {
  const patterns = [/drive\.google\.com/i, /docs\.google\.com/i];
  return patterns.some((pattern) => pattern.test(url));
}

export function detectAudioByNameOrUrl(name: string, url?: string | null): boolean {
  const normalized = [name, url].filter(Boolean).map((value) => value!.toLowerCase());
  return normalized.some((value) =>
    AUDIO_EXTENSIONS.some((extension) => value.includes(extension))
  );
}

async function readFileAsDataUrl(file: File): Promise<string | null> {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = () => {
      resolve(typeof reader.result === 'string' ? reader.result : null);
    };

    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
}

async function loadImage(dataUrl: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = dataUrl;
  });
}
