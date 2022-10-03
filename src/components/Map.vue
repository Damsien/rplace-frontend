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
    const pixelSts = usePixelStore();
    var selector: {x: number, y: number};
    var colorSelected: string = 'none';
    var isFree = true;
    var lastPixelPlaced: Date;

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
            pixel.coord_x = (pixel.coord_x / 10)+2;
            pixel.coord_y = (pixel.coord_y / 10)+1;
            pixelSts.setPixel(pixel);
        }
    }

    function setSelector(x: number, y: number) {
        if(selector) {
            removeLastSelector(selector.x, selector.y);
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
            timerSts.setTimer(res.data.timer+0.01);
            mapSts.setWidth(res.data.width);
            for(let color of res.data.colors) {
                colorsSts.addColor({
                    name: color.split(':')[0],
                    hex: color.split(':')[1]
                });
            }
            const now = new Date(res.data.now);
            lastPixelPlaced = new Date(res.data.lastPixelPlaced);
            timerSts.setTimeleft(timerSts.timer-((now-lastPixelPlaced)/1000));
            const timer = setInterval(() => {
                if (timerSts.timeleft > 0) {
                    $('#place-pixel').removeClass('place-pixel-button');
                    timerSts.setTimeleft(timerSts.timeleft-1);
                }
            }, 1000);

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
            pixel.coord_x -= 1;
            pixel.coord_y -= 1;
            setMapPixel(pixel);
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
                for(let [color, hex] of Object.entries(Object.entries(game.colors)[0][1])) {
                    colorsSts.addColor({name: color, hex: hex});
                }
            }
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
        
        function clickEvent(e) {
            let x = e.offsetX-(e.offsetX%10);
            let y = e.offsetY-(e.offsetY%10);
            if(!isPanning) {
                if(isFree) {
                    isFree = false;
                    setSelector(x, y);
                    displaySticked(pixelSts.pixel.coord_x, pixelSts.pixel.coord_y);
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
        }
        canvas.addEventListener('pointerup', function(e) {
            clickEvent(e);
        });

    });


    function displaySticked(coord_x: number, coord_y: number) {
        axios.get(`http://${import.meta.env.VITE_APP_BACKEND_API_URL}/pixel`, {
            params: {
                coord_x: coord_x,
                coord_y: coord_y
            },
            headers: HEADERS,
            method: 'GET',
        }).then(res => {
            if (res.data.user != 'root.game') {
                pixelSts.setUser(res.data.user);
            }
            pixelSts.setIsSticked(res.data.isSticked);
            pixelSts.setIsUserGold(res.data.isUserGold);
            console.log(res.data)
            if(pixelSts.pixel.isUserGold) {
                $('#user-pixel').addClass('gold-user');
            } else {
                $('#user-pixel').removeClass('gold-user');
            }
        });
    }


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


    function setColor(name: string) {
        $(`.select-color`).removeClass('color-selected');
        colorSelected = name;
        if(selector && !isFree) {
            $('#place-pixel').addClass('place-pixel-button');
            $(`#select-${colorSelected}`).addClass('color-selected');
        }
    }


    function placePixel() {
        if(colorSelected !== 'none' && selector && timerSts.timeleft == 0) {
            let perm = false;
            if($("#set-perm").is(':checked')) {
                perm = true;
            }
            $('#place-pixel').removeClass('place-pixel-button');
            lastPixelPlaced = new Date();
            timerSts.setTimeleft(timerSts.timer);
            console.log(selector);
            socket.emit('placePixel', {
                "coord_x": (selector.x / 10)+1,
                "coord_y": (selector.y / 10)+1,
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
    <div id="timer-box" class="box-for-content">
        <div class="container">
            <div class="row">
                <div class="col-3">
                    <div class="text-center">
                    {{timerSts.minute}}m{{timerSts.second}}s
                    </div>
                </div>
                <div class="col-9">
                    <div class="text-center">
                    x: {{pixelSts.pixel.coord_x}} y: {{pixelSts.pixel.coord_y}}
                    </div>
                </div>
                <div class="col-12">
                    <div id="user-pixel">
                    {{pixelSts.pixel.user}}
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div id="select-pixel" class="box-for-content">
        <div id="select-color-container">
            <div v-for="color in colorsSts.colors" :key="color.name">
                <div :id="`select-${color.name}`" class="select-color"
                :style="{background: color.hex}" :title="color.name"
                @click="setColor(color.name)"
                @touchstart="setColor(color.name)"></div>
            </div>
        </div>
        <div>
            <div class="dropdown">
                <div class="dropdown-content">
                    <a href="#">Normal</a>
                    <a href="#">Permanent</a>
                </div>
                <button @click="placePixel" id="place-pixel" type="button" class="btn btn-primary mb-0 px-2 pb-1 pt-0 mt-2">Place pixel</button>
            </div>
            <!-- <input title="Set permanent" id="set-perm" class="form-check-input ms-3" type="checkbox" value="perm"> -->
        </div>
    </div>

</template>

<style scoped>


.gold-user {
    color: #f1b901;
}

.dropdown {
  position: relative;
  display: inline-block;
}

.dropdown-content {
  display: none;
  top: -50px;
  position: absolute;
  background-color: #f9f9f9;
  min-width: fill;
  box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
  z-index: 1;
}

.dropdown-content a {
  color: black;
  padding: 2px 2px;
  text-decoration: none;
  display: inline-block;
}

.dropdown-content a:hover {background-color: #f1f1f1}

.dropdown:hover .dropdown-content {
  display: block;
}

.dropdown:hover .dropbtn {
  background-color: #3e8e41;
}


#timer-box {
    top: 5%;
}

#set-perm {
    margin-top: 13px;
    width: 18px;
    height: 18px;
    cursor: pointer;
}

#place-pixel {
    cursor: not-allowed;
}

.place-pixel-button {
    cursor: pointer !important;
}

.select-color {
    width: 20px;
    height: 20px;
    cursor: pointer;
    border: solid 1px;
    border-color: black;
}

.color-selected {
    border: solid 2px;
    border-color: #0d6efd;
}

#select-color-container {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    width: auto;
}

@media (max-width: 320px) {
    #select-color-container {
        width: auto;
    }
    #select-pixel {
        top: 87% !important;
    }
}


.box-for-content {
    position: absolute;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: white;
    border-radius: 5px;
    padding: 5px;
    border: solid 2px;
    text-align: center;
}

#select-pixel {
    top: 92%;
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
