<script setup lang='ts'>
    import $ from 'jquery';
    import panzoom from 'panzoom';
    import { useColorsStore } from '@/stores/colors.js';

    var canvas: HTMLCanvasElement;
    var ctx: CanvasRenderingContext2D;
    var selector: {x: number, y: number};
    var colorSelected: string = 'none';
    var isFree = true;
    const colorsSts = useColorsStore();

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
            setPixelBorder(pixel);
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

    $(function() {
        canvas = <HTMLCanvasElement>$('#place')[0];
        ctx = canvas.getContext('2d');

        /*  TEMP    */
        canvas.width = 2000;
        canvas.height = 2000;
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, 2000, 2000);
        for(let i=0; i<200; i++) {
            for(let j=0; j<200; j++) {
                ctx.fillStyle = 'black';
                ctx.fillRect((i*10)+4, (j*10)+4, 2, 2);
            }
        }
        colorsSts.addColor({name: 'red', hex: '#FF0000'});
        colorsSts.addColor({name: 'green', hex: '#00FF00'});
        colorsSts.addColor({name: 'blue', hex: '#0000FF'});
        colorsSts.addColor({name: 'purple', hex: '#ab34eb'});
        colorsSts.addColor({name: 'yellow', hex: '#dce835'});
        colorsSts.addColor({name: 'pink', hex: '#e835d9'});
        colorsSts.addColor({name: 'brown', hex: '#702c04'});
        colorsSts.addColor({name: 'orange', hex: '#f07f07'});
        ctx.fillStyle = 'green';
        ctx.fillRect(1990, 1000, 10, 10);
        ctx.fillRect(0, 1000, 10, 10);
        ctx.fillRect(0, 0, 10, 10);
        /*  END TEMP    */

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
                $('#remove-pixel').addClass('place-pixel-button');
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
                    $('#remove-pixel').addClass('place-pixel-button');
                } else {
                    setSelector(x, y);
                    if(! (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) ) {
                        isFree = true;
                        $('#place-pixel').removeClass('place-pixel-button');
                        $('#remove-pixel').removeClass('place-pixel-button');
                    } else {
                        if(colorSelected !== 'none') {
                            $('#place-pixel').addClass('place-pixel-button');
                        }
                        $('#remove-pixel').addClass('place-pixel-button');
                    }
                }
            }
        });

    });


    function setColor(name: string) {
        colorSelected = name;
        if(selector && !isFree) {
            $('#place-pixel').addClass('place-pixel-button');
        }
    }


    function placePixel() {
        if(colorSelected !== 'none' && selector) {
            console.log("place pixel at " + selector.x + " " + selector.y);
            console.log(colorSelected);
            colorSelected = 'none';
            $('#place-pixel').removeClass('place-pixel-button');
            $('#remove-pixel').removeClass('place-pixel-button');
        }
    }

    function setPatternPixel(x: number, y: number) {
        ctx.fillStyle = 'white';
        ctx.fillRect(x, y, 10, 10);
        ctx.fillStyle = 'black';
        ctx.fillRect(x+4, y+4, 2, 2);
        
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
        console.log("remove pixel at " + selector.x + " " + selector.y);
        setPatternPixel(selector.x, selector.y);
        $('#place-pixel').removeClass('place-pixel-button');
        $('#remove-pixel').removeClass('place-pixel-button');
    }

</script>

<template>

    <div id="screen">
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
            <p @click="placePixel" id="place-pixel" class="pixel-button mx-2 mb-0 px-2 pb-1 mt-2">Place pixel</p>
            <p @click="removePixel" id="remove-pixel" class="pixel-button mx-2 mb-0 px-2 pb-1 mt-2">Remove pixel</p>
        </div>
    </div>
    
</template>

<style scoped>

.pixel-button {
    position: relative;
    display: inline-block;
    color: white;
    background-color: #2c3e50;
}

#place-pixel {
    border-radius: 3px;
    cursor: not-allowed;
}

#remove-pixel {
    border-radius: 3px;
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

#screen {
    overflow: hidden; /* Hide scrollbars */
    position: relative;
    width: 100%;
    min-height: 100vh;
}

</style>