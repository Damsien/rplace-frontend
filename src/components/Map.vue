<script setup lang="ts">
    import router from '@/router/index';
    import { useColorsStore } from '@/stores/colors.js';
    import { useTimerStore } from '@/stores/timer.js';
    import { useMapStore } from '@/stores/map.js';
    import { usePixelStore } from '@/stores/pixel.js';
    import { useUserStore } from '@/stores/user.js';
    import { usePatternStore } from '@/stores/pattern.js';
    import { Modal } from 'bootstrap';
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
    var selector: {x: number, y: number} = {x: 0, y: 0};
    var colorSelected: string = 'none';
    var isFree = false;
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
                    hex: color.hex,
                    isColorUser: color.isColorUser
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
            // $('#parent-canvas').css('transform', `translate(-50%, -50%) scale(${width*0.7/50})`);

            // USER INFO
            userSts.setPixelsPlaced(res.data.pixelsPlaced);
            userSts.setStickedPixels(res.data.stickedPixels);

            // APPLY STATES
            setMap(mapSts.width, mapSts.pixels);
            checkStickedPixels(userSts.user.stickedPixels, pixelSts.pixel.isSticked);

            
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
                    clearPatternMap();
                }
                setPatternMap(res.data);
            });
            // router.replace('/');
        } else {
            clearPatternMap();
        }
    }


    function checkStickedPixels(pxl: number, isSticked: boolean) {
        if (isSticked) {
            $('#place-pixel').addClass('btn-secondary');
            $('#place-pixel').removeClass('btn-primary');
            if (pxl > 0) {
                $('#perm-checkbox-input').removeClass('display-none');
                if ($('#perm-checkbox').is(':checked')) {
                    $('#place-pixel').removeClass('btn-secondary');
                    $('#place-pixel').addClass('btn-primary');
                }
            } else {
                $('#perm-checkbox-input').addClass('display-none');
            }
        } else {
            if (pxl > 0) {
                $('#perm-checkbox-input').removeClass('display-none');
            } else {
                $('#perm-checkbox-input').addClass('display-none');
            }
            $('#place-pixel').removeClass('btn-secondary');
            $('#place-pixel').addClass('btn-primary');
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
                checkStickedPixels(userSts.user.stickedPixels, pixelSts.pixel.isSticked);
                $('#bonus-event').html(`Got ${user.stickedPixels} permanent pixels !`);
            }
            if (user.bombs) {
                userSts.setBombs(user.bombAvailable);
                $('#bonus-event').html(`Got ${user.bombs} bombs !`);
            }
            if (user.timer) {
                timerSts.setTimer(user.timer);
                $('#bonus-event').html(`New timer : ${parseInt(timerSts.timer.toFixed())-1}s`);
            }
            if (user.colors) {
                for (let color of user.colors) {
                    colorsSts.addColor({name: color.name, hex: color.hex, isColorUser: true});
                }
                $('#bonus-event').html(`Got new colors !`);
            }
            $('#liveToast').show();
        });
        $('#liveToast').on('click', function() {
            $('#liveToast').hide();
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
                $('#liveToast').show();
            }
            if (game.timer) {
                timerSts.setTimer(timerSts.timer+(game.timer));
                $('#bonus-event').html(`New timer : ${parseInt(timerSts.timer.toFixed())-1}s`);
                $('#liveToast').show();
            }
            if (game.colors) {
                colorsSts.clearColorsGame()
                for (let color of game.colors) {
                    colorsSts.addColorGame({name: color.name, hex: color.hex, isColorUser: false});
                }
                $('#bonus-event').html(`Got new colors !`);
                $('#liveToast').show();
            }
            if(game.stop) {
                getAndSetUser(`${window.env.VITE_APP_BACKEND_API_URL}/user/spec`).then(val => {
                    $('#favorite-color').css('background-color', userSts.user.favColor);
                    // $('#game-over').modal({
                    //     backdrop: 'static',
                    //     keyboard: false
                    // })
                    const modal = new Modal(document.getElementById('game-over') ?? '', {});
                    modal.show();
                    $('#game-ready').addClass('display-none');
                    $('#select-color-container').addClass('display-none');
                });
            }
        });
    }

    function modalClosed() {
        router.go();
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
        }
        // Reset the user state
        getAndSetUser(`${window.env.VITE_APP_BACKEND_API_URL}/user/spec`).then(val => {
            checkStickedPixels(userSts.user.stickedPixels, pixelSts.pixel.isSticked)
        });

        http.get(`${window.env.VITE_APP_BACKEND_API_URL}/user/game-state`, {
            headers: HEADERS,
            method: 'GET',
        }).then(res => {
            if (res.data.state == 'Occurs') {
                $('#game-ready').removeClass('display-none');
                $('#select-color-container').removeClass('display-none');
            }
        });

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
            try {
                socket.disconnect();
            } catch (err) {}
            socket.connect();

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
        
        $('#perm-checkbox-input').addClass('display-none');
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
                // pixelSts.setUser('');
                setSelector(x, y);
                displaySticked(pixelSts.pixel.coord_x, pixelSts.pixel.coord_y);
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
                // $('#place-pixel').removeClass('btn-primary');
                // $('#place-pixel').addClass('btn-secondary');
                $('#timer-box').css('border-color', 'red');
            } else {
                // if (userSts.user.stickedPixels <= 0) {
                    // $('#place-pixel').removeClass('btn-secondary');
                    // $('#place-pixel').addClass('btn-primary');
                    $('#timer-box').css('border-color', '#3A3A3A');
                // }
            }
            checkStickedPixels(userSts.user.stickedPixels, res.data.isSticked);
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
        patternSts.setIsPatternSet(false);
        patternSts.pixels.forEach(pixel => {
            // @ts-ignore
            pixel['coord_x'] -= 1;
            // @ts-ignore
            pixel['coord_y'] -= 1;
            unsetPatternPixel(pixel);
        });
        patternSts.setPixels([]);
    }

    function unsetPatternMap() {
        clearPatternMap();
        router.replace('/');
    }


    function setColor(name: string) {
        $(`.select-color`).removeClass('color-selected');
        colorSelected = name;
        if(selector && !isFree) {
            $(`#select-${colorSelected}`).addClass('color-selected');
        }
    }


    function placePixel() {
        const coordX = (selector.x / 10)+1;
        const coordY = (selector.y / 10)+1;
        // const isSticked = mapSts.pixels.find((el) => el.coord_x == coordX && el.coord_y == coordY)?.isSticked;
        const isSticked = pixelSts.pixel.isSticked;
        if(colorSelected !== 'none' && selector && timerSts.timeleft == 0 
         && (perm || (!isSticked && !perm))) {
            lastPixelPlaced = new Date();
            timerSts.setTimeleft(timerSts.timer);
            if (perm) {
                userSts.setStickedPixels(userSts.user.stickedPixels-1);
                checkStickedPixels(userSts.user.stickedPixels, isSticked);
                if (userSts.user.stickedPixels <= 0) {
                    $('#perm-checkbox').prop('checked', false);
                    permCheck();
                }
            }
            // updateHeaders()
            socket.emit('placePixel', {
                "coord_x": coordX,
                "coord_y": coordY,
                "color": colorSelected,
                "isSticked": perm
            });
            if (userSts.user.pscope) {
                pixelSts.setUser(`${userSts.user.pscope}.${userSts.user.username}`)
                pixelSts.setIsUserGold(userSts.user.isGold)
            }
            pixelSts.setIsSticked(perm);
            if (perm) {
                $('#timer-box').css('border-color', 'red');
            }
        }
        perm = false;
    }


    function permCheck() {
        if ($('#perm-checkbox').is(':checked')) {
            $('#place-perm-pixel-text').removeClass('display-none')
            $('#place-pixel-text').addClass('display-none')
        } else {
            $('#place-pixel-text').removeClass('display-none')
            $('#place-perm-pixel-text').addClass('display-none')
        }
        checkStickedPixels(userSts.user.stickedPixels, pixelSts.pixel.isSticked);
    }
    
    function placePixelClick() {
        if ($('#perm-checkbox').is(':checked')) {
            perm = true;
        } else {
            perm = false;
        }
        placePixel();
    }


