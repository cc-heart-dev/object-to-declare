import { ref } from 'vue'
import { useIsDark } from '@/hooks'
export const prefixCls = 'cc'
export const isDev = process.env.NODE_ENV === 'development'
export const isProd = process.env.NODE_ENV === 'production'
export const isDark = ref(useIsDark())

export const githubUrl = 'https://github.com/cc-hearts/object-to-declare'
