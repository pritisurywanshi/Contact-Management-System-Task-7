import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/login": "http://localhost:8080",
      "/logout": "http://localhost:8080",
      "/admin": "http://localhost:8080",
      "/contacts": "http://localhost:8080",
      "/submit": "http://localhost:8080",
      "/audit": "http://localhost:8080",
    },
  },
});