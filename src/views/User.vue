<script setup lang="ts">
    // @ts-ignore
    import $ from 'jquery';
    import 'bootstrap/dist/js/bootstrap.js'
    import http from '@/router/http';
    import { useUserStore } from '@/stores/user';
    import { HEADERS } from '@/App.vue';
    import { ref, onActivated } from 'vue'
    import router from '@/router';

    const userSts = useUserStore();
    let kind = 'self';

    var imgUrl = '';

    // When the user reaches on the page
    onActivated(() => {

        let url = `http://${window.env.VITE_APP_BACKEND_API_URL}/user`;
        if (router.currentRoute.value.params['id'] !== undefined) {
            url += '/other/'+router.currentRoute.value.params['id'];
            kind = 'other';
        } else {
            url += '/spec';
            kind = 'self';
        }
 
        http.get(url, {
            headers: HEADERS,
            method: 'GET'
        }).then(res => {


            /*      GROUP       */
            userSts.setGroup(res.data.group);
            

            /*      RANK        */
            userSts.setRank(res.data.rank);


            /*      STICKED PIXELS      */
            userSts.setStickedPixels(res.data.stickedPixels);

            /*      BOMB        */
            userSts.setBombs(res.data.bombs);

            
            /*      PROFILE PIC     */
            imgUrl = `https://avatars.dicebear.com/api/pixel-art/${res.data.pscope}-${res.data.username}.svg`;

            /*      PIXELS PLACED   */
            userSts.setPixelsPlaced(res.data.pixelsPlaced);

            /*      GOLD NAME       */
            userSts.setIsGold(res.data.isGold);


            /*      USER SET        */
            userSts.setPscope(res.data.pscope);
            userSts.setUsername(res.data.username);


            /*      FAVORITE COLOR  */
            userSts.setFavColor(res.data.favColor);

            /*      STEPS       */
            userSts.clearSteps();
            for (let step of res.data.steps) {
                userSts.addStep(step);
            }
            
            try {
                loadHtml();
            } catch (e) {}

        });

    });


    // When document is ready
    $(function () {
        loadHtml();
    });

    function loadHtml() {

        // Load user's profile
        $('#profile-svg').attr('src', imgUrl);
        $('#pic').on('click', function() {
            $("#liveToast").show();
            const location = window.location.toString();
            if (kind == 'self') {
                navigator.clipboard.writeText(location+'/'+userSts.user.pscope+'-'+userSts.user.username);
            } else {
                navigator.clipboard.writeText(location);
            }
        });
        $('#liveToast').on('click', function() {
            $('#liveToast').hide();
        });

        // Pixels placed
        $('#pixelsPlaced').text(userSts.user.pixelsPlaced);

        /*      STEP CHECKER    */
        for (let step of userSts.user.steps) {
            if (step.pixels-userSts.user.pixelsPlaced <= 0) {
                $('#'+step.name).css('filter', 'grayscale(0%)');
            }
        }

        /*      GOLD NAME       */
        if(userSts.user.isGold) {
            $('#username').css('color', '#F1BD09');
        }

        /*      USER SET        */
        $('#username').text(userSts.user.username);
        $('#school').text(userSts.user.pscope);
        if (userSts.user.group) {
            $('#group').text(userSts.user.group);
        }

        /*      FAVORITE COLOR  */
        $('#favorite-color').css('background-color', userSts.user.favColor);


        /*      GROUP       */
        if (kind == 'other') {
            if (!userSts.user.group) {
                $('#group-html1').addClass('d-none');
                $('#group-html2').addClass('d-none');
            } else {
                $('#group-html1').removeClass('d-none');
                $('#group-html2').removeClass('d-none');
            }
        } else {
            $('#group-html1').removeClass('d-none');
            $('#group-html2').removeClass('d-none');
        }
    }

    function linkGroup() {
        const grp = $('#grp-name').val();
        http.put(`http://${window.env.VITE_APP_BACKEND_API_URL}/user/group/link`, {
            "name": grp
        }, {
            headers: HEADERS,
            method: 'PUT',
        }).then(res => {
            userSts.setGroup(res.data);
        });
    }

</script>

