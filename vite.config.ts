import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["identidadevisual/icons/totvs.svg", "identidadevisual/icons/suri-blue.svg", "identidadevisual/icons/suri-white.svg"],
      manifest: {
        name: "Suri Tools",
        short_name: "Suri Tools",
        description: "Módulos internos da plataforma Suri — API, Calculadora, Kanban e WorkFlow.",
        theme_color: "#020519",
        background_color: "#020519",
        display: "standalone",
        orientation: "portrait-primary",
        id: "/?source=pwa",
        scope: "/",
        start_url: "/?source=pwa",
        lang: "pt-BR",
        categories: ["productivity", "business"],
        icons: [
          {
            src: "/identidadevisual/icons/totvs.svg",
            sizes: "192x192",
            type: "image/svg+xml",
            purpose: "any",
          },
          {
            src: "/identidadevisual/icons/totvs.svg",
            sizes: "512x512",
            type: "image/svg+xml",
            purpose: "any",
          },
          {
            src: "/identidadevisual/icons/totvs.svg",
            sizes: "any",
            type: "image/svg+xml",
            purpose: "any",
          },
          {
            src: "/identidadevisual/icons/totvs.svg",
            sizes: "any",
            type: "image/svg+xml",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff,woff2}"],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-cache",
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "gstatic-fonts-cache",
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
      devOptions: {
        enabled: false,
      }
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      "/api/suri-portal": {
        target: "https://portal.suri.ai",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/suri-portal/, "/api/v1"),
        secure: true,
        configure: (proxy, _options) => {
          proxy.on("proxyReq", (proxyReq, req, _res) => {
            proxyReq.setHeader("origin", "https://portal.suri.ai");
            proxyReq.setHeader("referer", "https://portal.suri.ai/");
          });
        },
      },
    },
  },
  build: {
    outDir: "dist",
  },
});
