<script setup lang="ts">
    // @ts-ignore
    import $ from 'jquery';
    import 'bootstrap/dist/js/bootstrap.js'

    const STEPS = {
        STEP_ONE: 200,
        STEP_TWO: 500,
        STEP_THREE: 800,
        STEP_FOUR: 1000,
    }
    
    $(function () {

        /*      PROFILE PIC     */
        var imgUrl = "https://avatars.dicebear.com/api/pixel-art/ddassdeferfb.svg";
        $('#profile-svg').attr('src', imgUrl);
        $('#pic').on('click', function() {
            $("#liveToast").show();
            navigator.clipboard.writeText(window.location.toString());
        });
        $('#liveToast').on('click', function() {
            $('#liveToast').hide();
        });


        var pixelsPlaced = 678;
        /*      PIXELS PLACES   */
        $('#pixelsPlaced').text(pixelsPlaced);

        /*      STEP CHECKER    */
        for (let step of Object.entries(STEPS)) {
            if (step[1]-pixelsPlaced <= 0) {
                $('#'+step[0]).css('filter', 'grayscale(0%)');
            }
        }

        /*      GOLD NAME       */
        if(pixelsPlaced >= STEPS.STEP_THREE) {
            $('#username').css('color', '#F1BD09');
        }


        /*      USER SET        */
        var username = 'ddassieu';
        var pscope = 'inp';
        var group;
        $('#username').text(username);
        $('#school').text(pscope);
        if (group) {
            $('#groupInput').removeClass('d-none');
            $('#group').text(group);
        }

    });

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
                        <img class="mx-auto" width="100px" height="100px" id="profile-svg" />
                    </button>
                </div>
                <div class="col-12 col-sm-6 text-center my-auto">
                    <div class="row">
                        <div class="col-6 pe-0"><p class="float-end mt-1 mb-0">Username: </p></div>
                        <div class="text-imp col-6"><p class="float-start mb-0" id="username"></p></div>
                        <div class="col-6 pe-0"><p class="float-end mt-1 mb-0">School: </p></div>
                        <div class="text-imp col-6"><p class="float-start mb-0" id="school"></p></div>
                        <div class="col-6 pe-0"><p id="groupInput" class="float-end mt-1 mb-0 d-none">Group: </p></div>
                        <div class="text-imp col-6"><p class="float-start mb-0" id="group"></p></div>
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
                    <h1 class="text-center">#6</h1>
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
                        <h2 class="text-center">2</h2>
                        <p class="text-center">permanent tiles remaining</p>
                    </div>
                    <div class="col-4">
                        <h2 class="text-center">Yes</h2>
                        <p class="text-center">bomb used</p>
                    </div>
                </div>
            </div>
        </div>
        <div class="line"></div>
        <div id="goal" class="container">
            <div class="row">
                <div class="col-sm-3 col-6">
                    <button data-bs-toggle="tooltip" data-bs-placement="top"
                        title="Place 200 to unlock 5 permanent pixels" class="a-unstyled">
                        <div class="perm-svg">
                            <img id="STEP_ONE" style="filter: grayscale(80%);" src="src/assets/profile/perm-pixel.svg"/>
                        </div>
                        <h4 class="text-center">{{STEPS.STEP_ONE}} placed</h4>
                    </button>
                </div>
                <div class="col-sm-3 col-6">
                    <button data-bs-toggle="tooltip" data-bs-placement="top"
                        title="Place 500 to unlock 1 bomb" class="a-unstyled">
                        <div class="perm-svg">
                            <img id="STEP_TWO" style="filter: grayscale(80%);" src="src/assets/profile/bomb.svg">
                        </div>
                        <h4 class="text-center">{{STEPS.STEP_TWO}} placed</h4>
                    </button>
                </div>
                <div class="col-sm-3 col-6">
                    <button data-bs-toggle="tooltip" data-bs-placement="top"
                        title="Place 800 to have your name in gold" class="a-unstyled">
                        <div class="perm-svg">
                            <img id="STEP_THREE" style="filter: grayscale(80%);" src="src/assets/profile/gold-name.svg"/>
                        </div>
                        <h4 class="text-center">{{STEPS.STEP_THREE}} placed</h4>
                    </button>
                </div>
                <div class="col-sm-3 col-6">
                    <button data-bs-toggle="tooltip" data-bs-placement="top"
                        title="Place 1000 to unlock 5 permanent pixels" class="a-unstyled">
                        <div class="perm-svg">
                            <img id="STEP_FOUR" style="filter: grayscale(80%);" src="src/assets/profile/perm-pixel.svg"/>
                        </div>
                        <h4 class="text-center">{{STEPS.STEP_FOUR}} placed</h4>
                    </button>
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
    background-color: red;
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