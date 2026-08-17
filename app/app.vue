<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
onMounted(() => {
  // Prevent pull-to-refresh & overscroll bounce on mobile/tablet
  document.body.style.overscrollBehavior = 'none'
})
</script>
