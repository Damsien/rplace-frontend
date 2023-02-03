<script setup lang='ts'>
    import $ from 'jquery';
    import panzoom from 'panzoom';
    import axios from 'axios';
    import { useColorsStore } from '@/stores/colors.js';
    import { usePixelStore, type Pixel } from '@/stores/pixel';
    import { refreshToken } from '@/auth.js';
    import router from '@/router/index';
    import http from '@/router/http';
    import { HEADERS } from '@/App.vue';
    import { onActivated } from 'vue';
    import { useMapStore } from '@/stores/map';
    
    var canvas: HTMLCanvasElement;
    var ctx: CanvasRenderingContext2D;
    var selector: {x: number, y: number} = {x: 0, y: 0};
    var colorSelected: string = 'none';
    var isFree = false;
    const colorsSts = useColorsStore();
    const pixelSts = usePixelStore();
    const mapSts = useMapStore();

    var pattern: Pixel[] = [];
    var mapToggled: boolean = false;

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
            setPixelBorder(pixel);
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


    function setPixelBorder(pixel: any) {
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

    function getCurrentPattern() {
        // GET CURRENT PATTERN
        http.get(`${window.env.VITE_APP_BACKEND_API_URL}/pattern/${router.currentRoute.value.params.id}`, {
            headers: HEADERS,
            method: 'GET',
        }).then(res => {

            pattern = [];
            const patternMap = res.data;
            patternMap.forEach(pixel => {
                pixel['coord_x'] -= 1;
                pixel['coord_y'] -= 1;
                
                let x = pixel['coord_x'] * 10;
                let y = pixel['coord_y'] * 10;
                let color = pixel['color'];
                
                ctx.fillStyle = color;
                ctx.fillRect(x, y, 10, 10);

                pattern.push(pixel);
            });
        });
    }

    function setWhiteMap() {
        const width = mapSts.width;
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, width*10, width*10);
        for(let i=0; i<width; i++) {
            for(let j=0; j<width; j++) {
                ctx.fillStyle = 'black';
                ctx.fillRect((i*10)+4, (j*10)+4, 2, 2);
            }
        }
    }

    onActivated(() => {
        canvas = <HTMLCanvasElement>$('#place')[0];
        // @ts-ignore
        ctx = canvas.getContext('2d');
        
        // USER SPECS
        http.get(`${window.env.VITE_APP_BACKEND_API_URL}/user/game/spec`, {
            headers: HEADERS,
            method: 'GET',
        }).then(res => {

            colorsSts.clearColors();
            for(let color of res.data.colors) {
                colorsSts.addColor({
                    name: color.name,
                    // @ts-ignore
                    hex: color.hex,
                    isColorUser: false
                });
            }

            // MAP
            const width = res.data.width;
            mapSts.setWidth(width);
            canvas.width = width * 10;
            canvas.height = width * 10;
            setWhiteMap();
            
        });

        if (mapSts.pixels.length <= 0) {
            http.get(`${window.env.VITE_APP_BACKEND_API_URL}/user/game/map`, {
                headers: HEADERS,
                method: 'GET',
            }).then(res => {

                // MAP
                const width = res.data.width;
                const map = res.data.map;
                mapSts.setWidth(width);
                mapSts.clearMap();
                mapSts.setMap(map);
                mapSts.setDateState();
                
                getCurrentPattern();
            });
        } else {
            getCurrentPattern();
        }

        http.get(`${window.env.VITE_APP_BACKEND_API_URL}/user/game-state`, {
            headers: HEADERS,
            method: 'GET',
        }).then(res => {
            if (res.data.state == 'Occurs') {
                $('#select-pixel').removeClass('display-none');
            }
        });
    });

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
            },
            filterKey: function(/* e, dx, dy, dz */) {
                // don't let panzoom handle this event:
                return true;
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

        const checkbox = document.querySelector('#toggle-map');
        const checkedSVG = document.querySelector('.checked');
        const uncheckedSVG = document.querySelector('.unchecked');

        // @ts-ignore
        checkbox.addEventListener('change', function() {
            if ($(this).is(':checked')) {
                // @ts-ignore
                checkedSVG.style.display = 'block';
                // @ts-ignore
                uncheckedSVG.style.display = 'none';
            } else {
                // @ts-ignore
                checkedSVG.style.display = 'none';
                // @ts-ignore
                uncheckedSVG.style.display = 'block';
            }
        });
        
        function clickEvent(e: MouseEvent) {
            let x = e.offsetX-(e.offsetX%10);
            let y = e.offsetY-(e.offsetY%10);
            if(!isPanning) {
                // if(isFree) {
                //     isFree = false;
                //     setSelector(x, y);
                // } else {
                    setSelector(x, y);
                //     if(! (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) ) {
                //         isFree = true;
                //     }
                // }
            }
        };
        canvas.addEventListener('pointerup', function(e) {
            clickEvent(e);
        });

        window.addEventListener('keydown', function(event) {
            const key = event.key; // "ArrowRight", "ArrowLeft", "ArrowUp", or "ArrowDown"
            if (selector && !isFree) {
                switch (key) {
                    case "ArrowLeft":
                        setSelector(selector.x-10, selector.y);
                        break;
                    case "ArrowRight":
                        setSelector(selector.x+10, selector.y);
                        break;
                    case "ArrowUp":
                        setSelector(selector.x, selector.y-10);
                        break;
                    case "ArrowDown":
                        setSelector(selector.x, selector.y+10);
                        break;
                    case "Enter":
                        placePixel()
                        break;
                }
                // if (key == 'ArrowLeft') {
                //     setSelector(selector.x-10, selector.y);
                // }
                // else if (key == 'ArrowRight') {
                //     setSelector(selector.x+10, selector.y);
                // }
                // else if (key == 'ArrowUp') {
                //     setSelector(selector.x, selector.y-10);
                // }
                // else if (key == 'ArrowDown') {
                //     setSelector(selector.x, selector.y+10);
                // }
                // else if (key == 'Enter') {
                //     placePixel();
                // }
            }
        });


    });


    function setColor(name: string) {
        $(`.select-color`).removeClass('color-selected');
        colorSelected = name;
        if(selector && !isFree) {
            $(`#select-${colorSelected}`).addClass('color-selected');
        }
    }


    function placePixel() {
        if(colorSelected !== 'none' && selector) {
            http.put(`${window.env.VITE_APP_BACKEND_API_URL}/pattern-shape/place/${router.currentRoute.value.params.id}`, {
                coord_x: pixelSts.pixel.coord_x,
                coord_y: pixelSts.pixel.coord_y,
                color: colorSelected
            }, {
                headers: HEADERS,
                method: 'PUT',
            }).then(res => {
                if (res !== undefined) {
                    ctx.fillStyle = colorsSts.color(colorSelected).hex;

                    const x = selector.x;
                    const y = selector.y;
                    if (mapToggled == false) {
                        ctx.fillRect(x, y, 10, 10);
                    } else {
                        ctx.fillRect(x+3, y+3, 4, 4);
                    }
                    
                    ctx.fillStyle = 'black';
                    ctx.fillRect(x, y, 2, 1);
                    ctx.fillRect(x, y, 1, 2);
                    ctx.fillRect(x+8, y, 2, 1);
                    ctx.fillRect(x+9, y, 1, 2);
                    ctx.fillRect(x+8, y+9, 2, 1);
                    ctx.fillRect(x+9, y+8, 1, 2);
                    ctx.fillRect(x, y+9, 2, 1);
                    ctx.fillRect(x, y+8, 1, 2);

                    pattern = pattern.filter(obj => obj.coord_x !== pixelSts.pixel.coord_x || obj.coord_y !== pixelSts.pixel.coord_y);
                    // @ts-ignore
                    pattern.push({coord_x: pixelSts.pixel.coord_x-1, coord_y: pixelSts.pixel.coord_y-1, color: colorsSts.color(colorSelected).hex});
                }
            });
        }
    }

    function setPatternPixel(x: number, y: number) {
        ctx.fillStyle = 'white';
        ctx.fillRect(x, y, 10, 10);
        if (mapToggled == false) {
            ctx.fillStyle = 'black';
            ctx.fillRect(x+4, y+4, 2, 2);
        } else {
            const pxl = mapSts.pixels.find(el => el.coord_x == (x+10)/10 && el.coord_y == (y+10)/10);
            if (pxl === undefined) {
                ctx.fillStyle = 'white';
            } else {
                ctx.fillStyle = pxl['color'];
            }
            ctx.fillRect(x, y, 10, 10);
        }
        
        ctx.fillStyle = 'black';
        
        //  Border selector
        ctx.fillRect(x+0, y+0, 1, 2);
        ctx.fillRect(x+0, y+0, 2, 1);
        ctx.fillRect(x+9, y+0, 1, 2);
        ctx.fillRect(x+8, y+0, 2, 1);
        ctx.fillRect(x+0, y+9, 2, 1);
        ctx.fillRect(x+0, y+8, 1, 2);
        ctx.fillRect(x+9, y+8, 1, 2);
        ctx.fillRect(x+8, y+9, 2, 1);
    }

    function removePixel() {
        http.delete(`${window.env.VITE_APP_BACKEND_API_URL}/pattern-shape/remove/${router.currentRoute.value.params.id}?coord_x=${pixelSts.pixel.coord_x}&coord_y=${pixelSts.pixel.coord_y}`, {
            headers: HEADERS,
            method: 'DELETE',
        }).then(res => {
            if (res !== undefined) {
                setPatternPixel(selector.x, selector.y);

                pattern = pattern.filter(obj => obj.coord_x !== pixelSts.pixel.coord_x-1 || obj.coord_y !== pixelSts.pixel.coord_y-1);
            }
        });
    }


    function toggleMap() {
        // @ts-ignore
        ctx = canvas.getContext('2d');
        setWhiteMap();
        if (mapToggled == true) {
            pattern.forEach(pixel => {
                
                let x = pixel['coord_x'] * 10;
                let y = pixel['coord_y'] * 10;
                let color = pixel['color'];
                
                ctx.fillStyle = color;
                ctx.fillRect(x, y, 10, 10);

                checkSelector(x, y);
            });
            
            mapToggled = false;
        } else {
            setMap(mapSts.width, mapSts.pixels);
            
            mapToggled = true;
        }
        setSelector(selector.x, selector.y);
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
            pixel['coord_x'] += 1;
            pixel['coord_y'] += 1;
        });
    }

    function checkSelector(x: number, y: number) {
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

    function setMapPixel(pixel: any) {
        let x = pixel['coord_x'] * 10;
        let y = pixel['coord_y'] * 10;
        let color = pixel['color'];
        
        if (pixel.entityId != undefined) {
            if (pixel.entityId.split('-')[0]-1 != pixel.coord_x || pixel.entityId.split('-')[1]-1 != pixel.coord_y) {
                return;
            }
        }

        ctx.fillStyle = color;
        ctx.fillRect(x, y, 10, 10);
        let foundPatternPixel = pattern.find((el) => el['coord_x'] == x/10 && el['coord_y'] == y/10);
        if (foundPatternPixel !== undefined) {
            ctx.fillStyle = foundPatternPixel['color'];
            // ctx.fillRect(x, y, 3, 10);
            // ctx.fillRect(x, y, 10, 3);
            // ctx.fillRect(x+7, y, 3, 10);
            // ctx.fillRect(x, y+7, 10, 3);
            ctx.fillRect(x+3, y+3, 4, 4);
        }

        checkSelector(x, y);
    }

</script>

<template>

    <div id="parent-canvas">
        <canvas id="place"></canvas>
    </div>
    <div id="timer-box" class="box-for-content">
        <div class="container">
            <div class="row">
                <div class="col-12">
                    <div class="text-center">
                    <!-- Last map state : {{ mapSts.dateState.toLocaleDateString('fr-FR', {hour: '2-digit', minute: '2-digit', second: '2-digit'}) }} -->
                    Last map state : {{ mapSts.dateState.toLocaleTimeString('fr-FR') }}
                    </div>
                </div>
            </div>
            <div class="row">
                <div class="col-12">
                    <div class="text-center">
                    x: {{pixelSts.pixel.coord_x}} y: {{pixelSts.pixel.coord_y}}
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div id="select-pixel" class="box-for-content display-none">
        <div id="select-color-container">
            <div v-for="color in colorsSts.colors" :key="color.name">
                <div :id="`select-${color.name}`" class="select-color"
                :style="{background: color.hex}" :title="color.name"
                @click="setColor(color.name)"
                @touchstart="setColor(color.name)"></div>
            </div>
        </div>
        <div>
            <div id="button-ctnr" class="dropdown mt-2">
                <form @submit.prevent="placePixel" class="d-inline-block">
                    <button type="submit" id="place-pixel" class="btn btn-primary mb-0 px-2 pb-1 pt-0">Place</button>
                </form>
                <form @submit.prevent="removePixel" class="d-inline-block">
                    <button type="submit" id="remove-pixel" class="btn btn-primary mb-0 px-2 pb-1 pt-0">Remove</button>
                </form>
            </div>
            <div class="ps-2" style="display: inline;">
                <input type="checkbox" id="toggle-map" @change="toggleMap" />
                <label for='toggle-map' style="top: 9px;">
                    <svg class="checked cursor-pointer" style="display: none;" width="24px" height="24px" clip-rule="evenodd" fill-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m11.998 5c-4.078 0-7.742 3.093-9.853 6.483-.096.159-.145.338-.145.517s.048.358.144.517c2.112 3.39 5.776 6.483 9.854 6.483 4.143 0 7.796-3.09 9.864-6.493.092-.156.138-.332.138-.507s-.046-.351-.138-.507c-2.068-3.403-5.721-6.493-9.864-6.493zm8.413 7c-1.837 2.878-4.897 5.5-8.413 5.5-3.465 0-6.532-2.632-8.404-5.5 1.871-2.868 4.939-5.5 8.404-5.5 3.518 0 6.579 2.624 8.413 5.5zm-8.411-4c2.208 0 4 1.792 4 4s-1.792 4-4 4-4-1.792-4-4 1.792-4 4-4zm0 1.5c-1.38 0-2.5 1.12-2.5 2.5s1.12 2.5 2.5 2.5 2.5-1.12 2.5-2.5-1.12-2.5-2.5-2.5z" fill-rule="nonzero"/></svg>
                    <svg class="unchecked cursor-pointer" style="display: block;" clip-rule="evenodd" width="24px" height="24px" fill-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m17.069 6.546 2.684-2.359c.143-.125.32-.187.497-.187.418 0 .75.34.75.75 0 .207-.086.414-.254.562l-16.5 14.501c-.142.126-.319.187-.496.187-.415 0-.75-.334-.75-.75 0-.207.086-.414.253-.562l2.438-2.143c-1.414-1.132-2.627-2.552-3.547-4.028-.096-.159-.144-.338-.144-.517s.049-.358.145-.517c2.111-3.39 5.775-6.483 9.853-6.483 1.815 0 3.536.593 5.071 1.546zm2.319 1.83c.966.943 1.803 2.014 2.474 3.117.092.156.138.332.138.507s-.046.351-.138.507c-2.068 3.403-5.721 6.493-9.864 6.493-1.297 0-2.553-.313-3.729-.849l1.247-1.096c.795.285 1.626.445 2.482.445 3.516 0 6.576-2.622 8.413-5.5-.595-.932-1.318-1.838-2.145-2.637zm-3.434 3.019c.03.197.046.399.046.605 0 2.208-1.792 4-4 4-.384 0-.756-.054-1.107-.156l1.58-1.389c.895-.171 1.621-.821 1.901-1.671zm-.058-3.818c-1.197-.67-2.512-1.077-3.898-1.077-3.465 0-6.533 2.632-8.404 5.5.853 1.308 1.955 2.567 3.231 3.549l1.728-1.519c-.351-.595-.553-1.289-.553-2.03 0-2.208 1.792-4 4-4 .925 0 1.777.315 2.455.843zm-2.6 2.285c-.378-.23-.822-.362-1.296-.362-1.38 0-2.5 1.12-2.5 2.5 0 .36.076.701.213 1.011z" fill-rule="nonzero"/></svg>
                </label>
            </div>
            <!-- <input title="Set permanent" id="set-perm" class="form-check-input ms-3" type="checkbox" value="perm"> -->
        </div>
    </div>
    
</template>

<style scoped>

input[type="checkbox"] {
    display: none;
}

#button-ctnr {
    display: inline-flex;
    flex-wrap: wrap;
    gap: 5px;
}

#timer-box {
    top: 5%;
    border: solid 1px black;
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
    min-width: 200px;
}

.pixel-button {
    position: relative;
    display: inline-block;
    color: white;
    background-color: #2c3e50;
}

#place-pixel {
    border-radius: 3px;
    cursor: pointer;
}

#remove-pixel {
    border-radius: 3px;
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

#select-pixel {
    top: 88%;
    border: solid 1px black;
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