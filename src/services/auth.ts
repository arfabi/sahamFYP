// Authentication Service
import { supabase } from './supabase';

export interface AuthUser {
  id: string;
  email: string;
  role: string;
}

// Master account credentials
const MASTER_EMAIL = 'fadlirobbi@gmail.com';
const MASTER_PASSWORD = '@Arfabi0707';

// Sign in with email and password
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) {
    // Check if using master account
    if (email === MASTER_EMAIL && password === MASTER_PASSWORD) {
      // Return mock user for master account
      return {
        user: {
          id: 'master-user-id',
          email: MASTER_EMAIL,
          role: 'admin',
        },
        session: null,
      };
    }
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