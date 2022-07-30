<script setup lang="ts">
    import axios from 'axios';
    // @ts-ignore
    import $ from 'jquery';

    $(document).ready(() => {
        var canvas = $('#place')[0];
        var ctx = canvas.getContext('2d');

        axios.get('http://192.168.1.37:3000/api/v1/pixel/map', {
            headers: {
                'Accept': '*/*',
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImRkYXNzaWV1IiwicHNjb3BlIjoiaW5wIiwiaWF0IjoxNjU5MjE4MTA3LCJleHAiOjE2NTkyMTk5MDd9.8V3bu7W6YPyeoUkvrGR0oPudn3oGV2N2H5QxOCfUjUI'
            },
            method: 'GET',
        }).then(res => {
            let map: [] = res.data;
            map.forEach(pixel => {
                let x = pixel['coord_x'];
                let y = pixel['coord_y'];
                let color = pixel['color'];

                ctx.fillStyle = color;
                ctx.fillRect(x * 10, y * 10, 10, 10);
            });
        });
    });


</script>

<template>

  <button type="button">API GET test</button>

  <div class="controls"></div>

  <canvas id="place" height="200" width="200"></canvas>


</template>

<style scoped>

</style>
