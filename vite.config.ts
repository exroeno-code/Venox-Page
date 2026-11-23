import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { nitro } from "nitro/vite";

// Nitro turns the TanStack Start server into a deployable bundle. On Vercel it detects the
// platform (and NITRO_PRESET=vercel in vercel.json confirms it) and emits Vercel's Build Output.
// Locally it builds a plain Node server.
export default defineConfig({
  resolve: {
    tsconfigPaths: true,
    dedupe: ["react", "react-dom", "@tanstack/react-router", "@tanstack/react-start"],
  },
  plugins: [
    // Use src/server.ts (our SSR error wrapper) as the server entry.
    tanstackStart({
      srcDirectory: ".",
      router: {
        routesDirectory: "./routes",
        generatedRouteTree: "./routeTree.gen.ts",
      },
      server: { entry: "server" },
    }),
    nitro(),
    viteReact(),
    tailwindcss(),
  ],
});