</script>

<template>

    <div id="game-over" class="modal fade" href="#" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">The game is over !</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" @click="modalClosed"></button>
                </div>
                <div class="modal-body">
                    <p>Your rank is #{{ userSts.user.rank }} ✨</p>
                    <p v-if="userSts.user.groupRank" >Your group rank {{userSts.user.groupRank}} 🔥</p>
                    <p>You have placed {{userSts.user.pixelsPlaced}} pixels 🎉</p>
                    <p v-if="userSts.user.stickedPixels > 0">You have {{userSts.user.stickedPixels}} permanent pixels left 🥲</p>
                    <p>You have reached step number {{userSts.user.steps.length}} 🥵</p>
                    <p style="display: inline-block">Your favorite color is</p>
                    <div class="fav-col" id="favorite-color"></div>
                    <br>
                    <p>Thank you for your participation. The statistics will be available soon.</p>
                </div>
            </div>
        </div>
    </div>

    <div class="position-fixed bottom-0 end-0 p-3" style="z-index: 11">
        <div id="liveToast" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="toast-header">
                <strong class="me-auto" id="bonus-event"></strong>
                <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        </div>
    </div>

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
        <div id="select-color-container" class="display-none">
            <div v-for="color in colorsSts.colors" :key="color.name">
                <div :id="`select-${color.name}`" class="select-color"
                :style="{background: color.hex}" :title="color.name"
                @click="setColor(color.name)"
                @touchstart="setColor(color.name)"></div>
            </div>
        </div>
        <div>
            <div class="dropdown mt-2">
                <form @submit.prevent="placePixelClick">
                    <div id="game-ready" class="display-none">
                        <div id="perm-checkbox-input" class="d-inline-block me-2" style="top: 5px;">
                            <input type="checkbox" id="perm-checkbox" @change="permCheck" />
                            <label title="Set permanent pixel" for="perm-checkbox" class="square-checkbox cursor-pointer"></label>
                        </div>
                        <button type="submit" id="place-pixel" class="btn btn-primary mb-0 px-2 pb-1 pt-0">
                            <p id="place-pixel-text" class="text-white mb-0">Place pixel</p>
                            <p id="place-perm-pixel-text" class="display-none text-white mb-0">{{userSts.user.stickedPixels}} permanent</p>
                        </button>
                    </div>
                    <!-- <svg class="ms-2 cursor-pointer" v-if="patternSts.isPatternSet" @click="unsetPatternMap" width="30px" height="30px" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 300 300" shape-rendering="geometricPrecision" text-rendering="geometricPrecision"><rect width="254.840248" height="254.840248" rx="0" ry="0" transform="matrix(.813624 0 0 0.813623 46.327929 46.328056)" fill="none" stroke="#000" stroke-width="20"/><rect width="49.36256" height="49.36256" rx="0" ry="0" transform="matrix(.730833-.682556 0.682556 0.730833 19.922495 243.041471)" fill="#fcfcfc" stroke-width="0"/><rect width="49.36256" height="49.36256" rx="0" ry="0" transform="matrix(.730833-.682556 0.682556 0.730833 207.901175 56.927621)" fill="#fcfcfc" stroke-width="0"/><rect width="277.730091" height="22.126848" rx="0" ry="0" transform="matrix(.91938-.912865 0.704588 0.709616 14.535153 268.914301)" fill="#fd1111" stroke-width="0"/></svg> -->
                    <svg fill="#000000" class="ms-2 cursor-pointer" v-if="patternSts.isPatternSet" @click="unsetPatternMap" width="22px" height="22px" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
                        viewBox="0 0 457.756 457.756" xml:space="preserve">
                    <title>Clear canva</title>
                    <path d="M455.413,35.596c-3.125-3.123-8.189-3.123-11.314,0L290.501,189.195l-21.94-21.94L422.159,13.657
                        c3.124-3.125,3.124-8.189,0-11.314c-3.124-3.122-8.188-3.123-11.314,0L257.246,155.94l-11.656-11.656
                        c-4.521-4.521-10.548-7.01-16.972-7.01c-6.423,0-12.45,2.489-16.971,7.01l-5.656,5.656c-6.717,6.717-8.585,16.451-5.659,24.874
                        c-75.593,36.5-142.949,66.335-195.204,86.455c-4.015,1.546-6.088,5.988-4.694,10.058c14.684,42.887,39.388,82.499,71.442,114.553
                        c32.054,32.055,71.666,56.759,114.553,71.442c0.858,0.294,1.731,0.434,2.592,0.434c3.222,0,6.246-1.96,7.466-5.128
                        c20.118-52.25,49.949-119.597,86.443-195.18c2.509,0.87,5.175,1.327,7.915,1.327c6.423,0,12.45-2.489,16.971-7.01l5.656-5.656
                        c9.357-9.358,9.357-24.584,0-33.942l-11.656-11.656L455.413,46.911C458.537,43.786,458.537,38.721,455.413,35.596z M210.015,187.906
                        l6.193,6.192l-64.645,45.083c-3.624,2.527-4.513,7.514-1.985,11.138c1.555,2.23,4.041,3.425,6.568,3.425
                        c1.58,0,3.176-0.467,4.569-1.439l66.984-46.715l6.576,6.576L77.617,368.823c-11.016-11.669-21.021-24.313-29.916-37.7l84.683-59.06
                        c3.624-2.527,4.513-7.514,1.985-11.138c-2.526-3.625-7.516-4.515-11.138-1.985l-84.019,58.596
                        c-8.267-14.094-15.346-28.881-21.055-44.165C70.364,252.928,136.39,223.517,210.015,187.906z M184.383,439.597
                        c-15.283-5.709-30.07-12.788-44.165-21.055l15.016-21.531c2.527-3.624,1.639-8.61-1.985-11.138
                        c-3.622-2.529-8.611-1.64-11.138,1.985l-15.479,22.195c-13.387-8.896-26.031-18.9-37.7-29.917l156.657-156.657l6.576,6.576
                        l-89.136,127.809c-2.527,3.624-1.639,8.61,1.985,11.138c1.394,0.973,2.989,1.439,4.569,1.439c2.526,0,5.014-1.195,6.568-3.425
                        l87.504-125.469l6.193,6.192C234.238,321.365,204.827,387.391,184.383,439.597z M302.157,234.794l-5.656,5.656
                        c-1.498,1.499-3.507,2.324-5.656,2.324c-2.15,0-4.159-0.825-5.657-2.324l-33.931-33.931c-0.003-0.003-0.006-0.007-0.009-0.01
                        s-0.007-0.006-0.01-0.009l-33.931-33.931c-3.12-3.119-3.12-8.194,0-11.313l5.656-5.656c1.498-1.499,3.507-2.324,5.656-2.324
                        c2.15,0,4.159,0.825,5.657,2.324l67.882,67.882C305.277,226.599,305.277,231.674,302.157,234.794z"/>
                    </svg>
                </form>
            </div>
        </div>
    </div>

</template>

<style scoped>

.fav-col {
    display: inline-block;
    margin: auto;
    margin-left: 3px;
    width: 12px;
    height: 12px;
}


input[type="checkbox"] {
    display: none;
}

label.square-checkbox {
    width: 20px;
    height: 20px;
    border: 2px solid gray;
    display: inline-block;
}

input[type="checkbox"]:checked + label.square-checkbox {
    border: 3px solid orange;
    background-color: yellow;
}

.gold-user {
    color: #f1b901;
    text-shadow: 0 0 0.5px rgb(63, 63, 63);
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
