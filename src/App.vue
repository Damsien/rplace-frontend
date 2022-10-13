<script lang="ts">
import { RouterLink, RouterView } from 'vue-router';
import io from "socket.io-client";
import { useTimerStore } from './stores/timer';
import { useMapStore } from './stores/map';
import { useColorsStore } from './stores/colors';

  const TOKEN = localStorage.getItem('ACCESS_TOKEN');
  export const HEADERS = {
      'Accept': '*/*',
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Authorization': `Bearer ${TOKEN}`
  };

  export const socket = io(`http://${import.meta.env.VITE_APP_BACKEND_URL}`, {
      extraHeaders: HEADERS
  });

</script>

<template>
  <RouterView v-slot="{ route, Component }">
      <template v-if="route.matched[0]?.name">
        <keep-alive>
          <component :is="Component" :key="route.matched[0].name" />
        </keep-alive>
      </template>
  </RouterView>
</template>

<style scoped>


</style>
