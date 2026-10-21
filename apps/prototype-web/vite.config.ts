import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";

const repo = (p: string) => fileURLToPath(new URL(`../../${p}`, import.meta.url));
const DS = repo("docs/design-system/index.html");
const SPRITE = repo("prototype/src/phosphor-sprite.svg");

/* Une seule source pour les tokens et les composants : le CSS du Design System (docs/design-system/index.html,
   entre les marqueurs TOKENS et CHROME), servi comme module virtuel « virtual:design-system.css ». */
function designSystem(): Plugin {
  const id = "virtual:design-system.css";
  return {
    name: "95-alerte-design-system",
    resolveId: (source) => (source === id ? "\0" + id : null),
    load(source) {
      if (source !== "\0" + id) return null;
      this.addWatchFile(DS);
      const html = readFileSync(DS, "utf8");
      return html.slice(html.indexOf("/* ============ TOKENS"), html.indexOf("/* ============ CHROME"));
    },
  };
}

/* Sprite Phosphor (tools/build_phosphor_sprite.py) placé dans la page : <svg class="ph"><use href="#ph-fire"/></svg> */
function phosphorSprite(): Plugin {
  return {
    name: "95-alerte-phosphor-sprite",
    transformIndexHtml: (html) => html.replace("<!-- phosphor-sprite -->", readFileSync(SPRITE, "utf8")),
  };
}

export default defineConfig({
  plugins: [react(), designSystem(), phosphorSprite()],
  resolve: {
    alias: {
      "@/": fileURLToPath(new URL("./src/", import.meta.url)),
      "@proto/": repo("prototype/src/"),
      "@brand/": repo("docs/brand/"),
    },
  },
  server: { fs: { allow: [repo("")] } },
  build: { chunkSizeWarningLimit: 1500 },
});
