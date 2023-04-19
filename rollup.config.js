import pluginTypescript from '@rollup/plugin-typescript'
import tsConfig from './tsconfig.build.json' assert { type: 'json' }

delete tsConfig.compilerOptions.emitDeclarationOnly
tsConfig.compilerOptions.noEmit = true
tsConfig.compilerOptions.declaration = false
console.log(tsConfig);
export default {
  input: './src/index.ts',
  output: [
    {
      file: 'dist/esm/index.js',
      format: 'esm',
    },
    {
      file: 'dist/cjs/index.js',
      format: 'cjs',
    },
  ],
  plugins: [pluginTypescript(tsConfig)],
}
