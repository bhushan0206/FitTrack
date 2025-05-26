import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { tempo } from "tempo-devtools/dist/vite";

// https://vitejs.dev/config/
export default defineConfig({
  base: process.env.NODE_ENV === "development" ? "/" : process.env.VITE_BASE_PATH || "/",
  optimizeDeps: {
    entries: ["src/main.tsx", "src/tempobook/**/*"],
  },
  plugins: [
    react(),
    tempo(),
  ],
  resolve: {
    preserveSymlinks: true,
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          supabase: ['@supabase/supabase-js'],
          ui: ['lucide-react', 'date-fns']
        }
      }
    },
    // Ensure proper asset handling
    assetsDir: 'assets',
    sourcemap: false,
    // Prevent assets from being too large
    chunkSizeWarningLimit: 1600
  },
  server: {
    // Enable client-side routing in development
    port: 5173,
    host: true,
    // Handle mobile browser compatibility
    hmr: {
      clientPort: 5173
    }
  },
  preview: {
    port: 3000,
    host: true,
    // Ensure preview server also handles client-side routing
    proxy: undefined
  },
  // Define environment variables for better build output
  define: {
    __DEV__: JSON.stringify(false)
  }
});
