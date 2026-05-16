const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8091";

export class ApiError extends Error {
  status: number;
  payload: unknown;
  constructor(status: number, message: string, payload: unknown) {
    super(message);
    this.status = status;
    this.payload = payload;
  }
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("access_token");
}

function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("refresh_token");
}

function storeTokens(accessToken: string, refreshToken?: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem("access_token", accessToken);
  if (refreshToken) window.localStorage.setItem("refresh_token", refreshToken);
}

function clearTokens() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem("access_token");
  window.localStorage.removeItem("refresh_token");
  window.localStorage.removeItem("user_type");
  window.dispatchEvent(new StorageEvent("storage", { key: "access_token" }));
}

// Single in-flight refresh promise so concurrent 401s don't spam /auth/refresh
let refreshPromise: Promise<string | null> | null = null;

async function attemptRefresh(): Promise<string | null> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) return null;
    try {
      const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
      if (!res.ok) {
        clearTokens();
        return null;
      }
      const data = await res.json();
      storeTokens(data.access_token, data.refresh_token);
      return data.access_token as string;
    } catch {
      clearTokens();
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

type FetchOpts = Omit<RequestInit, "body"> & {
  body?: unknown;
  auth?: boolean;
  _retry?: boolean; // internal: prevent infinite refresh loop
};

export async function apiFetch<T = unknown>(path: string, opts: FetchOpts = {}): Promise<T> {
  const { body, auth = true, headers, _retry = false, ...rest } = opts;
  const finalHeaders = new Headers(headers as HeadersInit | undefined);

  const isFormData = body instanceof FormData;
  if (!isFormData && body !== undefined && !finalHeaders.has("Content-Type")) {
    finalHeaders.set("Content-Type", "application/json");
  }

  if (auth) {
    const token = getToken();
    if (token) finalHeaders.set("Authorization", `Bearer ${token}`);
  }

  const url = path.startsWith("http")
    ? path
    : `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;

  const res = await fetch(url, {
    ...rest,
    headers: finalHeaders,
    body:
      body === undefined
        ? undefined
        : isFormData || typeof body === "string"
        ? (body as BodyInit)
        : JSON.stringify(body),
  });

  // On 401: try a token refresh once, then retry the original request
  if (res.status === 401 && auth && !_retry) {
    const newToken = await attemptRefresh();
    if (newToken) {
      return apiFetch<T>(path, { ...opts, _retry: true });
    }
    // Refresh failed — clear everything and redirect to home
    clearTokens();
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
    throw new ApiError(401, "Session expired. Please log in again.", null);
  }

  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const data = isJson
    ? await res.json().catch(() => null)
    : await res.text().catch(() => null);

  if (!res.ok) {
    const message =
      (isJson &&
        data &&
        typeof data === "object" &&
        "detail" in (data as Record<string, unknown>) &&
        String((data as Record<string, unknown>).detail)) ||
      (typeof data === "string" && data) ||
      `Request failed with status ${res.status}`;
    throw new ApiError(res.status, message, data);
  }

  return data as T;
}

export const api = {
  get: <T = unknown>(path: string, opts: FetchOpts = {}) =>
    apiFetch<T>(path, { ...opts, method: "GET" }),
  post: <T = unknown>(path: string, body?: unknown, opts: FetchOpts = {}) =>
    apiFetch<T>(path, { ...opts, method: "POST", body }),
  patch: <T = unknown>(path: string, body?: unknown, opts: FetchOpts = {}) =>
    apiFetch<T>(path, { ...opts, method: "PATCH", body }),
  put: <T = unknown>(path: string, body?: unknown, opts: FetchOpts = {}) =>
    apiFetch<T>(path, { ...opts, method: "PUT", body }),
  delete: <T = unknown>(path: string, opts: FetchOpts = {}) =>
    apiFetch<T>(path, { ...opts, method: "DELETE" }),
};

export { API_BASE };