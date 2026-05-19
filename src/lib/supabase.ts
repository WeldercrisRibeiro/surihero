import { createClient } from '@supabase/supabase-js';

const isLocalApi = import.meta.env.VITE_USE_LOCAL_API === 'true';
const localUrl = import.meta.env.VITE_LOCAL_API_URL || 'http://localhost:3000';

const supabaseUrl = isLocalApi ? localUrl : (import.meta.env.VITE_SUPABASE_URL || '');
const supabaseAnonKey = isLocalApi ? 'local-dummy-key' : (import.meta.env.VITE_SUPABASE_ANON_KEY || '');

const isValidUrl = (url: string) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

if (!isLocalApi && (!isValidUrl(supabaseUrl) || !supabaseAnonKey || supabaseUrl === 'your-project-url')) {
  console.warn('Supabase credentials missing or invalid. Check your .env file.');
}

// Create a custom fetch to handle PostgREST without /rest/v1 prefix
const customFetch = (url: string, options: any) => {
  if (isLocalApi) {
    // Clone options to modify headers safely
    const newOptions = { ...options };
    if (newOptions.headers) {
      const headers = new Headers(newOptions.headers);
      // Remove Authorization if it's a dummy key (PostgREST expects a valid JWT otherwise)
      if (headers.get('Authorization')?.includes('local-dummy-key')) {
        headers.delete('Authorization');
      }
      newOptions.headers = headers;
    }
    
    if (url.includes('/rest/v1/')) {
      const newUrl = url.replace('/rest/v1/', '/');
      return fetch(newUrl, newOptions);
    }
    return fetch(url, newOptions);
  }
  return fetch(url, options);
};

// Create a dummy client if URL is invalid to prevent crash
export const supabase = isValidUrl(supabaseUrl) && supabaseUrl !== 'your-project-url'
  ? createClient(supabaseUrl, supabaseAnonKey, {
      global: { fetch: customFetch }
    })
  : {
      from: () => ({
        select: () => ({ eq: () => ({ order: () => Promise.resolve({ data: [], error: null }) }), single: () => Promise.resolve({ data: null, error: null }), order: () => Promise.resolve({ data: [], error: null }) }),
        insert: () => ({ select: () => ({ single: () => Promise.resolve({ data: null, error: null }) }) }),
        update: () => ({ eq: () => ({ select: () => ({ single: () => Promise.resolve({ data: null, error: null }) }) }) }),
        delete: () => ({ eq: () => Promise.resolve({ error: null }) }),
      }),
      auth: {
        signInWithPassword: () => Promise.resolve({ data: {}, error: null }),
        signUp: () => Promise.resolve({ data: {}, error: null }),
        signOut: () => Promise.resolve({ error: null }),
        signInWithOAuth: () => Promise.resolve({ data: {}, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
        getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      }
    } as any;

export type Profile = {
  id: string;
  name: string;
  phone: string;
  telegram_token?: string;
  role: 'user' | 'admin';
  created_at: string;
  require_password_change?: boolean;
};

export type KanbanColumnDB = {
  id: string;
  user_id: string;
  title: string;
  color: string;
  position: number;
  created_at: string;
};

export type KanbanCardDB = {
  id: string;
  column_id: string;
  user_id: string;
  title: string;
  description: string | null;
  priority: string;
  due_date: string | null;
  position: number;
  tags: any[];
  created_at: string;
};
