<script setup lang="ts">
import Map from '@/components/Map.vue'
import Profile from '@/components/Profile.vue'
</script>

<template>
  <main>
    <div id="screen">
      <Profile />
      <Map />
    </div>
  </main>
</template>

<style scoped>

#screen {
    overflow: hidden; /* Hide scrollbars */
    position: relative;
    width: 100%;
    min-height: 100vh;
}
</style>