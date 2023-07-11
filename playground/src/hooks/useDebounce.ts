const weakMap = new WeakMap()
export function useDebounce(fn: (...args: any) => any, delay = 500) {
  return (...args: any) => {
    if (weakMap.has(fn)) {
      clearTimeout(weakMap.get(fn))
    }
    const timer = setTimeout(() => {
      fn(...args)
      weakMap.delete(fn)
    }, delay)
    weakMap.set(fn, timer)
  }
}
