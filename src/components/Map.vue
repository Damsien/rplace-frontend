<script setup lang="ts">
    import router from '@/router/index';
    import { useColorsStore } from '@/stores/colors.js';
    import { useTimerStore } from '@/stores/timer.js';
    import { useMapStore } from '@/stores/map.js';
    import { usePixelStore } from '@/stores/pixel.js';
    import { useUserStore } from '@/stores/user.js';
    import { usePatternStore } from '@/stores/pattern.js';
    import axios from 'axios';
    import $ from 'jquery';
    import io from "socket.io-client";
    import { refreshToken } from '@/auth.js';
    import panzoom from 'panzoom';
    import http from '@/router/http';
    import { HEADERS, socket } from '@/App.vue';
    import { ref, onMounted, onActivated } from 'vue'
    // https://github.com/thecodealer/vue-panzoom


    const timerSts = useTimerStore();
    const mapSts = useMapStore();
    const colorsSts = useColorsStore();
    const pixelSts = usePixelStore();
    const userSts = useUserStore();
    const patternSts = usePatternStore();
    var selector: {x: number, y: number};
    var colorSelected: string = 'none';
    var isFree = true;
    var lastPixelPlaced: Date;
    var perm = false;

    var canvas: HTMLCanvasElement;
    var ctx: CanvasRenderingContext2D;

    function rgbToHex(r: number, g: number, b: number) {
        if (r > 255 || g > 255 || b > 255)
            throw "Invalid color component";
        return ((r << 16) | (g << 8) | b).toString(16);
    }

    function removeLastSelector(x: number, y: number) {
        let pixelsArround: any[any[string]] = [];
        pixelsArround.push({color: ctx.getImageData(x+2, y+2, 1, 1).data, coord_x: x, coord_y: y});
        pixelsArround.push({color: ctx.getImageData(x-2, y-2, 1, 1).data, coord_x: x-10, coord_y: y-10});
        pixelsArround.push({color: ctx.getImageData(x+2, y-2, 1, 1).data, coord_x: x, coord_y: y-10});
        pixelsArround.push({color: ctx.getImageData(x+12, y-2, 1, 1).data, coord_x: x+10, coord_y: y-10});
        pixelsArround.push({color: ctx.getImageData(x+12, y+2, 1, 1).data, coord_x: x+10, coord_y: y});
        pixelsArround.push({color: ctx.getImageData(x+12, y+12, 1, 1).data, coord_x: x+10, coord_y: y+10});
        pixelsArround.push({color: ctx.getImageData(x+2, y+12, 1, 1).data, coord_x: x, coord_y: y+10});
        pixelsArround.push({color: ctx.getImageData(x-2, y+12, 1, 1).data, coord_x: x-10, coord_y: y+10});
        pixelsArround.push({color: ctx.getImageData(x-2, y+2, 1, 1).data, coord_x: x-10, coord_y: y});
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


    // On the the website loading
    function getMapUser() {

        // GET MAP + USER SPECS
        http.get(`http://${import.meta.env.VITE_APP_BACKEND_API_URL}/user/game/all`, {
            headers: HEADERS,
            method: 'GET',
        }).then(res => {

            // USER INFOS
            timerSts.setTimer(res.data.timer+0.01);
            colorsSts.clearColors();
            for(let color of res.data.colors) {
                colorsSts.addColor({
                    name: color.split(':')[0],
                    hex: color.split(':')[1]
                });
            }
            const now: Date = new Date(res.data.now);
            lastPixelPlaced = new Date(res.data.lastPixelPlaced);
            // @ts-ignore
            timerSts.setTimeleft(timerSts.timer-((now-lastPixelPlaced)/1000));

            // MAP
            const width = res.data.width;
            const map = res.data.map;
            mapSts.setWidth(width);
            mapSts.setMap(map);

            // USER INFO
            userSts.setPixelsPlaced(res.data.pixelsPlaced);
            userSts.setStickedPixels(res.data.stickedPixels);
            checkStickedPixels(userSts.user.stickedPixels);

            // APPLY STATES
            setMap(mapSts.width, mapSts.pixels);
            checkStickedPixels(userSts.user.stickedPixels);

            // TIMER
            const timer = setInterval(() => {
                if (timerSts.timeleft > 0) {
                    timerSts.setTimeleft(timerSts.timeleft-1);
                }
            }, 1000);

        });
    }


    function checkPattern() {
        // CHECK PATTERN
        if (router.currentRoute.value.query !== undefined) {
            let patternId = router.currentRoute.value.query.pattern;
            if (patternId !== undefined) {
                patternSts.setIsPatternUnset(true);
                http.get(`http://${import.meta.env.VITE_APP_BACKEND_API_URL}/pattern/${patternId}`, {
                    headers: HEADERS,
                    method: 'GET',
                }).then(res => {
                    setPatternMap(res.data);
                });
            }
        }
    }


    function checkStickedPixels(pxl: number) {
        if (pxl == 0) {
            $('#dropdown-content').addClass('display-none');
            $('#place-pixel').removeClass('btn-secondary');
            $('#place-pixel').addClass('btn-primary');
        } else {
            $('#dropdown-content').removeClass('display-none');
            $('#place-pixel').removeClass('btn-primary');
            $('#place-pixel').addClass('btn-secondary');
        }
    }


    // Each time the user reach the page
    onActivated(() => {
        checkPattern();
    })


    // First page load
    onMounted(() => {
        console.log('MOUNTED')
        
        getMapUser();

        canvas = <HTMLCanvasElement>$('#place')[0];
        // @ts-ignore
        ctx = canvas.getContext('2d');

        // UPDATE PIXEL
        socket.on('pixel', pixel => {
            mapSts.editPixel(pixel);
            pixel.coord_x -= 1;
            pixel.coord_y -= 1;
            setMapPixel(pixel);
        });

        // UPDATE USER
        socket.on('user', user => {
            if (user['stickedPixels'] !== undefined) {
                userSts.setStickedPixels(user.stickedPixels)
                checkStickedPixels(userSts.user.stickedPixels);
            }
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

    });


    // When document is ready
    $(function() {

        // PANZOOM
        const instance = panzoom(canvas, {
            minZoom: 1,
            maxZoom: 20,
            initialZoom: 1,
            zoomDoubleClickSpeed: 1,
            onDoubleClick: function(e) {
                isFree = false;
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

        
        function clickEvent(e: MouseEvent) {
            let x = e.offsetX-(e.offsetX%10);
            let y = e.offsetY-(e.offsetY%10);
            if(!isPanning) {
                $('#timer-box').css('border-color', '#3A3A3A');
                if(isFree) {
                    isFree = false;
                    setSelector(x, y);
                    displaySticked(pixelSts.pixel.coord_x, pixelSts.pixel.coord_y);
                } else {
                    setSelector(x, y);
                    if(! (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) ) {
                        isFree = true;
                    }
                }
            }
        }
        canvas.addEventListener('pointerup', function(e) {
            clickEvent(e);
        });
    });


    function displaySticked(coord_x: number, coord_y: number) {
        http.get(`http://${import.meta.env.VITE_APP_BACKEND_API_URL}/pixel`, {
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
            if(pixelSts.pixel.isUserGold) {
                $('#user-pixel').addClass('gold-user');
            } else {
                $('#user-pixel').removeClass('gold-user');
            }
            if(pixelSts.pixel.isSticked) {
                $('#place-pixel').addClass('btn btn-secondary');
                $('#timer-box').css('border-color', 'red');
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

        if (patternSts.pixels.find((el) => el['coord_x'] == x/10 && el['coord_y'] == y/10) !== undefined) {
            ctx.fillRect(x, y, 3, 10);
            ctx.fillRect(x, y, 10, 3);
            ctx.fillRect(x+7, y, 3, 10);
            ctx.fillRect(x, y+7, 10, 3);
        } else {
            ctx.fillRect(x, y, 10, 10);
        }

        if (selector !== undefined && selector.x == x && selector.y == y) {
            ctx.fillStyle = 'black';
            ctx.fillRect(x, y, 2, 1);
            ctx.fillRect(x, y, 1, 2);
            ctx.fillRect(x+8, y, 2, 1);
            ctx.fillRect(x+9, y, 1, 2);
            ctx.fillRect(x+8, y+9, 2, 1);
            ctx.fillRect(x+9, y+8, 1, 2);
            ctx.fillRect(x, y+9, 2, 1);
            ctx.fillRect(x, y+8, 1, 2);
        }
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

    
    function setPatternPixel(pixel: any) {
        let x = pixel['coord_x'] * 10;
        let y = pixel['coord_y'] * 10;
        let color = pixel['color'];
        
        ctx.fillStyle = color;
        ctx.fillRect(x+3, y+3, 4, 4);
    }


    function setPatternMap(map: []) {
        patternSts.setPixels(map);

        map.forEach(pixel => {
            // @ts-ignore
            pixel['coord_x'] -= 1;
            // @ts-ignore
            pixel['coord_y'] -= 1;
            setPatternPixel(pixel);
        });
    }

    function buf2hex(buffer: any) { // buffer is an ArrayBuffer
        return [...new Uint8Array(buffer)]
            .map(x => x.toString(16).padStart(2, '0'))
            .join('');
    }
    
    function unsetPatternPixel(pixel: any) {
        let x = (pixel['coord_x']+1) * 10;
        let y = (pixel['coord_y']+1) * 10;
        let color = '#'+buf2hex(ctx.getImageData(x+2, y+2, 1, 1).data).substring(0, 6)
        
        ctx.fillStyle = color;
        ctx.fillRect(x+3, y+3, 4, 4);

        if (selector !== undefined && selector.x == x && selector.y == y) {
            ctx.fillStyle = 'black';
            ctx.fillRect(x, y, 2, 1);
            ctx.fillRect(x, y, 1, 2);
            ctx.fillRect(x+8, y, 2, 1);
            ctx.fillRect(x+9, y, 1, 2);
            ctx.fillRect(x+8, y+9, 2, 1);
            ctx.fillRect(x+9, y+8, 1, 2);
            ctx.fillRect(x, y+9, 2, 1);
            ctx.fillRect(x, y+8, 1, 2);
        }
    }


    function unsetPatternMap() {
        patternSts.pixels.forEach(pixel => {
            // @ts-ignore
            pixel['coord_x'] -= 1;
            // @ts-ignore
            pixel['coord_y'] -= 1;
            unsetPatternPixel(pixel);
        });
        patternSts.setPixels([]);
        patternSts.setIsPatternUnset(false);
    }


    function setColor(name: string) {
        $(`.select-color`).removeClass('color-selected');
        colorSelected = name;
        if(selector && !isFree) {
            $(`#select-${colorSelected}`).addClass('color-selected');
        }
    }


    function placePermanentPixel() {
        perm = true;
        placePixel();
    }


    function placePixel() {
        if(colorSelected !== 'none' && selector && timerSts.timeleft == 0) {
            lastPixelPlaced = new Date();
            timerSts.setTimeleft(timerSts.timer);
            socket.emit('placePixel', {
                "coord_x": (selector.x / 10)+1,
                "coord_y": (selector.y / 10)+1,
                "color": colorSelected,
                "isSticked": perm
            });
        }
        perm = false;
    }

    
    function placeNormalPixel() {
        if (userSts.user.stickedPixels === 0) {
            placePixel();
        }
    }


    function goToUser() {
        router.push(`/user/${pixelSts.pixel.user.split('.')[0]}-${pixelSts.pixel.user.split('.')[1]}`);
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
                    <div @click="goToUser" class="cursor-pointer" id="user-pixel">
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
            <div class="dropdown mt-2">
                <form @submit.prevent="placeNormalPixel">
                    <div id="dropdown-content" class="dropdown-content">
                        <form @submit.prevent="placePixel">
                            <button type="submit">Normal</button>
                        </form>
                        <form @submit.prevent="placePermanentPixel">
                            <button type="submit">Permanent</button>
                        </form>
                    </div>
                    <button type="submit" id="place-pixel" class="btn btn-primary mb-0 px-2 pb-1 pt-0">Place pixel</button>
                    <svg class="ms-2 cursor-pointer" v-if="patternSts.isPatternUnset" @click="unsetPatternMap" width="30px" height="30px" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 300 300" shape-rendering="geometricPrecision" text-rendering="geometricPrecision"><rect width="254.840248" height="254.840248" rx="0" ry="0" transform="matrix(.813624 0 0 0.813623 46.327929 46.328056)" fill="none" stroke="#000" stroke-width="20"/><rect width="49.36256" height="49.36256" rx="0" ry="0" transform="matrix(.730833-.682556 0.682556 0.730833 19.922495 243.041471)" fill="#fcfcfc" stroke-width="0"/><rect width="49.36256" height="49.36256" rx="0" ry="0" transform="matrix(.730833-.682556 0.682556 0.730833 207.901175 56.927621)" fill="#fcfcfc" stroke-width="0"/><rect width="277.730091" height="22.126848" rx="0" ry="0" transform="matrix(.91938-.912865 0.704588 0.709616 14.535153 268.914301)" fill="#fd1111" stroke-width="0"/></svg>
                </form>
            </div>
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
  top: -60px;
  position: absolute;
  background-color: #f9f9f9;
  min-width: fill;
  box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
  z-index: 1;
}

.dropdown-content form {
  padding: 3px;
  padding-left: 10px;
  padding-right: 10px;
}

.dropdown-content a {
  color: black;
  padding: 2px 2px;
  text-decoration: none;
  display: inline-block;
}

.dropdown-content form:hover {background-color: #dfdfdf}

.dropdown:hover .dropdown-content {
  display: block;
}
.display-none {
  display: none !important;
}

.disabled{
  pointer-events: none;
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
    cursor: pointer
}

.select-color {
    width: 20px;
    height: 20px;
    cursor: pointer;
    border: solid 1px;
    border-color: black;
}

.cursor-pointer {
    cursor: pointer;
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
