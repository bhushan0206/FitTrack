export const SESSION_STORAGE_KEY = 'supabase-session';

export interface StoredSession {
  user: any;
  expires_at: number;
}

export const storeSession = (session: StoredSession) => {
  try {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  } catch (error) {
    console.error('Failed to store session:', error);
  }
};

export const getStoredSession = (): StoredSession | null => {
  try {
    const stored = localStorage.getItem(SESSION_STORAGE_KEY);
    if (stored) {
      const session = JSON.parse(stored);
      // Check if session is expired
      if (session.expires_at && session.expires_at * 1000 > Date.now()) {
        return session;
      } else {
        // Session expired, remove it
        localStorage.removeItem(SESSION_STORAGE_KEY);
      }
    }
  } catch (error) {
    console.error('Failed to get stored session:', error);
  }
  return null;
};

export const clearStoredSession = () => {
  try {
    localStorage.removeItem(SESSION_STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear stored session:', error);
  }
};

export const isSessionValid = (session: StoredSession): boolean => {
  return session.expires_at * 1000 > Date.now();
};
