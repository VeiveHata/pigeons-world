import { fileURLToPath, URL } from "node:url";
import { defineConfig, type Plugin } from "vite";
import vue from "@vitejs/plugin-vue";

// Tailwind reads its config (and the theme colours it imports) once, so a running dev
// server would keep serving old colours. Restart it when either file changes.
function restartOnThemeChange(): Plugin {
  const files = ["./tailwind.config.js", "./src/theme/colors.js"].map((file) =>
    fileURLToPath(new URL(file, import.meta.url)),
  );
  return {
    name: "restart-on-theme-change",
    apply: "serve",
    configureServer(server) {
      server.watcher.add(files);
      server.watcher.on("change", (file) => {
        if (files.includes(file)) void server.restart();
      });
    },
  };
}

export default defineConfig({
  plugins: [vue(), restartOnThemeChange()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
