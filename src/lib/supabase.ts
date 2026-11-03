import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Retrieve credentials from Vite env or local runtime storage override
export function getSupabaseCredentials(): { url: string; key: string } {
  let url = (import.meta.env.VITE_SUPABASE_URL || '').trim();
  let key = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

  if (typeof window !== 'undefined') {
    const savedUrl = localStorage.getItem('aesthetic_look_supabase_url');
    const savedKey = localStorage.getItem('aesthetic_look_supabase_key');
    if (savedUrl && savedUrl.trim()) url = savedUrl.trim();
    if (savedKey && savedKey.trim()) key = savedKey.trim();
  }

  return { url, key };
}

const { url: supabaseUrl, key: supabaseAnonKey } = getSupabaseCredentials();

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('https://') &&
  !supabaseUrl.includes('your-project-id') &&
  !supabaseAnonKey.includes('your-anon-key')
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;

export function saveRuntimeSupabaseConfig(url: string, key: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('aesthetic_look_supabase_url', url.trim());
    localStorage.setItem('aesthetic_look_supabase_key', key.trim());
  }
}

export function clearRuntimeSupabaseConfig() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('aesthetic_look_supabase_url');
    localStorage.removeItem('aesthetic_look_supabase_key');
  }
}

export interface SupabaseStatus {
  configured: boolean;
  connected: boolean;
  url: string;
  authWorking?: boolean;
  storageWorking?: boolean;
  schemaPending?: boolean;
  tablesVerified?: boolean;
  storageBucketVerified?: boolean;
  error?: string;
  details?: string;
}

export async function checkSupabaseConnection(): Promise<SupabaseStatus> {
  const { url, key } = getSupabaseCredentials();

  if (!url || !key || url.includes('your-project-id') || key.includes('your-anon-key')) {
    return {
      configured: false,
      connected: false,
      url: url || 'Not Configured',
      error: 'Credentials pending in .env or .env.example (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY).',
      details: 'Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are present.',
    };
  }

  const client = (supabase && url === supabaseUrl && key === supabaseAnonKey)
    ? supabase
    : createClient(url, key, {
        auth: { persistSession: false, autoRefreshToken: false },
      });

  try {
    // 1. Probe Auth API
    let authWorking = false;
    try {
      const { error: authErr } = await client.auth.getSession();
      authWorking = !authErr;
    } catch {
      authWorking = false;
    }

    // 2. Probe Storage API
    let storageWorking = false;
    let bucketFound = false;
    try {
      const { data: buckets, error: storageErr } = await client.storage.listBuckets();
      if (!storageErr) {
        storageWorking = true;
        bucketFound = buckets?.some((b) => b.name === 'product-images') ?? false;
      }
    } catch {
      storageWorking = false;
    }

    // 3. Probe Database Products Table
    const { error: tableError } = await client.from('products').select('id').limit(1);

    if (tableError) {
      // PGRST205 or 42P01: Table not found in schema cache
      // This proves connection + authentication succeeded, but SQL schema is pending!
      const isMissingTable =
        tableError.code === 'PGRST205' ||
        tableError.code === '42P01' ||
        tableError.message?.toLowerCase().includes('schema cache') ||
        tableError.message?.toLowerCase().includes('does not exist');

      if (isMissingTable) {
        return {
          configured: true,
          connected: true,
          url,
          authWorking,
          storageWorking,
          schemaPending: true,
          tablesVerified: false,
          storageBucketVerified: bucketFound,
          details: 'Supabase project is reachable and authenticated! The "products" table has not been created yet in PostgreSQL. Run the SQL migration below in Supabase SQL Editor.',
        };
      }

      // If authentication failure
      if (
        tableError.code === 'PGRST301' ||
        tableError.message?.toLowerCase().includes('apikey') ||
        tableError.message?.toLowerCase().includes('jwt') ||
        tableError.message?.toLowerCase().includes('unauthorized')
      ) {
        return {
          configured: true,
          connected: false,
          url,
          error: `Supabase authentication error: ${tableError.message}`,
          details: 'The provided API key was rejected by the Supabase project. Please verify you provided the anon/publishable key from Project Settings > API.',
        };
      }

      return {
        configured: true,
        connected: false,
        url,
        error: `Supabase query error (${tableError.code}): ${tableError.message}`,
        details: tableError.details || 'Unable to execute query on Supabase.',
      };
    }

    // All checks verified
    return {
      configured: true,
      connected: true,
      url,
      authWorking: true,
      storageWorking: true,
      schemaPending: false,
      tablesVerified: true,
      storageBucketVerified: bucketFound,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      configured: true,
      connected: false,
      url,
      error: `Network connection failed: ${message}`,
      details: 'Could not connect to the Supabase host. Check internet connection or project URL.',
    };
  }
}
