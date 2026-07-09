import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, (process as any).cwd(), '');
  return {
    plugins: [react(), tailwindcss()],
    define: {
      // Safely define process.env.API_KEY without overwriting the entire process.env object
      'process.env.API_KEY': JSON.stringify(env.API_KEY)
    }
  };
});