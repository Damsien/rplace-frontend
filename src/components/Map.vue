<script setup lang="ts">
    import router from '@/router/index';
    import { useColorsStore } from '@/stores/colors.js';
    import { useTimerStore } from '@/stores/timer.js';
    import { useMapStore } from '@/stores/map.js';
    import { usePixelStore } from '@/stores/pixel.js';
    import axios from 'axios';
    // @ts-ignore
    import $ from 'jquery';
    import io from "socket.io-client";
    import { refreshToken } from '@/auth.js';

    const TOKEN = localStorage.getItem('ACCESS_TOKEN');
    const HEADERS = {
                'Accept': '*/*',
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Authorization': `Bearer ${localStorage.getItem('ACCESS_TOKEN')}`
            };


    const timerSts = useTimerStore();
    const mapSts = useMapStore();
    const colorsSts = useColorsStore();


    // Document ready
    $(function() {


        // INIT SOCKET CONNEXION
        const socket = io(`http://${import.meta.env.VITE_APP_BACKEND_URL}`, {
            extraHeaders: HEADERS
        });



        // GET MAP + USER SPECS
        axios.get(`http://${import.meta.env.VITE_APP_BACKEND_API_URL}/user/game/all`, {
            headers: HEADERS,
            method: 'GET',
        }).then(res => {

            // USER INFOS
            timerSts.setTimer(res.data.timer);
            mapSts.setWidth(res.data.width);
            for(let color of res.data.colors) {
                colorsSts.addColor({
                    name: color.split(':')[0],
                    hex: color.split(':')[1]
                });
            }

            // MAP
            const width = res.data.width;
            const map: [] = res.data.map;
            setMap(width, map);

        }).catch(async err => {
            console.log(err);
            if(!await refreshToken()) {
                router.push('/login');
            }
        });


        // UPDATE PIXEL
        socket.on('pixel', pixel => {
            let x = pixel['coord_x'];
            let y = pixel['coord_y'];
            let color = pixel['color'];

            // @ts-ignore
            ctx.fillStyle = color;
            // @ts-ignore
            ctx.fillRect(x * 10, y * 10, 10, 10);
        });



    });


    function setMap(width: number, map: []) {
        var canvas = <HTMLCanvasElement>$('#place')[0];
        var ctx = canvas.getContext('2d');

        canvas.width = width * 10;
        canvas.height = width * 10;

        map.forEach(pixel => {
            let x = pixel['coord_x'];
            let y = pixel['coord_y'];
            let color = pixel['color'];

            // @ts-ignore
            ctx.fillStyle = color;
            // @ts-ignore
            ctx.fillRect(x * 10, y * 10, 10, 10);
        });
    }


    function getSinglePixel(coord_x: number, coord_y: number) {
        const pixelSts = usePixelStore();
        axios.get(`http://${import.meta.env.VITE_APP_BACKEND_API_URL}/pixel?coord_x=${coord_x}&coord_y=${coord_y}`, {
            headers: HEADERS,
            method: 'GET',
        }).then(res => {
            pixelSts.setPixel({
                coord_x: res.data['coord_x'],
                coord_y: res.data['coord_y'],
                color: res.data['color'],
                user: res.data['user'].split('.')[1],
                date: res.data['data']
            });
        }).catch(async err => {
            if(!await refreshToken()) {
                router.push('/login');
            }
        });
    }


</script>

<template>

    <canvas id="place" height="200" width="200"></canvas>


</template>

<style scoped>

</style>
