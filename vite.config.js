import { defineConfig } from 'vite';

// Fully static build. `base: './'` keeps asset URLs relative so the site works
// on GitHub Pages project sites (https://user.github.io/repo/) without extra config.
export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    // Keep the WASM binaries as separate files (do not inline them).
    assetsInlineLimit: 0,
  },
});
