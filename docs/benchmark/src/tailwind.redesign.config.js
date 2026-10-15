/* Tailwind 3.4.17 — rapports « benchmark + refonte » (docs/benchmark/*-refonte.html).
   Les couleurs pointent vers des variables CSS : le rapport suit le thème clair ou sombre. */
const v = (name) => `rgb(var(--${name}) / <alpha-value>)`;
module.exports = {
  content: [__dirname + "/*-refonte.html"],
  theme: {
    extend: {
      colors: {
        paper: v("paper"), card: v("card"), sunk: v("sunk"), line: v("line"),
        ink: v("ink"), muted: v("muted"),
        brand: v("brand"), "brand-ink": v("brand-ink"),
        primary: v("primary"), positive: v("positive"), incident: v("incident"),
        vigilance: v("vigilance"), info: v("info"),
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', "Inter", "system-ui", "sans-serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "monospace"],
      },
      maxWidth: { prose2: "68ch" },
    },
  },
  plugins: [],
};
