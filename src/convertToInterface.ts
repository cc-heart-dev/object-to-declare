
export function covertToInterface(target: string) {
  return target.replaceAll(/"|,/g, '')
}