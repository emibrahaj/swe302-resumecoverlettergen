const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8091";

// If the configured host is unreachable from the browser (Chrome/Edge sometimes
// block loopback requests when the page is on `localhost` but fetch targets
// `127.0.0.1`, or vice versa), automatically retry on the alternate loopback
// host. Once we discover a working host, we stick with it for subsequent calls.
const FALLBACK_API_BASE: string | null = (() => {
  try {
    const u = new URL(API_BASE);
    if (u.hostname === "127.0.0.1") {
      u.hostname = "localhost";
      return u.toString().replace(/\/$/, "");
    }
    if (u.hostname === "localhost") {
      u.hostname = "127.0.0.1";
      return u.toString().replace(/\/$/, "");
    }
    return null;
  } catch {
    return null;
  }
})();

let effectiveBase = API_BASE;
let baseDiscoveryFailed = false;

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
      const res = await fetch(`${effectiveBase}/auth/refresh`, {
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

  const buildUrl = (base: string) =>
    path.startsWith("http") ? path : `${base}${path.startsWith("/") ? path : `/${path}`}`;

  const fetchOptions: RequestInit = {
    ...rest,
    headers: finalHeaders,
    body:
      body === undefined
        ? undefined
        : isFormData || typeof body === "string"
        ? (body as BodyInit)
        : JSON.stringify(body),
  };

  let res: Response;
  try {
    res = await fetch(buildUrl(effectiveBase), fetchOptions);
  } catch (err) {
    // fetch only throws on network-level failures. If we haven't yet tried the
    // alternate loopback host (localhost ↔ 127.0.0.1), swap and retry once.
    if (
      !baseDiscoveryFailed
      && FALLBACK_API_BASE
      && effectiveBase !== FALLBACK_API_BASE
      && !path.startsWith("http")
    ) {
      try {
        res = await fetch(buildUrl(FALLBACK_API_BASE), fetchOptions);
        effectiveBase = FALLBACK_API_BASE;
      } catch {
        baseDiscoveryFailed = true;
        throw err;
      }
    } else {
      throw err;
    }
  }

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

/**
 * Fetch a binary response (e.g. a generated PDF) as a Blob, reusing the same
 * resilience the JSON client has: the localhost↔127.0.0.1 loopback fallback, the
 * bearer token, and a single 401→refresh retry. The PDF download buttons used a
 * raw `fetch(NEXT_PUBLIC_API_URL…)` that had none of this, so a loopback-host
 * mismatch surfaced to the user as an opaque "failed to fetch".
 */
export async function apiBlob(
  path: string,
  opts: { auth?: boolean } = {},
): Promise<Blob> {
  const { auth = true } = opts;

  const buildUrl = (base: string) =>
    path.startsWith("http") ? path : `${base}${path.startsWith("/") ? path : `/${path}`}`;

  const doFetch = async (token: string | null): Promise<Response> => {
    const headers = new Headers();
    if (auth && token) headers.set("Authorization", `Bearer ${token}`);
    try {
      return await fetch(buildUrl(effectiveBase), { headers });
    } catch (err) {
      if (
        !baseDiscoveryFailed
        && FALLBACK_API_BASE
        && effectiveBase !== FALLBACK_API_BASE
        && !path.startsWith("http")
      ) {
        try {
          const res = await fetch(buildUrl(FALLBACK_API_BASE), { headers });
          effectiveBase = FALLBACK_API_BASE;
          return res;
        } catch {
          baseDiscoveryFailed = true;
          throw err;
        }
      }
      throw err;
    }
  };

  let res = await doFetch(auth ? getToken() : null);

  if (res.status === 401 && auth) {
    const newToken = await attemptRefresh();
    if (newToken) {
      res = await doFetch(newToken);
    } else {
      clearTokens();
      if (typeof window !== "undefined") window.location.href = "/";
      throw new ApiError(401, "Session expired. Please log in again.", null);
    }
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new ApiError(res.status, text || `Request failed with status ${res.status}`, text);
  }

  return res.blob();
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