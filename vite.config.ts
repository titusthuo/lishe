import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { nitro } from "nitro/vite";

export default defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [
    tailwindcss(),
    tanstackStart({
      // Point TanStack Start's SSR entry at src/server.ts (the error-normalising wrapper).
      server: { entry: "server" },
    }),
    react(),
    nitro({ preset: "vercel" }),
  ],
  build: {
    rollupOptions: {
      output: {
        // Both /foods routes import the KFCT table, so Rollup would otherwise
        // hoist it into the shared entry chunk and make every page pay for it.
        manualChunks(id) {
          if (id.includes("src/data/foodsKfct")) return "kfct-data";
        },
      },
    },
  },
  server: {
    port: 8080,
    host: true,
  },
});
