import { getStoredToken } from "@/lib/auth";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000";

/**
 * Makes an authenticated request to the FastAPI backend
 * using the current user's JWT token stored in localStorage.
 */
export async function fetchFromBackend(path: string, options: RequestInit = {}): Promise<Response> {
  const token = getStoredToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> ?? {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return fetch(`${BACKEND_URL}${path}`, {
    ...options,
    headers,
  });
}

/**
 * Calls the FastAPI login endpoint using OAuth2 form encoding.
 * Returns { access_token } or throws on failure.
 */
export async function loginWithBackend(email: string, password: string): Promise<{ access_token: string }> {
  const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ username: email, password }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail ?? "Login failed");
  }
  return res.json();
}

/**
 * Calls the FastAPI register endpoint.
 * Returns the created user or throws on failure.
 */
export async function registerWithBackend(
  email: string,
  password: string,
  fullName: string
): Promise<{ id: string; email: string; full_name: string; active_plan: string }> {
  const res = await fetch(`${BACKEND_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, full_name: fullName }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail ?? "Registration failed");
  }
  return res.json();
}

/**
 * Fetches the current user's profile from MongoDB via the backend /me endpoint.
 * Accepts an optional token — useful right after login before the token is stored.
 */
export async function fetchCurrentUser(explicitToken?: string): Promise<{ id: string; email: string; full_name: string; active_plan: string } | null> {
  const token = explicitToken ?? getStoredToken();
  if (!token) return null;

  try {
    const res = await fetch(`${BACKEND_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}
