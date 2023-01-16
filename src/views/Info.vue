
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
            <h3>What is the project</h3>
            <p>
                The project is managed by the BDA of the ENSEEIHT.
            </p>
            <img id="bda-img" alt="BDA of the ENSEEIHT" src="/src/assets/bda.png">
            <br>
            <h3>Game mechanics</h3><br>
                <h4>Group</h4>
                <p>
                    You can select a group on your profile. 
                    When you place a pixel, it will increase the number of pixels of your group. 
                </p><br>
                <p>
                    If you want to create a group, first make sure that the group does not already exist. 
                    It is best if you join the group of your list or of a club you belong to. 
                    Otherwise, you can contact us in the section below. 
                </p><br>
                <h4>Canvas</h4>
                <p>
                    A canva can help you and your team mates to draw the perfect pixel art. 
                    If someone sent you a canva link and you clicked on it, it will be saved in your list of canvas. 
                    So you can apply it on the map at any time by clicking on the name of the canva. 
                    You can not apply multiple canvas at the same time but you can have have multiple canvas in your lists. 
                    You can remove the display of the canva on the map by clicking on the little broom on the right of the "Place pixel" button. 
                </p><br>
                <p>
                    You can create a canva and name it has you want. Your canva is saved everytime you place a pixel. 
                    On your desktop, you can draw quickly using the keys arrow and the Enter button (be carreful if you are to quick, some pixels may have not be saved, so recheck after finishing your canva). 
                    If you make some modifications after sharing your canva, people who have save it must clear the canva on the map and re-apply it from the list. 
                </p><br>
                <p>
                    You can edit your canva after created it by clicking on the pencil icon. 
                    You can share a canva by clicking on the share icon. 
                    You can remove a canva from your <strong>Registered canva list</strong> by clicking on the trash icon. 
                    If you click on the trash icon on a canva you created (in the <strong>Your canvas</strong> list), it will delete your canva from your list and from the <strong>Registered canvas</strong> list of everyone who saved your canva. 
                </p>
                <h4>Bonus</h4>
                <ul class="list-group">
                    <li class="list-group-item">
                        <div class="d-flex">
                            <img width="40px" height="40px" src="'/assets/profile/timer.svg'"/>
                            <p>Timer</p>
                        </div>
                        <br>
                        <p>
                            When unlock, your timer will be decreased.
                        </p>
                    </li>
                    <li class="list-group-item">
                        <div class="d-flex">
                            <img width="40px" height="40px" src="'/assets/profile/color.svg'"/>
                            <p>Colors</p>
                        </div>
                        <br>
                        <p>
                            When unlock, you will get new colors. 
                            Only you and the people who unlock the same step will be able to use them. 
                            You can not use these colors to create a canva. 
                        </p>
                    </li>
                    <li class="list-group-item">
                        <div class="d-flex">
                            <img width="40px" height="40px" src="'/assets/profile/perm-pixel.svg'"/>
                            <p>Permanent pixels</p>
                        </div>
                        <br>
                        <p>
                            When unlock, you can use your permanents pixels by checking the square on the left of the place button. 
                            If the checkbox is yellow, you can see how many permanent pixels are remaining and you can place them by clicking the button.
                        </p>
                        <br>
                        <p>
                            A normal pixel can not replace a permanent pixel but a permanent pixel can replace another one. 
                            You can see if the selected pixel on the map is permanent with the color of the box on the top. 
                            If the color of the border is red, this is a permanent pixel and the button to place a normal pixel is gray. 
                            If you have some permanents and you check the square, the button appears in blue and you can replace the permanent pixel by yours.
                        </p>
                    </li>
                    <li class="list-group-item">
                        <div class="d-flex">
                            <img width="40px" height="40px" src="'/assets/profile/gold-name.svg'"/>
                            <p>Gold username</p>
                        </div>
                        <br>
                        <p>
                            When unlock, your name will shine in a gold like color. 
                            People will be able to see your new username color on your profile and every pixels you placed. 
                        </p>
                    </li>
                </ul><br>
                <h4>Game changes</h4>
                <ul class="list-group">
                    <li class="list-group-item">
                        <div class="d-flex">
                            <img width="40px" height="40px" src="'/assets/profile/timer.svg'"/>
                            <p>Timer</p>
                        </div>
                        <br>
                        <p>
                            The timer event can be triggered by the game himself at anytime to decrease or increase the timer of everyone at the same moment. 
                        </p>
                    </li>
                    <li class="list-group-item">
                        <div class="d-flex">
                            <img width="40px" height="40px" src="'/assets/profile/color.svg'"/>
                            <p>Colors</p>
                        </div>
                        <br>
                        <p>
                            The color event can be triggered by the game himself at anytime to add or remove some colors for everyone at the same moment. 
                            The added colors will be usable on the canva creation. The removed colors will not be longer usable on the canva creation. 
                        </p>
                    </li>
                    <li class="list-group-item">
                        <div class="d-flex">
                            <p>Increase the map size</p>
                        </div>
                        <br>
                        <p>
                            The map size can be increased by the game himself at anytime.
                        </p>
                    </li>
                </ul>
            <br>
            <br>
            <h3>Contact</h3>
            <p>
                If you have any problem, you can contact us here :
            </p>
            <ul class="list-group">
                <li class="list-group-item"><a href="https://m.me/Dami1Da" target="_blank">Damien Dassieu</a></li>
                <li class="list-group-item"><a href="https://m.me/theo.valle.3" target="_blank">Theodor Vallier</a></li>
                <li class="list-group-item"><a href="https://m.me/Dami1Da" target="_blank">Diego Barragan</a></li>
                <li class="list-group-item"><a href="https://m.me/victor.mrt.77" target="_blank">Victor Marti</a></li>
            </ul>
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