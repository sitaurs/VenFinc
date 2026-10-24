import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { cloudflare } from "@cloudflare/vite-plugin";
import { VitePWA } from "vite-plugin-pwa";
import { fileURLToPath } from "node:url";

export default defineConfig({
  root: "apps/web",
  plugins: [
    react(),
    tailwindcss(),
    cloudflare({
      configPath: fileURLToPath(
        new URL("./infra/wrangler.jsonc", import.meta.url),
      ),
      viteEnvironment: { name: "worker" },
    }),
    VitePWA({
      registerType: "prompt",
      manifest: {
        name: "VenFinance",
        short_name: "VenFinance",
        lang: "id",
        description:
          "Catatan keuangan pribadi, anggaran, dan kebiasaan yang lebih terarah.",
        start_url: "/",
        display: "standalone",
        background_color: "#F7F7FC",
        theme_color: "#6D4CE8",
        // Source raster has these native dimensions. Install icons need separate PWA QA.
        icons: [
          {
            src: "/brand/venfinance-app-icon.png",
            sizes: "316x315",
            type: "image/png",
            purpose: "any",
          },
        ],
      },
      workbox: {
        navigateFallback: "/index.html",
        navigateFallbackDenylist: [
          /^\/api\//,
          /^\/app(?:\/|$)/,
          /^\/admin(?:\/|$)/,
          /^\/system(?:\/|$)/,
        ],
        globPatterns: ["**/*.{js,css,html,woff2,png,svg,webmanifest}"],
        globIgnores: ["**/demo-*.js"],
        runtimeCaching: [],
      },
      devOptions: { enabled: false },
    }),
  ],
  server: { port: 5173, strictPort: true },
  preview: { port: 4173, strictPort: true },
  build: { sourcemap: false, chunkSizeWarningLimit: 600 },
});
