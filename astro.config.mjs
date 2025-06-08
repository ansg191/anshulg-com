// @ts-check
import { defineConfig, envField, fontProviders } from "astro/config";

import tailwindcss from "@tailwindcss/vite";
import node from "@astrojs/node";
import sitemap from "@astrojs/sitemap";

/**
 * Disable Content Security Policy (CSP) in development mode
 * @type {false|{directives: import("node_modules/astro/dist/core/csp/config").CspDirective[]}}
 */
const csp = process.env["NODE_ENV"] === "production" && {
  directives: [
    "default-src 'none'",
    "base-uri 'none'",
    "form-action 'none'",
    "object-src 'none'",
    "img-src 'self'",
    "font-src 'self'",
    "connect-src 'self'",
  ],
};

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
    csp,
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
        context: "server",
        access: "secret",
        url: true,
        optional: true,
      }),
      KUMA_API_KEY: envField.string({
        context: "server",
        access: "secret",
        optional: true,
      }),
      UPPTIME_URL: envField.string({
        context: "server",
        access: "secret",
        optional: true,
      }),
    },
  },
});
