// Helper function to clean environment variables
const cleanEnvVar = (value: string | undefined): string | undefined => {
  if (!value) return undefined;
  
  // If the value contains the variable name (like "VAR_NAME=actual_value")
  if (value.includes('=')) {
    return value.split('=').pop()?.trim();
  }
  
  return value.trim();
};

export const config = {
  clerk: {
    publishableKey: cleanEnvVar(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY) || '',
    secretKey: cleanEnvVar(import.meta.env.VITE_CLERK_SECRET_KEY) || '',
  },
  supabase: {
    url: cleanEnvVar(import.meta.env.VITE_SUPABASE_URL) || '',
    anonKey: cleanEnvVar(import.meta.env.VITE_SUPABASE_ANON_KEY) || '',
    serviceRoleKey: cleanEnvVar(import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY) || '',
  },
};

// Validation
if (!config.clerk.publishableKey || !config.clerk.publishableKey.startsWith('pk_')) {
  console.error('Invalid Clerk publishable key:', config.clerk.publishableKey);
  throw new Error(`Invalid Clerk publishable key. Expected key starting with 'pk_' but got: ${config.clerk.publishableKey}`);
}

if (!config.supabase.url || !config.supabase.anonKey) {
  console.error('Missing Supabase configuration');
  throw new Error('Missing Supabase URL or anonymous key');
}
