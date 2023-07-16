<script setup lang="ts">
import { usePrefixCls } from '@/hooks'
import { GithubIcon } from '@/icons'
import { githubUrl } from '@/configs'
import ToggleDark from '@/components/switch/toggleDark.vue'
const headerCls = usePrefixCls('header')

const toGithub = () => {
  if (githubUrl) window.open(githubUrl)
}
</script>

<template>
  <header class="flex justify-between items-center px-3" :class="[headerCls]">
    <slot name="left">
      <div></div>
    </slot>
    <div class="flex text-2xl items-center" :class="[`${headerCls}__icon`]">
      <slot name="right-icon"></slot>
      <GithubIcon @click="toGithub" />
      <ToggleDark />
    </div>
  </header>
</template>

<style lang="scss">
@use '@/assets/scss/var/variable.scss' as var;

.#{var.$prefixCls}-header {
  height: 60px;
  box-shadow: 0 1px 0 var(--box-color-1);
  flex-shrink: 0;

  &__icon {
    color: var(--color-text-2);

    & > div,
    & > button,
    & > svg {
      margin: 0 0.5rem;
    }

    svg {
      cursor: pointer;
      transition: color 0.3s;

      &:hover {
        color: var(--color-text-1);
      }
    }
  }
}
</style>
