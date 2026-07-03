import { createRequire } from "node:module";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import viteReact from "@vitejs/plugin-react";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { nitro } from "nitro/vite";

// Absolute path to tslib's ESM build. Aliasing to a resolved file (rather than a
// bare "tslib/tslib.es6.mjs" specifier) avoids re-resolution through tslib's
// exports map, which otherwise picks the CJS build and loses named helpers when
// bundled into the server output.
const require = createRequire(import.meta.url);
const tslibEsm = require.resolve("tslib/tslib.es6.mjs");

// Standalone Vite configuration for TanStack Start + SSR + Nitro,
// built entirely from official npm plugins.
export default defineConfig(({ command }) => ({
  // Match the build's CSS pipeline in dev (Lightning CSS in both) so the
  // preview stays honest with the built output.
  css: { transformer: "lightningcss" },

  resolve: {
    // `@` -> ./src (also covered by vite-tsconfig-paths, kept for robustness).
    alias: {
      "@": new URL("./src", import.meta.url).pathname,
    },
    dedupe: [
      "react",
      "react-dom",
      "react/jsx-runtime",
      "react/jsx-dev-runtime",
      "@tanstack/react-query",
      "@tanstack/query-core",
    ],
  },

  // Pre-bundle always-present client deps and tolerate stale optimized-dep
  // requests. React core only — pulling @tanstack/react-start in here would
  // drag its node:async_hooks server entry into the client bundle.
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-dom/client",
      "react/jsx-runtime",
      "react/jsx-dev-runtime",
    ],
  },

  server: {
    host: "::",
    port: 8080,
  },

  plugins: [
    tailwindcss(),
    tsConfigPaths({ projects: ["./tsconfig.json"] }),
    tanstackStart({
      // Route TanStack Start's bundled server entry to src/server.ts (our SSR
      // error wrapper). nitro/vite builds from this.
      server: { entry: "server" },
      importProtection: {
        behavior: "error",
        client: {
          files: ["**/server/**"],
          specifiers: ["server-only"],
        },
      },
    }),
    // Nitro runs at build time only. With no preset it auto-detects the target:
    // node-server locally / Render / Railway / Docker, and the Vercel or Netlify
    // preset when their CI env vars are present.
    // `noExternals` bundles all dependencies into the server output, producing a
    // self-contained build and sidestepping the file-tracer. `tslib` is aliased
    // to its ESM build so its helpers survive as real named exports when bundled.
    ...(command === "build" ? [nitro({ noExternals: true, alias: { tslib: tslibEsm } })] : []),
    viteReact(),
  ],
}));
