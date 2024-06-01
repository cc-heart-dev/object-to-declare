import pluginTypescript from '@rollup/plugin-typescript'
import resolve from '@rollup/plugin-node-resolve'
import { readFileSync } from 'fs'

let tsConfig = readFileSync('./tsconfig.build.json')
tsConfig = JSON.parse(tsConfig)

delete tsConfig.compilerOptions.emitDeclarationOnly
tsConfig.compilerOptions.noEmit = true
tsConfig.compilerOptions.declaration = false

export default {
  input: './src/index.ts',
  output: [
    {
      file: 'dist/esm/index.js',
      format: 'esm'
    },
    {
      file: 'dist/cjs/index.cjs',
      format: 'cjs'
    }
  ],
  plugins: [resolve(), pluginTypescript(tsConfig)]
}
