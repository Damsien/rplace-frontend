<script setup lang="ts">
    import router from '@/router/index';
    import { useColorsStore } from '@/stores/colors.js';
    import { useTimerStore } from '@/stores/timer.js';
    import { useMapStore } from '@/stores/map.js';
    import { usePixelStore } from '@/stores/pixel.js';
    import { useUserStore } from '@/stores/user.js';
    import { usePatternStore } from '@/stores/pattern.js';
    import axios from 'axios';
    import $, { map } from 'jquery';
    import { refreshToken } from '@/auth.js';
    import panzoom from 'panzoom';
    import http from '@/router/http';
    import { HEADERS, socket, updateHeaders } from '@/App.vue';
    import { ref, onMounted, onActivated } from 'vue'
    import { getAndSetUser } from '@/user';
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
        }
    }

    function setSelector(x: number, y: number) {
        if(selector) {
            if (x < 0 || y < 0 || x > (mapSts.width*10)-1 || y > (mapSts.width*10)-1) {
                return;
            }
            removeLastSelector(selector.x, selector.y);
            pixelSts.setCoords((x/10)+1, (y/10)+1);
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
        http.get(`${window.env.VITE_APP_BACKEND_API_URL}/user/game/all`, {
            headers: HEADERS,
            method: 'GET',
        }).then(res => {

            // USER INFOS
            timerSts.setTimer(res.data.timer+0.01);
            colorsSts.clearColors();
            for(let color of res.data.colors) {
                colorsSts.addColor({
                    name: color.name,
                    // @ts-ignore
                    hex: color.hex
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
            mapSts.clearMap();
            mapSts.setMap(map);

            // USER INFO
            userSts.setPixelsPlaced(res.data.pixelsPlaced);
            userSts.setStickedPixels(res.data.stickedPixels);

            // APPLY STATES
            setMap(mapSts.width, mapSts.pixels);
            checkStickedPixels(userSts.user.stickedPixels);

            
            // CHECK PATTERNS
            checkPattern();

        });
    }


    function checkPattern() {
        // CHECK PATTERN
        let patternId = router.currentRoute.value.params.id;
        if (patternId !== undefined || patternSts.isPatternSet) {
            patternSts.setIsPatternSet(true);
            if (patternId === undefined) {
                patternId = patternSts.currentPatternId;
            } else {
                patternSts.setCurrentPatternId(patternId);
            }
            http.get(`${window.env.VITE_APP_BACKEND_API_URL}/pattern/${patternId}`, {
                headers: HEADERS,
                method: 'GET',
            }).then(res => {
                if (res === undefined) {
                    unsetPatternMap();
                }
                setPatternMap(res.data);
            });
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


    function loadMapAndSockets() {
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

        // UPDATE WHEN USER SCOPE CHANGES OCCURS
        socket.on('user', user => {
            if (user.stickedPixels) {
                userSts.setStickedPixels(user.stickedPixels)
                checkStickedPixels(userSts.user.stickedPixels);
            }
            if (user.bombs) {
                userSts.setBombs(user.bombAvailable);
            }
            if (user.timer) {
                timerSts.setTimer(user.timer);
            }
            if (user.colors) {
                for (let color of user.colors) {
                    colorsSts.addColor({name: color.name, hex: color.hex});
                }
            }
        });


        // UPDATE WHEN GLOBAL GAME CHANGES OCCURS
        socket.on('game', game => {
            if (game.width) {
                mapSts.setWidth(game.width);
                canvas.width = mapSts.width * 10;
                canvas.height = mapSts.width * 10;
                // @ts-ignore
                ctx.fillStyle = 'white';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                const pixels = mapSts.pixels;
                pixels.forEach(pixel => {
                    setMapPixel(pixel);
                });
            }
            if (game.timer) {
                console.log(game.timer)
                console.log(timerSts.timer+(game.timer))
                timerSts.setTimer(timerSts.timer+(game.timer));
            }
            if (game.colors) {
                colorsSts.clearColors();
                for (let color of game.colors) {
                    colorsSts.addColor({name: color.name, hex: color.hex});
                }
            }
        });
    }


    // Each time the user reach the page
    onActivated(() => {
        console.log('ACTIVATED')
        console.log('Is socket connected ? ' + socket.connected)

        // If the component was already mounted without being logged -> the map will not be loaded anymore
        // So we need to reload the website
        if (router.currentRoute.value.query['login'] === 'true') {
            loadMapAndSockets();
        }

        // Check if a pattern is apply
        clearPatternMap();
        checkPattern();

        if(!mountedState) {
            // Reset the user state
            getAndSetUser(`${window.env.VITE_APP_BACKEND_API_URL}/user/spec`);
        }

        mountedState = false;
    })

    var mountedState: boolean = false;

    // First page load
    onMounted(() => {
        console.log('MOUNTED')

        mountedState = true;

        socket.on('disconnect', (reason) => {
            console.log("SOCKET DISCONNECTED")
            console.log('Reason : ' + reason)
            console.log('Is socket connected ? ' + socket.connected)
        });
        socket.on('connect', function(){
            console.log("SOCKET CONNECTED")
        });
        socket.on("connect_error", (err) => {
            // if (localStorage.getItem('ACCESS_TOKEN') !== null) {
            //         socket.auth.token = localStorage.getItem('ACCESS_TOKEN');
            // }
            updateHeaders();

            // socket.connect();

            console.log("SOCKET ERROR")
            console.log(err)
            console.log('Is socket connected ? ' + socket.connected)
            location.reload();
        });
        socket.io.on("reconnection_attempt", () => {
            console.log("SOCKET reconnection_attempt")
            console.log('Is socket connected ? ' + socket.connected)
            location.reload();
        });
        socket.io.on("reconnect", () => {
            console.log("SOCKET reconnect")
            console.log('Is socket connected ? ' + socket.connected)
            location.reload();
        });
        
        $('#dropdown-content').addClass('display-none');
        loadMapAndSockets();

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


        // if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
        isFree = false;
        // }
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
                    pixelSts.setUser('');
                    setSelector(x, y);
                    // if(! (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) ) {
                        // isFree = true;
                    // } else {
                    displaySticked(pixelSts.pixel.coord_x, pixelSts.pixel.coord_y);
                    // }
                }
            }
        }
        canvas.addEventListener('pointerup', function(e) {
            clickEvent(e);
        });
    });


    function displaySticked(coord_x: number, coord_y: number) {
        http.get(`${window.env.VITE_APP_BACKEND_API_URL}/pixel`, {
            params: {
                coord_x: coord_x,
                coord_y: coord_y
            },
            headers: HEADERS,
            method: 'GET',
        }).then(res => {
            if (res.data.user != 'root.game') {
                pixelSts.setUser(res.data.user);
            } else {
                pixelSts.setUser('');
            }
            pixelSts.setIsSticked(res.data.isSticked);
            pixelSts.setIsUserGold(res.data.isUserGold);
            if(pixelSts.pixel.isSticked) {
                $('#place-pixel').removeClass('btn-primary');
                $('#place-pixel').addClass('btn-secondary');
                $('#timer-box').css('border-color', 'red');
            } else {
                if (userSts.user.stickedPixels <= 0) {
                    $('#place-pixel').removeClass('btn-secondary');
                    $('#place-pixel').addClass('btn-primary');
                }
            }
            mapSts.editPixel(res.data);
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
        if (pixel.entityId != undefined) {
            if (pixel.entityId.split('-')[0]-1 != pixel.coord_x || pixel.entityId.split('-')[1]-1 != pixel.coord_y) {
                return;
            }
        }

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

        placeAllPixels(map);
    }


    function placeAllPixels(map: [] | any[]) {
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


    function clearPatternMap() {
        patternSts.pixels.forEach(pixel => {
            // @ts-ignore
            pixel['coord_x'] -= 1;
            // @ts-ignore
            pixel['coord_y'] -= 1;
            unsetPatternPixel(pixel);
        });
        patternSts.setPixels([]);
        // router.push('/');
    }

    function unsetPatternMap() {
        patternSts.setIsPatternSet(false);
        clearPatternMap();
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
        const coordX = (selector.x / 10)+1;
        const coordY = (selector.y / 10)+1;
        const isSticked = mapSts.pixels.find((el) => el.coord_x == coordX && el.coord_y == coordY)?.isSticked;
        if(colorSelected !== 'none' && selector && timerSts.timeleft == 0 
         && (perm || (!isSticked && !perm))) {
            lastPixelPlaced = new Date();
            timerSts.setTimeleft(timerSts.timer);
            if (perm) {
                userSts.setStickedPixels(userSts.user.stickedPixels-1);
                checkStickedPixels(userSts.user.stickedPixels);
            }
            // updateHeaders()
            socket.emit('placePixel', {
                "coord_x": coordX,
                "coord_y": coordY,
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
                <div class="col-12" style="font-size: 17px;">
                    <router-link v-if="pixelSts.pixel.isUserGold" :to="'/user/'+pixelSts.user" class="cursor-pointer gold-user text-decoration-none" id="user-pixel">
                        {{pixelSts.pixel.user}}
                    </router-link>
                    <router-link v-else :to="'/user/'+pixelSts.user" class="cursor-pointer text-decoration-none" id="user-pixel">
                        {{pixelSts.pixel.user}}
                    </router-link>
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
                        <!-- <form @submit.prevent="placePixel">
                            <button type="submit">Normal</button>
                        </form>
                        <form @submit.prevent="placePermanentPixel">
                            <button type="submit">Permanent</button>
                        </form> -->
                        <input type="checkbox">
                    </div>
                    <button type="submit" id="place-pixel" class="btn btn-primary mb-0 px-2 pb-1 pt-0">Place pixel</button>
                    <svg class="ms-2 cursor-pointer" v-if="patternSts.isPatternSet" @click="unsetPatternMap" width="30px" height="30px" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 300 300" shape-rendering="geometricPrecision" text-rendering="geometricPrecision"><rect width="254.840248" height="254.840248" rx="0" ry="0" transform="matrix(.813624 0 0 0.813623 46.327929 46.328056)" fill="none" stroke="#000" stroke-width="20"/><rect width="49.36256" height="49.36256" rx="0" ry="0" transform="matrix(.730833-.682556 0.682556 0.730833 19.922495 243.041471)" fill="#fcfcfc" stroke-width="0"/><rect width="49.36256" height="49.36256" rx="0" ry="0" transform="matrix(.730833-.682556 0.682556 0.730833 207.901175 56.927621)" fill="#fcfcfc" stroke-width="0"/><rect width="277.730091" height="22.126848" rx="0" ry="0" transform="matrix(.91938-.912865 0.704588 0.709616 14.535153 268.914301)" fill="#fd1111" stroke-width="0"/></svg>
                </form>
            </div>
        </div>
    </div>

</template>

<style scoped>


.gold-user {
    color: #f1b901;
    text-shadow: 0 0 0.5px rgb(63, 63, 63);
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
    border-color: black;
}

#select-pixel {
    top: 92%;
    border: solid 1px black;
}

#parent-canvas {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) scale(0.7);
}

#place {
    image-rendering: pixelated;
}

</style>
