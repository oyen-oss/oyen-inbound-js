import { defineConfig } from 'vite';

import pkg from './package.json';

export default defineConfig({
  build: {
    outDir: 'build/src',
    lib: {
      fileName: 'main',
      entry: 'src/main.ts',
      formats: ['es'],
    },
    minify: true,
    sourcemap: true,

    rollupOptions: {
      external(id) {
        return Object.keys(pkg.dependencies || {}).some(
          (d) => id === d || id.startsWith(`${d}/`),
        );
      },
    },
  },
});
