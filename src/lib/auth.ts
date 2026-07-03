export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  surveyCompleted?: boolean;
  activePlan?: string;
  token: string; // JWT from FastAPI
}

const STORAGE_KEY = "echocare-user";

export function getStoredUser(): UserProfile | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as UserProfile;
  } catch {
    return null;
  }
}

export function getStoredToken(): string | null {
  return getStoredUser()?.token ?? null;
}

export function storeUser(user: UserProfile) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

export function clearStoredUser() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}

export function markSurveyCompleted() {
  const user = getStoredUser();
  if (user) {
    storeUser({ ...user, surveyCompleted: true });
  }
}
