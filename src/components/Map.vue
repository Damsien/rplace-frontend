<script setup lang="ts">
    import router from '@/router/index';
    import { useColorsStore } from '@/stores/colors.js';
    import { useTimerStore } from '@/stores/timer.js';
    import { useMapStore } from '@/stores/map.js';
    import { usePixelStore } from '@/stores/pixel.js';
    import axios from 'axios';
    import $ from 'jquery';
    import io from "socket.io-client";
    import { refreshToken } from '@/auth.js';
    import panzoom from 'panzoom';
    // https://github.com/thecodealer/vue-panzoom

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
    var selector: {x: number, y: number};
    var colorSelected: string = 'none';
    var isFree = true;

    var canvas: HTMLCanvasElement;
    var ctx: CanvasRenderingContext2D;

    const socket = io(`http://${import.meta.env.VITE_APP_BACKEND_URL}`, {
        extraHeaders: HEADERS
    });

    function rgbToHex(r: number, g: number, b: number) {
        if (r > 255 || g > 255 || b > 255)
            throw "Invalid color component";
        return ((r << 16) | (g << 8) | b).toString(16);
    }

    function removeLastSelector(x: number, y: number) {
        let pixelsArround: any[any[string]] = [];
        pixelsArround.push({color: ctx.getImageData(x+3, y+3, 1, 1).data, coord_x: x, coord_y: y});
        pixelsArround.push({color: ctx.getImageData(x-3, y-3, 1, 1).data, coord_x: x-10, coord_y: y-10});
        pixelsArround.push({color: ctx.getImageData(x+3, y-3, 1, 1).data, coord_x: x, coord_y: y-10});
        pixelsArround.push({color: ctx.getImageData(x+13, y-3, 1, 1).data, coord_x: x+10, coord_y: y-10});
        pixelsArround.push({color: ctx.getImageData(x+13, y+3, 1, 1).data, coord_x: x+10, coord_y: y});
        pixelsArround.push({color: ctx.getImageData(x+13, y+13, 1, 1).data, coord_x: x+10, coord_y: y+10});
        pixelsArround.push({color: ctx.getImageData(x+3, y+13, 1, 1).data, coord_x: x, coord_y: y+10});
        pixelsArround.push({color: ctx.getImageData(x-3, y+13, 1, 1).data, coord_x: x-10, coord_y: y+10});
        pixelsArround.push({color: ctx.getImageData(x-3, y+3, 1, 1).data, coord_x: x-10, coord_y: y});
        for(let pixel of pixelsArround) {
            pixel['color'] = "#" + ("000000" + rgbToHex(
                pixel.color[0],
                pixel.color[1],
                pixel.color[2]
            )).slice(-6);
            setPixel(pixel);
        }
    }

    function setSelector(x: number, y: number) {
        if(selector) {
            removeLastSelector(selector.x, selector.y)
        }

        selector = {x:x, y:y};

        ctx.fillStyle = 'lightgrey';
        ctx.fillRect(x-1, y-1, 1, 3);
        ctx.fillRect(x-1, y-1, 3, 1);
        ctx.fillRect(x+8, y-1, 3, 1);
        ctx.fillRect(x+10, y-1, 1, 3);
        ctx.fillRect(x-1, y+10, 3, 1);
        ctx.fillRect(x-1, y+8, 1, 3);
        ctx.fillRect(x+10, y+8, 1, 3);
        ctx.fillRect(x+8, y+10, 3, 1);
        ctx.fillStyle = 'black';
        ctx.fillRect(x+0, y+0, 1, 2);
        ctx.fillRect(x+0, y+0, 2, 1);
        ctx.fillRect(x+9, y+0, 1, 2);
        ctx.fillRect(x+8, y+0, 2, 1);
        ctx.fillRect(x+0, y+9, 2, 1);
        ctx.fillRect(x+0, y+8, 1, 2);
        ctx.fillRect(x+9, y+8, 1, 2);
        ctx.fillRect(x+8, y+9, 2, 1);
    }

    // Document ready
    $(function() {

        canvas = <HTMLCanvasElement>$('#place')[0];
        ctx = canvas.getContext('2d');

        // INIT SOCKET CONNEXION


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
            console.log(res.data.colors);

            // MAP
            const width = res.data.width;
            const map = res.data.map;
            setMap(width, map);

        }).catch(async err => {
            console.log(err);
            if(!await refreshToken()) {
                router.push('/login');
            }
        });


        // UPDATE PIXEL
        socket.on('pixel', pixel => {
           setMapPixel(pixel);
        });


        // PANZOOM
        const instance = panzoom(canvas, {
            minZoom: 1,
            maxZoom: 20,
            initialZoom: 1,
            zoomDoubleClickSpeed: 1,
            onDoubleClick: function(e) {
                isFree = false;
                if(colorSelected !== 'none') {
                    $('#place-pixel').addClass('place-pixel-button');
                }
                return false;
            }
        });
        var panStacking = 0;
        var isPanning = false;
        var canvaSize;
        var right;
        var left;
        var top;
        var bot;
        instance.on('pan', function(e) {
            canvaSize = canvas.getBoundingClientRect();
            right = Math.round(canvaSize.right-(window.innerWidth/2));
            left = Math.round((window.innerWidth/2)-(canvaSize.right-canvaSize.width));
            top = Math.round((window.innerHeight/2)-canvaSize.top);
            bot = Math.round((canvaSize.top+canvaSize.height)-(window.innerHeight/2));
            if (right < 0 || left < 0 || top < 0 || bot < 0) {
                panStacking++;
                if (panStacking > 80) {
                    instance.moveTo(selector.x ?? 0, selector.y ?? 0);
                }
            }
        });
        instance.on('panstart', function(e) {
            panStacking = 0;
            isPanning = true;
        });
        instance.on('panend', function(e) {
            isPanning = false;
        });


        if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
            isFree = false;
        }
        // PIXEL SELECTION
        canvas.addEventListener('mousemove', function(e) {
            if(!isPanning && isFree) {
                let x = e.offsetX-(e.offsetX%10);
                let y = e.offsetY-(e.offsetY%10);

                setSelector(x, y);
            }
        });
        canvas.addEventListener('mouseup', function(e) {
            let x = e.offsetX-(e.offsetX%10);
            let y = e.offsetY-(e.offsetY%10);
            if(!isPanning) {
                if(isFree) {
                    isFree = false;
                    setSelector(x, y);
                    if(colorSelected !== 'none') {
                        $('#place-pixel').addClass('place-pixel-button');
                    }
                } else {
                    setSelector(x, y);
                    if(! (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) ) {
                        isFree = true;
                        $('#place-pixel').removeClass('place-pixel-button');
                    } else {
                        if(colorSelected !== 'none') {
                            $('#place-pixel').addClass('place-pixel-button');
                        }
                    }
                }
            }
        });

    });


    function setPixel(pixel: any) {
        let x = pixel['coord_x'];
        let y = pixel['coord_y'];
        let color = pixel['color'];

        ctx.fillStyle = color;
        ctx.fillRect(x+0, y+0, 1, 2);
        ctx.fillRect(x+0, y+0, 2, 1);
        ctx.fillRect(x+9, y+0, 1, 2);
        ctx.fillRect(x+8, y+0, 2, 1);
        ctx.fillRect(x+0, y+9, 2, 1);
        ctx.fillRect(x+0, y+8, 1, 2);
        ctx.fillRect(x+9, y+8, 1, 2);
        ctx.fillRect(x+8, y+9, 2, 1);
    }


    function setMapPixel(pixel: any) {
        let x = pixel['coord_x'] * 10;
        let y = pixel['coord_y'] * 10;
        let color = pixel['color'];
        
        ctx.fillStyle = color;
        ctx.fillRect(x, y, 10, 10);
    }


    function setMap(width: number, map: [] | any[]) {
        canvas.width = width * 10;
        canvas.height = width * 10;

        map.forEach(pixel => {
            pixel['coord_x'] -= 1;
            pixel['coord_y'] -= 1;
            setMapPixel(pixel);
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


    function setColor(name: string) {
        colorSelected = name;
        if(selector && !isFree) {
            $('#place-pixel').addClass('place-pixel-button');
        }
    }


    function placePixel() {
        if(colorSelected !== 'none' && selector) {
            let perm = false;
            if($("#set-perm").is(':checked')) {
                perm = true;
            }
            $('#place-pixel').removeClass('place-pixel-button');
            socket.emit('placePixel', {
                "coord_x": selector.x / 10,
                "coord_y": selector.y / 10,
                "color": colorSelected,
                "isSticked": perm
            });
            colorSelected = 'none';
        }
    }


</script>

<template>

    <div id="parent-canvas">
        <canvas id="place"></canvas>
    </div>
    <div id="select-pixel">
        <div id="select-color-container">
            <div v-for="color in colorsSts.colors" :key="color.name">
                <div :id="`select-${color.name}`" class="select-color"
                 :style="{background: color.hex}" :title="color.name"
                 @click="setColor(color.name)"></div>
            </div>
        </div>
        <p @click="placePixel" id="place-pixel" class="mb-0 px-2 pb-1 mt-2">Place pixel</p>
        <div id="set-perm-div">
            <input title="Set permanent" type="checkbox" id="set-perm" value="perm">
        </div>
    </div>

</template>

<style scoped>

#set-perm {
    width: 18px;
    height: 18px;
}

#set-perm-div {
    position: relative;
    float: right;
    top: 13px;
}

#place-pixel {
    position: relative;
    display: inline-block;
    border-radius: 3px;
    left: 50%;
    transform: translateX(-50%);
    color: white;
    background-color: #2c3e50;
    cursor: not-allowed;
}

.place-pixel-button {
    cursor: pointer !important;
}

.select-color {
    width: 20px;
    height: 20px;
    cursor: pointer;
}

#select-color-container {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
}

#select-pixel {
    position: absolute;
    top: 92%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: white;
    border-radius: 5px;
    padding: 5px;
    border: solid 2px;
}

#parent-canvas {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) scale(0.2);
}

#place {
    image-rendering: pixelated;
}

</style>
