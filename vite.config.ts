import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({ mode }) => {
  // Load standard Vite env files (.env, .env.local, etc.)
  const env = loadEnv(mode, process.cwd(), '');

  // Fallback: If not in .env, check .env.example (common in AI Studio)
  if (!env.VITE_SUPABASE_URL && fs.existsSync('.env.example')) {
    try {
      const parsedExample = dotenv.parse(fs.readFileSync('.env.example'));
      if (parsedExample.VITE_SUPABASE_URL && !parsedExample.VITE_SUPABASE_URL.includes('your-project-id')) {
        env.VITE_SUPABASE_URL = parsedExample.VITE_SUPABASE_URL;
      }
      if (parsedExample.VITE_SUPABASE_ANON_KEY && !parsedExample.VITE_SUPABASE_ANON_KEY.includes('your-anon-key')) {
        env.VITE_SUPABASE_ANON_KEY = parsedExample.VITE_SUPABASE_ANON_KEY;
      }
    } catch {}
  }

  return {
    plugins: [react(), tailwindcss()],
    define: {
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL || ''),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY || ''),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});

