const globalScope = globalThis as typeof globalThis & {
  File?: typeof File;
  Blob?: typeof Blob;
};

// Using `any` keeps the code compatible with both DOM and Node typings.
const BlobConstructor: any = ensureBlob();

class NodeFile extends BlobConstructor {
  public readonly name: string;
  public readonly lastModified: number;

  constructor(fileBits: BlobPart[], fileName: string, options?: FilePropertyBag) {
    super(fileBits, options);
    this.name = sanitizeFileName(fileName);
    this.lastModified = options?.lastModified ?? Date.now();
  }

  get [Symbol.toStringTag](): string {
    return 'File';
  }
}

function ensureBlob(): any {
  if (typeof globalScope.Blob !== 'undefined') {
    return globalScope.Blob;
  }

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { Blob } = require('buffer') as typeof import('buffer');

  Object.defineProperty(globalScope, 'Blob', {
    configurable: true,
    writable: true,
    value: Blob,
  });

  return Blob;
}

function sanitizeFileName(input: string): string {
  return input.replace(/[\\/:*?"<>|]/g, '_');
}

function ensureFile(): void {
  if (typeof globalScope.File === 'undefined') {
    Object.defineProperty(globalScope, 'File', {
      configurable: true,
      writable: true,
      value: NodeFile,
    });
  }
}

ensureFile();

export {};