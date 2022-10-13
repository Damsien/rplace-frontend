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

  const timerSts = useTimerStore();
  const mapSts = useMapStore();
  const colorsSts = useColorsStore();

  // UPDATE PIXEL
  socket.on('pixel', pixel => {
      mapSts.editPixel(pixel);
  });



  // UPDATE TIMER
  socket.on('game', game => {
      if (game.width) {
          mapSts.setWidth(game.width);
      }
      if (game.timer) {
          timerSts.setTimer(game.timer);
      }
      if (game.colors) {
          colorsSts.clearColors();
          // @ts-ignore
          for(let [color, hex] of Object.entries(Object.entries(game.colors)[0][1])) {
              // @ts-ignore
              colorsSts.addColor({name: color, hex: hex});
          }
      }
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
