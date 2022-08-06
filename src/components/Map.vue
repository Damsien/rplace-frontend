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

    var canvas: HTMLCanvasElement;
    var ctx: CanvasRenderingContext2D | null;

    // Document ready
    $(function() {
        canvas = <HTMLCanvasElement>$('#place')[0];
        ctx = canvas.getContext('2d');

        /* TEMP */
        canvas.width = 2000;
        canvas.height = 2000;
        // @ts-ignore
        ctx.fillStyle = 'white';
        // @ts-ignore
        ctx.fillRect(0, 0, 2000, 2000);
        // @ts-ignore
        ctx.fillStyle = 'green';
        // @ts-ignore
        ctx.fillRect(1980, 1000, 20, 20);
        // @ts-ignore
        ctx.fillRect(0, 1000, 20, 20);
        /* END TEMP */

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
                // router.push('/login');
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


        // MOUSE CONTROL
        const zoomElement = $('#place');
        let zoom = 30;
        let translationX = 0;
        let translationY = 0;
        zoomElement.css('transform', `scale(${zoom}%`);
        canvas.addEventListener('wheel', function (e: WheelEvent) {
            const centerX = window.innerWidth/2;
            const centerY = window.innerHeight/2;

            console.log('----');
            console.log(e.clientX);
            console.log(window.innerWidth/2);
            translationX += ((centerX - e.clientX) / window.innerWidth) * 100;
            translationY += ((centerY - e.clientY) / window.innerHeight) * 100;
            console.log(translationX);
            if (e.deltaY > 0) {
                // Zoom out
                if (zoom > 30) {
                    zoomElement.css('transform', `translate(${translationX}%, ${translationY}%) scale(${zoom -= 30}%)`);
                } else {
                    zoomElement.css('transform', `scale(${zoom}%)`);
                }
            } else {
                // Zoom in
                if (zoom < 240) {
                    zoomElement.css('transform', `translate(${translationX}%, ${translationY}%) scale(${zoom += 10}%)`);
                }
            }
        });


    });


    function setMap(width: number, map: []) {
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

<div id="screen">
    <div id="parent-canvas">
        <canvas id="place"></canvas>
    </div>
</div>

</template>

<style scoped>

#screen {
    position: relative;
    width: 100%;
    min-height: 100vh;
}

#parent-canvas {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
}

#place {
    image-rendering: pixelated;
}

</style>
