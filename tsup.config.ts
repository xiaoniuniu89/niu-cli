// tsup.config.ts

import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: ['src/index.ts'],
    outDir: 'dist',
    format: ['esm'],
    target: 'node20',
    dts: true,
    sourcemap: true,
    clean: true,
  },
  {
    entry: {
      replaceDefaults: 'src/codemods/replaceDefaults.ts',
      addRoutes: 'src/codemods/addRoutes.ts',
      updatePlasmicImportPath: 'src/codemods/updatePlasmicImportPath.ts'
    },
    outDir: 'dist/codemods',
    format: ['esm'],
    target: 'node20',
    dts: false,
    sourcemap: false,
    clean: false
  }
]);