<template>

    <div class="position-fixed bottom-0 end-0 p-3" style="z-index: 11">
        <div id="liveToast" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="toast-header">
                <strong class="me-auto">Link copied to the clipboard</strong>
                <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        </div>
    </div>

    <div id="card">
        <router-link to="/" class="position-absolute ms-2" style="z-index: 10;">
            <svg width="50px" height="50px" clip-rule="evenodd" fill-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m9.474 5.209s-4.501 4.505-6.254 6.259c-.147.146-.22.338-.22.53s.073.384.22.53c1.752 1.754 6.252 6.257 6.252 6.257.145.145.336.217.527.217.191-.001.383-.074.53-.221.293-.293.294-.766.004-1.057l-4.976-4.976h14.692c.414 0 .75-.336.75-.75s-.336-.75-.75-.75h-14.692l4.978-4.979c.289-.289.287-.761-.006-1.054-.147-.147-.339-.221-.53-.221-.191-.001-.38.071-.525.215z" fill-rule="nonzero"/></svg>
        </router-link>
        <div id="profile" class="container">
            <div class="row">
                <div class="col-12 col-sm-6 text-center">
                    <button id="pic">
                        <img class="mx-auto" style="width: 100px; height: 100px;" id="profile-svg" />
                    </button>
                </div>
                <div class="col-12 col-sm-6 text-center my-auto">
                    <div class="row">
                        <div class="col-6 pe-0"><p class="float-end mt-1 mb-0">Username: </p></div>
                        <div class="text-imp col-6"><p class="float-start mb-0" id="username"></p></div>
                        <div class="col-6 pe-0"><p class="float-end mt-1 mb-0">School: </p></div>
                        <div class="text-imp col-6"><p class="float-start mb-0" id="school"></p></div>
                        <div class="col-6 pe-0"><p id="group-html1" class="float-end mt-1 mb-0">Group: </p></div>
                        <div class="text-imp col-6" id="group-html2">
                            <form @submit.prevent="linkGroup" v-if="userSts.user.group == null" class="text-start">
                                <input type="text" id="grp-name" name="name" class="w-50 me-1">
                                <button type="submit" class="btn btn-outline-primary w-25 p-0 mb-1">Link</button>
                            </form>
                            <p class="float-start mb-0" id="group">{{userSts.user.group}}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="line"></div>
        <div id="stats" class="container">
            <div class="row">
                <div class="col-6">
                    <h1 class="text-center" id="pixelsPlaced"></h1>
                    <h3 class="text-center">tiles placed</h3>
                </div>
                <div class="col-6">
                    <h1 class="text-center">#{{ userSts.user.rank }}</h1>
                    <h3 class="text-center">rank</h3>
                </div>
            </div>
            <div id="sub-stat" class="container">
                <div class="row">
                    <div class="col-4">
                        <div id="favorite-color"></div>
                        <p class="text-center">favorite color</p>
                    </div>
                    <div class="col-4">
                        <h2 class="text-center">{{ userSts.user.stickedPixels }}</h2>
                        <p class="text-center">permanent tiles remaining</p>
                    </div>
                    <div class="col-4">
                        <h2 class="text-center">{{ userSts.user.bombs }}</h2>
                        <p class="text-center">bombs remaining</p>
                    </div>
                </div>
            </div>
        </div>
        <div class="line"></div>
        <div id="goal" class="container">
            <div class="row">
                <div v-for="step of userSts.user.steps" class="col-sm-3 col-6" v-bind:key="step.name">
                    <button data-bs-toggle="tooltip" data-bs-placement="top"
                        :title="step.description" class="a-unstyled">
                        <div class="perm-svg">
                            <img v-if="step.pixels < userSts.user.pixelsPlaced" :id="step.name" :src="'/src/assets/profile/'+step.img+'.svg'"/>
                            <img v-else :id="step.name" style="filter: grayscale(80%);" :src="'/src/assets/profile/'+step.img+'.svg'"/>
                        </div>
                        <h4 class="text-center">{{step.pixels}} placed</h4>
                    </button>
                    <p>{{step.description}}</p>
                </div>
            </div>
        </div>
    </div>

</template>

<style scoped>

.a-unstyled {
    text-decoration: none;
    color: initial;
}

.perm-svg {
    width: 100px;
    height: 100px;
    background-color: white;
    border-radius: 100px;
    margin: auto;
    border-color: grey;
    border: solid thin;
}

#goal {
    text-align: center;
}

#sub-stat {
    margin-top: 20px;
}

#favorite-color {
    margin: auto;
    margin-top: 8% !important;
    margin-bottom: 0.5rem !important;
    width: 20px;
    height: 20px;
}

.text-imp {
    margin-top: 3px;
    font-size: 17px;
}

.line {
    width: 100%;
    height: 2px;
    margin-top: 20px;
    margin-bottom: 20px;
    background-color: grey;
}

@media (max-width: 700px) {
  .arrow {
    display: none;
  }
}

</style>