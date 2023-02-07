
<script setup lang='ts'>
import router from '@/router/index';
import { usePatternStore } from '@/stores/pattern.js';

    const patternSts = usePatternStore();
    
    function goBack() {
        if (patternSts.isPatternSet === false) {
            router.push('/')
        } else {
            router.go(-1);
        }
    }

</script>

<template>
    <div id="card">
        <div @click="goBack" class="position-absolute ms-2 cursor-pointer" style="z-index: 10;">
            <svg width="50px" height="50px" clip-rule="evenodd" fill-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m9.474 5.209s-4.501 4.505-6.254 6.259c-.147.146-.22.338-.22.53s.073.384.22.53c1.752 1.754 6.252 6.257 6.252 6.257.145.145.336.217.527.217.191-.001.383-.074.53-.221.293-.293.294-.766.004-1.057l-4.976-4.976h14.692c.414 0 .75-.336.75-.75s-.336-.75-.75-.75h-14.692l4.978-4.979c.289-.289.287-.761-.006-1.054-.147-.147-.339-.221-.53-.221-.191-.001-.38.071-.525.215z" fill-rule="nonzero"/></svg>
        </div>
        <div id="info" class="container">
            <h2 class="text-center">Informations</h2>
            <br>
            <h3>What is the project?</h3>
            <p>
                The project is managed by the BDA of the ENSEEIHT.
            </p>
            <img id="bda-img" alt="BDA of the ENSEEIHT" src="/src/assets/bda.png">
            <br><br>
            <h3>Install application</h3><br>
            <p>
                You can play in a browser but the game is also installable. 
                To install the game on your phone, you need to open your browser options and click on "Install Application" or "Add to Home Screen". 
                More details here: <a target="_blank" href="https://www.cdc.gov/niosh/mining/content/hearingloss/installPWA.html">Install app documentation</a>
            </p>
            <br>
            <h3>Game mechanics</h3><br>
                <h4>Group</h4>
                <p>
                    You can select a group on your profile. 
                    When you place a pixel, it increases the number of pixels of your group. 
                </p>
                <p>
                    If you want to create a group, first make sure that the group does not already exist. 
                    The best way is to join the group on your list or a club you belong to. 
                    Otherwise, you can contact us in the section below. 
                </p>
                <h4>Canvas</h4>
                <p>
                    A canvas can help you and your teammates to draw the perfect pixel art. 
                    If someone sent you a link to a canvas and you clicked on it, it will be saved in your canvas list. 
                    You can then apply it to the map at any time by clicking on the canvas name. 
                    You cannot apply multiple canvases at the same time but you can have multiple canvases in your lists. 
                    You can remove the canvas from the map by clicking on the small broom to the right of the "Place Pixel" button. 
                </p>
                <p>
                    You can create a canvas and name it whatever you want. Your canvas is saved every time you place a pixel. 
                    On your desktop, you can draw quickly using the arrow keys and the Enter button (be careful if you are too fast, some pixels may not be saved, so check again after you finish your canvas). 
                    If you make changes after sharing your canvas, the people who saved it must clear the canvas from the map and reapply it from the list. 
                </p>
                <p>
                    You can edit your canvas after created it by clicking on the pencil icon. 
                    You can share a canvas by clicking on the share icon. 
                    You can remove a canvas from your <strong>Registered canvases</strong> list by clicking on the trash icon. 
                    If you click on the trash icon on a canvas you have created (in the <strong>Your canvases</strong> list), your canvas will be removed from your list and from the list of <strong>Registered canvases</strong> of all people who have saved your canvas. 
                </p>
                <h4>Bonus</h4>
                <ul class="list-group">
                    <li class="list-group-item">
                        <div class="d-flex">
                            <img width="40px" height="40px" src="/src/assets/profile/timer.svg"/>
                            <h5 class="mt-2">Timer</h5>
                        </div>
                        <p>
                            Once unlocked, your timer will be decreased.
                        </p>
                    </li>
                    <li class="list-group-item">
                        <div class="d-flex">
                            <img width="40px" height="40px" src="/src/assets/profile/color.svg"/>
                            <h5 class="mt-2">Colors</h5>
                        </div>
                        <p>
                            Once unlocked, you will get new colors. 
                            Only you and the people who unlock the same step will be able to use them. 
                            You can not use these colors to create a canvas. 
                        </p>
                    </li>
                    <li class="list-group-item">
                        <div class="d-flex">
                            <img width="40px" height="40px" src="/src/assets/profile/perm-pixel.svg"/>
                            <h5 class="mt-2">Permanent pixels</h5>
                        </div>
                        <p>
                            Once unlocked, you can use your permanents pixels by checking the box on the left of the place button. 
                            If the checkbox is yellow, you can see how many permanent pixels you have left and you can place them by clicking on the button.
                        </p>
                        <p>
                            A normal pixel cannot replace a permanent pixel but a permanent pixel can replace another one. 
                            You can see if the selected pixel on the map is permanent by the color of the box at the top. 
                            If the border color is red, this is a permanent pixel and the button to place a normal pixel is gray. 
                            If you have some permanents and you check the box, the button appears in blue and you can replace the permanent pixel with your own.
                        </p>
                    </li>
                    <li class="list-group-item">
                        <div class="d-flex">
                            <img width="40px" height="40px" src="/src/assets/profile/gold-name.svg"/>
                            <h5 class="mt-2">Gold username</h5>
                        </div>
                        <p>
                            Once unlock, your name will glow with a golden color. 
                            People will be able to see the color of your new username on your profile and on all the pixels you have placed. 
                        </p>
                    </li>
                </ul><br>
                <h4>Game changes</h4>
                <ul class="list-group">
                    <li class="list-group-item">
                        <div class="d-flex">
                            <img width="40px" height="40px" src="/src/assets/profile/timer.svg"/>
                            <h5 class="mt-2">Timer</h5>
                        </div>
                        <p>
                            The timer event can be triggered by the game itself at any time to decrease or increase everyone's timer at the same time. 
                        </p>
                    </li>
                    <li class="list-group-item">
                        <div class="d-flex">
                            <img width="40px" height="40px" src="/src/assets/profile/color.svg"/>
                            <h5 class="mt-2">Colors</h5>
                        </div>
                        <p>
                            The color event can be triggered by the game itself at any time to add or remove colors for everyone at the same time. 
                            The added colors will be usable on the canvas creation. Removed colors will not be usable on the canvas creation. 
                        </p>
                    </li>
                    <li class="list-group-item">
                        <div class="d-flex">
                            <img width="30px" height="30px" class="ms-2 me-1" src="/src/assets/increase-map.svg"/>
                            <h5 class="mt-1">Increase the map size</h5>
                        </div>
                        <p>
                            The size of the map can be increased by the game itself at any time. 
                        </p>
                    </li>
                </ul><br>
                <h4>Game stop</h4>
                <p>
                    The game will be stopped within an hour announced by the organizing team. 
                </p>
            <br>
            <br>
            <h3>Contact</h3>
            <p>
                If you have any problem, you can contact us here :
            </p>
            <ul class="list-group">
                <li class="list-group-item"><a href="https://m.me/Dami1Da" target="_blank">Damien Dassieu</a></li>
                <li class="list-group-item"><a href="https://m.me/theo.valle.3" target="_blank">Theodor Vallier</a></li>
                <li class="list-group-item"><a href="https://messenger.com/t/100010317902816" target="_blank">Diego Barragan</a></li>
                <li class="list-group-item"><a href="https://m.me/victor.mrt.77" target="_blank">Victor Marti</a></li>
            </ul><br>
            <p>
                This website was created by Damien Dassieu. It is hosted by Net7.
            </p>
        </div>
    </div>
</template>



<style scoped>

    #bda-img {
        max-width: 100%;
        max-height: 100%;
        border-radius: 20px;
    }

</style>