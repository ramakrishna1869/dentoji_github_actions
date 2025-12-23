

import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  //base: "./",
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    
  },
  build: {
    rollupOptions: {
      external: ["xlsx"], // ✅ Prevents bundling error on Render
    },
  },
  optimizeDeps: {
    include: ["xlsx"], // ✅ Ensures dev & build both work
  },
});
