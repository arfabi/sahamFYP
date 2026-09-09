import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { scraperPlugin } from "./src/plugins/scraperPlugin";

export default defineConfig({
  plugins: [react(), scraperPlugin()],
  server: {
    port: 3000,
  },
});