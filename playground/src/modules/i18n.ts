import type { App } from 'vue'
import type { Locale } from 'vue-i18n'
import { createI18n } from 'vue-i18n'

const i18n = createI18n({
  // 意思
  legacy: false,
  locate: '',
  message: {},
})

// 获取i18n的配置文件
const localesMap = Object.fromEntries(
  Object.entries(import.meta.glob('../locales/*.yaml')).map(([path, loadLocale]) => {
    // 匹配数据
    return [path.match(/([\w-]*)\.yaml$/)?.[1], loadLocale]
  }),
) as Record<Locale, () => { default: Promise<Record<string, string>> }>

console.log(localesMap)

function setI18nLanguage(locale: Locale) {
  i18n.global.locale.value = locale
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('lang', locale)
  }

  return locale
}
const loadedLanguages: string[] = []
export async function loadLanguageAsync(locale: string) {
  // 相同的语言直接设置
  if (i18n.global.locale.value === locale) return setI18nLanguage(locale)

  // 如果语言已经加载过
  if (loadedLanguages.includes(locale)) return setI18nLanguage(locale)

  // 如果语言没有加载过
  const msg = await localesMap[locale]()
  i18n.global.setLocaleMessage(locale, msg.default)
  loadedLanguages.push(locale)
  return setI18nLanguage(locale)
}

export const setup = ({ app }: { app: App }) => {
  app.use(i18n)
  loadLanguageAsync('zh-CN')
}
