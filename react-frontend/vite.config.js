import { defineConfig } from "vite";
import process from "node:process";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { host: "localhost", port: 5173, strictPort: true, proxy: { "/api": { target: process.env.API_PROXY_TARGET || "http://localhost:3001", changeOrigin: true } } },
});
