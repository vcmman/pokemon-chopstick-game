import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const base = process.env.PAGES_BASE_PATH || "/pokemon-chopstick-game/";
export default defineConfig({
  base,
  plugins: [react()],
  define: {
    "process.env.NEXT_PUBLIC_BASE_PATH": JSON.stringify(base.replace(/\/$/, "")),
  },
  build: { outDir: "pages-dist", emptyOutDir: true },
});
