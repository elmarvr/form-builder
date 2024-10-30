import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { TanStackRouterVite as tanstackRouter } from "@tanstack/router-plugin/vite";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    tsconfigPaths({
      projects: ["./tsconfig.json"],
    }) as never,
    tanstackRouter({}),
    react(),
  ],
});
