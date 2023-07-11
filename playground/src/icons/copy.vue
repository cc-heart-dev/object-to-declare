<template>
  <div @click="handleClick">
    <svg class="copy-icon" xmlns="http://www.w3.org/2000/svg" width="1.5em" height="1.5em" viewBox="0 0 256 256">
      <path
        fill="currentColor"
        d="M216 36H88a4 4 0 0 0-4 4v44H40a4 4 0 0 0-4 4v128a4 4 0 0 0 4 4h128a4 4 0 0 0 4-4v-44h44a4 4 0 0 0 4-4V40a4 4 0 0 0-4-4Zm-52 176H44V92h120Zm48-48h-40V88a4 4 0 0 0-4-4H92V44h120Z"
      ></path>
    </svg>
  </div>
</template>

<script lang="ts">
export default {
  name: 'PhCopyThin',
  emit: ['copy'],
  setup(_, { emit }) {
    const handleClick = () => {
      emit('copy')
    }
    return {
      handleClick,
    }
  },
}
</script>

<style lang="scss">
.copy-icon {
  cursor: pointer;
}
</style>
