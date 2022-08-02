<script setup lang="ts">
    import axios from 'axios';
    // @ts-ignore
    import $ from 'jquery';
    import io from "socket.io-client";

    const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImRkYXNzaWV1IiwicHNjb3BlIjoiaW5wIiwiaWF0IjoxNjU5MjY1MTcwLCJleHAiOjE2NTkyNjY5NzB9.g_NZsrWoS_6WrnR0YbEmKqauV2TGLUz1lMZ1VnfkROQ';

    $(function() {
        var canvas = <HTMLCanvasElement>$('#place')[0];
        var ctx = canvas.getContext('2d');

        axios.get('http://192.168.1.37:3000/api/v1/user/game-all', {
            headers: {
                'Accept': '*/*',
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Authorization': `Bearer ${TOKEN}`
            },
            method: 'GET',
        }).then(res => {

            const width = res.data['width'];
            canvas.width = width * 10;
            canvas.height = width * 10;

            const map: [] = res.data['map'];
            map.forEach(pixel => {
                let x = pixel['coord_x'];
                let y = pixel['coord_y'];
                let color = pixel['color'];

                // @ts-ignore
                ctx.fillStyle = color;
                // @ts-ignore
                ctx.fillRect(x * 10, y * 10, 10, 10);
            });
        });


        const socket = io('http://192.168.1.37:3000', {
            extraHeaders: {
                Authorization: `Bearer ${TOKEN}`
            }
        });

        socket.on('pixel', pixel => {
            let x = pixel['coord_x'];
            let y = pixel['coord_y'];
            let color = pixel['color'];

            // @ts-ignore
            ctx.fillStyle = color;
            // @ts-ignore
            ctx.fillRect(x * 10, y * 10, 10, 10);
        });

        $('#tile').on('click', () => {
            socket.emit('placePixel', {
                "coord_x": 6,
                "coord_y": 11,
                "color": "green"
            })
        });


    });


</script>

<template>

    <button id="tile">Place tile</button>

    <div class="controls"></div>

    <canvas id="place" height="200" width="200"></canvas>


</template>

<style scoped>

</style>
