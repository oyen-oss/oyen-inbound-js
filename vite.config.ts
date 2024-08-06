/* eslint-disable import/no-extraneous-dependencies */
import { readFile } from 'fs/promises';
import type { PackageJson } from 'type-fest';
import { defineConfig } from 'vite';

const packageJson: PackageJson = JSON.parse(
  await readFile(new URL('./package.json', import.meta.url), 'utf-8'),
);

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
      external: (id: string) =>
        Object.keys(packageJson.dependencies || {}).some(
          (d) => id === d || id.startsWith(`${d}/`),
        ),
    },
  },
  define: {
    'import.meta.env.PACKAGE_NAME': JSON.stringify(packageJson.name),
    'import.meta.env.PACKAGE_VERSION': JSON.stringify(packageJson.version),
  },
});
