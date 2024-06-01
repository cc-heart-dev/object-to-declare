import { readFile, writeFile } from 'fs/promises'
import { resolve } from 'path'

readFile(resolve(process.cwd(), './package.json'), { encoding: 'utf8' }).then((data) => {
  const { version } = JSON.parse(data)
  writeFile(resolve(process.cwd(), './src/version.ts'), `export const version = '${version}'`, 'utf8')
})
