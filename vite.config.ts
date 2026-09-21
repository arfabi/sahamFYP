import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { scraperPlugin } from "./src/plugins/scraperPlugin";
import { postsPlugin } from "./src/plugins/postsPlugin";

export default defineConfig({
  plugins: [react(), scraperPlugin(), postsPlugin()],
  server: {
    port: 3000,
  },
});