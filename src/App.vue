<script>
import { RouterLink, RouterView } from 'vue-router';
import io from "socket.io-client";
import { useTimerStore } from './stores/timer';
import { useMapStore } from './stores/map';
import { useColorsStore } from './stores/colors';

/*
w_indow.env.VITE_APP_BACKEND_API_URL
i_mport.meta.env.VITE_APP_BACKEND_API_URL
*/

  export const HEADERS = {
      'Accept': '*/*',
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Authorization': `Bearer ${localStorage.getItem('ACCESS_TOKEN')}`
  };

  export var socket = io(`${window.env.VITE_APP_BACKEND_URL}`, {
      extraHeaders: HEADERS
  });

  export function updateHeaders() {
    HEADERS['Authorization'] = 'Bearer ' + localStorage.getItem('ACCESS_TOKEN');
    socket = io(`${window.env.VITE_APP_BACKEND_URL}`, {
      extraHeaders: HEADERS
    });
    // if (localStorage.getItem('ACCESS_TOKEN') !== null) {
    //   socket.auth.token = localStorage.getItem('ACCESS_TOKEN');
    // }
  }

  let timerSts;

  // TIMER
  var timer = setInterval(() => {
    // if (timerSts.timeleft >= 0) {
    if (timerSts !== undefined) {
      timerSts.setTimeleft(timerSts.timeleft-1);
    } else {
      try {
        timerSts = useTimerStore();
      } catch (err) {}
    }
    // }
  }, 1000);

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
