// https://nuxt.com/docs/api/configuration/nuxt-config
import wasm from "vite-plugin-wasm";

export default defineNuxtConfig({
  ssr: false,
  devtools: {
    enabled: true,

    timeline: {
      enabled: true,
    },
  },
  vite: {
    build: {
      target: "esnext",
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            // isolate randomfill as a separate chunk
            if (id.includes("node_modules/randomfill/browser.js")) {
              return "randomfill";
            }
          },
        },
      },
    },
    define: {
      global: "globalThis",
    },
    plugins: [
      wasm(),
      {
        // work around for `exports is not defined` error within the crypto-browserify > randomfill dep
        name: "crypto-randomfill-patch",

        apply: "build",
        enforce: "pre",

        renderChunk(code, chunk) {
          if (!/randomfill.*\.js$/.test(chunk.fileName)) {
            return null;
          }

          const modifiedCode = code
            .split("\n")
            .map((line) => {
              if (line.trim() === "exports.randomFill = randomFill;") {
                return "var exports = {}; exports.randomFill = randomFill;";
              }

              return line;
            })
            .join("\n");

          return { code: modifiedCode, map: null };
        },
      },
    ],

    resolve: {
      alias: {
        // required to polyfill node crypto module
        crypto: "crypto-browserify",
        stream: "stream-browserify",

        "@swapkit/core": "@swapkit/core",

        buffer: "unenv/runtime/node/buffer/index",
        "node:buffer": "unenv/runtime/node/buffer/index",
      },
    },
  },
});
