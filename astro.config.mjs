// @ts-check
import { defineConfig, envField, fontProviders } from "astro/config";

import tailwindcss from "@tailwindcss/vite";
import node from "@astrojs/node";
import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  site: "https://anshulg.com",
  vite: {
    plugins: [tailwindcss()],
  },
  adapter: node({
    mode: "standalone",
  }),
  integrations: [sitemap()],
  experimental: {
    fonts: [
      {
        provider: fontProviders.google(),
        name: "JetBrains Mono",
        cssVariable: "--jetbrains-mono",
        fallbacks: ["monospace"],
        weights: [400],
        subsets: ["latin"],
        styles: ["normal", "italic"],
      },
    ],
  },
  env: {
    schema: {
      KUMA_URL: envField.string({
        context: "client",
        access: "public",
        url: true,
        optional: false,
      }),
      KUMA_API_KEY: envField.string({
        context: "server",
        access: "secret",
        optional: false,
      }),
    },
  },
});
