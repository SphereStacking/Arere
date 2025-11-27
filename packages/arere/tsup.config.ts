import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    cli: 'src/cli.ts',
    index: 'src/index.ts',
  },
  format: ['esm'],
  dts: true,
  clean: true,
  sourcemap: true,
  shims: true,
  splitting: false,
  treeshake: false,
  minify: false,
  target: 'es2020',
  outDir: 'dist',
})
