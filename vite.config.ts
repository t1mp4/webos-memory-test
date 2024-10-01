import { defineConfig } from "vite";
import legacy from "@vitejs/plugin-legacy";

export default defineConfig({
  base: "/webos-memory-test/",
  plugins: [
    legacy({
      targets: "chrome 53",
      renderModernChunks: false,
    }),
  ],
});
