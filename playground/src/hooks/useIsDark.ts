export function useIsDark() {
  const el = document.documentElement
  const token = el.classList
  return token.contains('dark')
}
