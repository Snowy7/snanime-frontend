export const API_BASE_URL =
  process.env.NEXT_PUBLIC_SNANIME_API_URL || "https://snanime-api.snowydev.xyz/api/v1";

type ApiEnvelope<T> = {
  success: boolean;
  message: string;
  data: T;
};

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

export async function apiRequest<T>(
  path: string,
  init: RequestInit & { auth?: boolean } = {}
): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");

  const token = init.auth ? getStoredAccessToken() : null;
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(url, {
    ...init,
    headers,
    credentials: "include",
  });

  const json = (await res.json()) as ApiEnvelope<T> | { message?: string };
  if (!res.ok) {
    const msg = (json as any)?.message || `Request failed (${res.status})`;
    throw new Error(msg);
  }

  // Some endpoints may not wrap in envelope; but backend uses createSuccessResponse consistently.
  return (json as any).data ?? (json as any);
}
