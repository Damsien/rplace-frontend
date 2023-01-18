<script setup lang="ts">
    // @ts-ignore
    import $ from 'jquery';
    import 'bootstrap/dist/js/bootstrap.js'
    import http from '@/router/http';
    import { useUserStore } from '@/stores/user';
    import { HEADERS } from '@/App.vue';
    import { ref, onActivated } from 'vue'
    import router from '@/router';
    import { getAndSetUser } from '@/user';
    import { usePatternStore } from '@/stores/pattern.js';

    const patternSts = usePatternStore();

    const userSts = useUserStore();
    let kind = 'self';

    var imgUrl = '';

    // When the user reaches on the page
    onActivated(() => {

        let url = `${window.env.VITE_APP_BACKEND_API_URL}/user`;
        if (router.currentRoute.value.params['id'] !== undefined) {
            url += '/other/'+router.currentRoute.value.params['id'];
            kind = 'other';
        } else {
            url += '/spec';
            kind = 'self';
        }


        getAndSetUser(url).then(user => {
        
            /*      PROFILE PIC     */
            imgUrl = `https://avatars.dicebear.com/api/pixel-art/${user.pscope}-${user.username}.svg`;
            
            try {
                loadHtml();
            } catch (e) {}

        });


        http.get(`${window.env.VITE_APP_BACKEND_API_URL}/user/game-state`, {
            headers: HEADERS,
            method: 'GET',
        }).then(res => {
            if (res.data.state == 'Occurs') {
                $('#group-form').removeClass('display-none');
            }
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
        } else {
            $('#username').css('color', '#3a3a3a');
        }

        /*      USER SET        */
        $('#username').text(userSts.user.username);
        $('#school').text(userSts.user.pscope);
        if (userSts.user.group) {
            $('#group').text(userSts.user.group);
        }

        /*      FAVORITE COLOR  */
        $('#favorite-color').css('background-color', userSts.user.favColor);
        $('#second-favorite-color').css('background-color', userSts.user.secondFavColor);


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


        /*      LINK GROUP      */
        if (kind == 'self') {
            if (!userSts.user.group || userSts.user.group == '') {
                http.get(`${window.env.VITE_APP_BACKEND_API_URL}/user/groups`, {
                    headers: HEADERS,
                    method: 'GET'
                }).then((res) => {
                    $('#grp-name').empty();
                    $('#grp-name').append(`<option disabled selected>Group</option>`);
                    for (let group of res.data) {
                        $('#grp-name').append(`<option value="${group.name}">${group.name}</option>`);
                    }
                });
            }
        }

    }

    function linkGroup() {
        const grp = $('#grp-name').find(":selected").val();
        http.put(`${window.env.VITE_APP_BACKEND_API_URL}/user/group/link`, {
            "name": grp
        }, {
            headers: HEADERS,
            method: 'PUT',
        }).then(res => {
            userSts.setGroup(res.data);
        });
    }

    function logout() {
        localStorage.clear();
        router.push('/login');
        userSts.clearUser();
    }

    function goBack() {
        if (patternSts.isPatternSet === false) {
            router.push('/')
        } else {
            router.go(-1);
        }
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
        <div @click="goBack" class="position-absolute ms-2 cursor-pointer" style="z-index: 10;">
            <svg width="50px" height="50px" clip-rule="evenodd" fill-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m9.474 5.209s-4.501 4.505-6.254 6.259c-.147.146-.22.338-.22.53s.073.384.22.53c1.752 1.754 6.252 6.257 6.252 6.257.145.145.336.217.527.217.191-.001.383-.074.53-.221.293-.293.294-.766.004-1.057l-4.976-4.976h14.692c.414 0 .75-.336.75-.75s-.336-.75-.75-.75h-14.692l4.978-4.979c.289-.289.287-.761-.006-1.054-.147-.147-.339-.221-.53-.221-.191-.001-.38.071-.525.215z" fill-rule="nonzero"/></svg>
        </div>
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
                            <form id="group-form" @submit.prevent="linkGroup" v-if="userSts.user.group == null" class="text-start display-none">
                                <select id="grp-name" name="name" class="w-50 me-1">
                                </select>
                                <button type="submit" class="btn btn-outline-primary w-25 p-0 mb-1">Select</button>
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
                        <div class="fav-col" id="favorite-color"></div>
                        <p class="text-center">favorite color</p>
                    </div>
                    <div class="col-4">
                        <h2 class="text-center">{{ userSts.user.stickedPixels }}</h2>
                        <p class="text-center">permanent tiles remaining</p>
                    </div>
                    <div v-if="userSts.user.groupRank" class="col-4">
                        <h2 class="text-center">#{{ userSts.user.groupRank }}</h2>
                        <p class="text-center">group rank</p>
                    </div>
                    <div v-else class="col-4">
                        <div class="fav-col" id="second-favorite-color"></div>
                        <p class="text-center">2° favorite color</p>
                    </div>
                    <!--<div class="col-4">
                        <h2 class="text-center">{{ userSts.user.bombs }}</h2>
                        <p class="text-center">bombs remaining</p>
                    </div>-->
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
                            <img v-if="step.pixels < userSts.user.pixelsPlaced" :id="step.name" :src="'/assets/'+step.img+'.svg'"/>
                            <img v-else :id="step.name" style="filter: grayscale(80%);" :src="'/assets/'+step.img+'.svg'"/>
                        </div>
                        <h4 class="text-center">{{step.pixels}} placed</h4>
                    </button>
                    <p>{{step.description}}</p>
                </div>
            </div>
        </div>
        <div class="line"></div>
        <div class="display-inline text-center">
            <form @submit.prevent="logout">
                <button type="submit" class="btn btn-outline-danger">Logout</button>
            </form>
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

.fav-col {
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
