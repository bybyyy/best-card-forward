import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// GitHub Pages serves the site from /best-card-forward/, so every built
// asset path needs that prefix. Change this if the repo is renamed.
export default defineConfig({
  base: "/best-card-forward/",
  plugins: [react()],
});
