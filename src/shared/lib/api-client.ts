export class HttpError extends Error {
  status: number;
  payload: unknown;
  timestamp: string;
  url: string;

  constructor(status: number, message: string, payload: unknown, url: string) {
    super(message);
    this.status = status;
    this.payload = payload;
    this.timestamp = new Date().toISOString();
    this.url = url;
  }
}

/**
 * Configuração estendida para requisições HTTP com suporte a retry e timeout
 */
export interface FetchApiConfig extends RequestInit {
  /** Timeout em milissegundos (padrão: 30000) */
  timeout?: number;
  /** Número máximo de tentativas (padrão: 3) */
  maxRetries?: number;
  /** Delay inicial para retry em ms (padrão: 1000) */
  retryDelay?: number;
  /** Se deve fazer retry em erros 5xx (padrão: true) */
  retryOn5xx?: boolean;
  /** Se deve fazer log de erros (padrão: true) */
  logErrors?: boolean;
}

const DEFAULT_BASE_URL = (() => {
  if (typeof window === "undefined") {
    return (
      process.env.API_BASE_URL ??
      process.env.NEXT_PUBLIC_API_BASE_URL ??
      "http://localhost:9000/api/v1"
    );
  }

  return (
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    "http://localhost:9000/api/v1"
  );
})();

export function resolveApiUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  if (path.startsWith("/")) {
    return `${DEFAULT_BASE_URL}${path}`;
  }

  return `${DEFAULT_BASE_URL}/${path}`;
}

/**
 * Função auxiliar para criar delays entre retries
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Verifica se o erro é um erro de rede
 */
function isNetworkError(error: unknown): boolean {
  if (error instanceof TypeError) {
    return true;
  }
  if (error instanceof Error) {
    return (
      error.message.includes("fetch") ||
      error.message.includes("network") ||
      error.message.includes("Failed to fetch")
    );
  }
  return false;
}

/**
 * Registra erro no console com informações detalhadas
 */
function logError(
  url: string,
  status: number,
  message: string,
  attempt: number
): void {
  const timestamp = new Date().toISOString();
  console.error(
    `[API Client] ${timestamp} | Status: ${status} | Attempt: ${attempt} | URL: ${url} | Error: ${message}`
  );
}

/**
 * Função interna que implementa retry logic com exponential backoff
 */
async function fetchWithRetry<TResponse>(
  url: string,
  config: FetchApiConfig,
  attempt: number = 1
): Promise<TResponse> {
  const {
    timeout = 30000,
    maxRetries = 3,
    retryDelay = 1000,
    retryOn5xx = true,
    logErrors = true,
    ...fetchOptions
  } = config;

  try {
    // Implementar AbortController para timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const contentType = response.headers.get("content-type");
    const payload =
      contentType && contentType.includes("application/json")
        ? await response.json()
        : await response.text();

    // Lógica de retry baseada em status code
    if (!response.ok) {
      const message =
        (typeof payload === "object" &&
          payload &&
          "detail" in payload &&
          (payload as { detail: string }).detail) ||
        response.statusText ||
        "Unexpected API error";

      // Verificar se deve fazer retry
      const shouldRetry =
        retryOn5xx &&
        response.status >= 500 &&
        response.status < 600 &&
        attempt < maxRetries;

      // Retry em rate limit (429)
      const shouldRetryRateLimit =
        response.status === 429 && attempt < maxRetries;

      if (shouldRetry || shouldRetryRateLimit) {
        const delay = retryDelay * Math.pow(2, attempt - 1); // Exponential backoff
        
        if (logErrors) {
          logError(url, response.status, message, attempt);
        }

        await sleep(delay);
        return fetchWithRetry<TResponse>(url, config, attempt + 1);
      }

      // Não faz retry em 4xx (exceto 429)
      throw new HttpError(response.status, message, payload, url);
    }

    return payload as TResponse;
  } catch (error) {
    // Timeout error
    if (error instanceof Error && error.name === "AbortError") {
      if (logErrors) {
        console.error(`[API Client] Timeout after ${timeout}ms: ${url}`);
      }
      throw new HttpError(408, "Request timeout", { timeout }, url);
    }

    // Retry em erros de rede
    if (attempt < maxRetries && isNetworkError(error)) {
      const delay = retryDelay * Math.pow(2, attempt - 1);
      
      if (logErrors) {
        const message = error instanceof Error ? error.message : "Network error";
        console.error(
          `[API Client] ${new Date().toISOString()} | Network Error | Attempt: ${attempt} | URL: ${url} | Error: ${message}`
        );
      }

      await sleep(delay);
      return fetchWithRetry<TResponse>(url, config, attempt + 1);
    }

    // Re-throw outros erros
    throw error;
  }
}

/**
 * Função principal para fazer requisições HTTP ao backend FastAPI
 * Suporta retry automático, timeout configurável e exponential backoff
 */
export async function fetchApi<TResponse>(
  path: string,
  init: RequestInit | FetchApiConfig = {}
): Promise<TResponse> {
  const url = resolveApiUrl(path);

  const config: FetchApiConfig = {
    cache: "no-store",
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  };

  return fetchWithRetry<TResponse>(url, config);
}

export function getApiBaseUrl(): string {
  return DEFAULT_BASE_URL;
}
export { fetchApi as apiFetch, HttpError as ApiError };
