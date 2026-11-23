import { defineConfig, loadEnv } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { nitro } from "nitro/vite";

// Nitro turns the TanStack Start server into a deployable bundle. On Vercel it detects the
// platform (and NITRO_PRESET=vercel in vercel.json confirms it) and emits Vercel's Build Output.
// Locally it builds a plain Node server.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const supabaseUrl = env["VITE_SUPABASE_URL"] || env["SUPABASE_URL"] || env["NEXT_PUBLIC_SUPABASE_URL"];
  const supabaseKey =
    env["VITE_SUPABASE_PUBLISHABLE_KEY"] ||
    env["SUPABASE_PUBLISHABLE_KEY"] ||
    env["NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"];

  return {
    define: {
      ...(supabaseUrl ? { "import.meta.env.VITE_SUPABASE_URL": JSON.stringify(supabaseUrl) } : {}),
      ...(supabaseKey ? { "import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY": JSON.stringify(supabaseKey) } : {}),
    },
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
  };
});
