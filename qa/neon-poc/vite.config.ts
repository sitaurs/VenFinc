import { defineConfig } from "vite";

export default defineConfig({
  root: process.cwd(),
  appType: "mpa",
  server: {
    host: "127.0.0.1",
    port: 5173,
    strictPort: true,
    proxy: {
      "/api/auth": {
        target: "http://127.0.0.1:8788",
        changeOrigin: true,
      },
      "/__p0": {
        target: "http://127.0.0.1:8788",
        changeOrigin: true,
      },
    },
  },
});
