import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  outDir: 'dist',
  format: ['esm'],  // Output ESM format since Node.js 20 supports it natively
  target: 'node20',  // Target Node.js 20
  dts: true,  // Generate TypeScript declaration files
  sourcemap: true,  // Generate source maps for debugging
  clean: true,  // Clean the output directory before each build
});
