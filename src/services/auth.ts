// Authentication Service
import { supabase } from './supabase';

export interface AuthUser {
  id: string;
  email: string;
  role: string;
}

// Master & Demo account credentials
export const DEMO_CREDENTIALS = {
  email: 'demo@sahamfyp.id',
  password: 'd3m0cu4n',
};

const MASTER_EMAIL = 'fadlirobbi@gmail.com';
const MASTER_PASSWORD = 'Admin@123';

const FIXED_ACCOUNTS = [
  { email: DEMO_CREDENTIALS.email, password: DEMO_CREDENTIALS.password, role: 'admin' },
  { email: MASTER_EMAIL, password: MASTER_PASSWORD, role: 'admin' },
];

// Sign in with email and password
export async function signIn(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();

  // Check fixed accounts first for immediate access
  const matchedAccount = FIXED_ACCOUNTS.find(
    (acc) => acc.email.toLowerCase() === normalizedEmail && acc.password === password
  );

  if (matchedAccount) {
    return {
      user: {
        id: `${matchedAccount.role}-user-id`,
        email: matchedAccount.email,
        role: matchedAccount.role,
      },
      session: null,
    };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  return data;
}

// Sign out
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// Get current user
export async function getCurrentUser(): Promise<AuthUser | null> {
  const { data: { session } } = await supabase.auth.getSession();

  if (session?.user) {
    return {
      id: session.user.id,
      email: session.user.email || '',
      role: session.user.role || 'user',
    };
  }

  // Check for stored master session
  const storedSession = localStorage.getItem('sahamfyp_session');
  if (storedSession) {
    try {
      return JSON.parse(storedSession);
    } catch {
      return null;
    }
  }

  return null;
}

// Check if user is authenticated
export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser();
  return user !== null;
}

// Store master session locally
export function storeMasterSession(user: AuthUser) {
  localStorage.setItem('sahamfyp_session', JSON.stringify(user));
}

// Clear master session
export function clearMasterSession() {
  localStorage.removeItem('sahamfyp_session');
}

// Sign up (for future use)
export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) throw error;
  return data;
}