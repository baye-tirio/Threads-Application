import { defineConfig } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import react from "@vitejs/plugin-react";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  //Get rid or the CORS error etc etc
  server: {
    proxy: {
      "/api": {
        target: "https://threads-application-au35.onrender.com",
        secure: false,
        changeOrigin: true,
      },
    },
  },
});
