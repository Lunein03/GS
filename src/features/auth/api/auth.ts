import { supabase } from '@/shared/lib/supabase-client';
import type { LoginFormData, RegisterFormData } from '../domain/validators';

/** Sign in com email e senha */
export async function signInWithEmail({ email, password }: LoginFormData) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

/** Sign up com email, senha e metadata */
export async function signUpWithEmail({
  fullName,
  email,
  password,
}: Omit<RegisterFormData, 'confirmPassword'>) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });

  if (error) throw error;
  return data;
}

/** Sign out */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/** Get current session */
export async function getSession() {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) throw error;
  return session;
}
