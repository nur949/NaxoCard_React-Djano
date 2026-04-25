import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const configuredApiUrl = env.VITE_API_URL || "https://naxocard-react-djano.onrender.com/api";
  const backendTarget = configuredApiUrl.replace(/\/api\/?$/, "");

  return {
    plugins: [react()],
    server: {
      host: "127.0.0.1",
      port: 5173,
      proxy: {
        "/api": {
          target: backendTarget,
          changeOrigin: true,
          secure: true,
        },
        "/media": {
          target: backendTarget,
          changeOrigin: true,
          secure: true,
        },
        "/static": {
          target: backendTarget,
          changeOrigin: true,
          secure: true,
        },
      },
    },
  };
});
