// API v2 base URL - no authentication required
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_SNANIME_API_URL || "http://localhost:3000";

type ApiEnvelope<T> = {
  success: boolean;
  message: string;
  data: T;
};

// Auth token storage - for StackAuth integration (user features only)
export function getStoredAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem("snanime.accessToken");
  } catch {
    return null;
  }
}

export function storeAccessToken(token: string | null) {
  if (typeof window === "undefined") return;
  try {
    if (!token) localStorage.removeItem("snanime.accessToken");
    else localStorage.setItem("snanime.accessToken", token);
  } catch {
    // ignore
  }
}

/**
 * Make API request to the backend
 * Note: Anime API v2 does NOT require authentication
 * Auth is only used for user-specific features (watchlist, etc.)
 */
export async function apiRequest<T>(
  path: string,
  init: RequestInit & { auth?: boolean } = {}
): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");
  headers.set("Accept", "application/json");

  // Only add auth header if explicitly requested (for user features)
  const token = init.auth ? getStoredAccessToken() : null;
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(url, {
    ...init,
    headers,
    cache: 'no-store',
  });

  const json = (await res.json()) as ApiEnvelope<T> | { message?: string };
  if (!res.ok) {
    const msg = (json as any)?.message || `Request failed (${res.status})`;
    throw new Error(msg);
  }

  // API v2 returns data directly, not wrapped in envelope
  return (json as any).data ?? (json as any);
}
