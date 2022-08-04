<script setup lang="ts">
    import { refreshToken } from '@/auth.js';
    import { useColorsStore } from '@/stores/colors.js';
    import { useTimerStore } from '@/stores/timer.js';
    import axios from 'axios';
    // @ts-ignore
    import $ from 'jquery';
    import io from "socket.io-client";

    const TOKEN = localStorage.getItem('ACCESS_TOKEN');
    const HEADERS = {
                'Accept': '*/*',
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Authorization': `Bearer ${TOKEN}`
            };

    const socket = io(`http://${import.meta.env.VITE_APP_BACKEND_URL}`, {
        extraHeaders: HEADERS
    });

    const timer = useTimerStore();
    const map = useTimerStore();
    const colors = useColorsStore();


    // Document ready
    $(function() {


        $('#tile').on('click', () => {
            placePixel();
        });

    });


    function placePixel() {
        socket.emit('placePixel', {
            "coord_x": 6,
            "coord_y": 11,
            "color": "green"
        },
        async (_: any) => {
            if(await refreshToken()) {
                placePixel();
            } else {
                // TODO go to login
            }
        });
    }


</script>

<template>

    <button id="tile">Place tile</button>

    <div class="controls"></div>

    <canvas id="place" height="200" width="200"></canvas>


</template>

<style scoped>

</style>
