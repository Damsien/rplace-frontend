<script setup lang="ts">
    // @ts-ignore
    import { HEADERS } from '@/App.vue';
    import http from '@/router/http';
    import $ from 'jquery';

    $(function () {

        http.get(`${import.meta.env.VITE_APP_BACKEND_API_URL}/user/username`, {
            headers: HEADERS,
            method: 'GET'
        }).then(res => {
            var imgUrl = `https://avatars.dicebear.com/api/pixel-art/${res.data.pscope}-${res.data.username}.svg`;
            $('#profile-svg').attr('src', imgUrl);
            $('#profile-svg').attr('width', '50px');
            $('#profile-svg').attr('height', '50px');
        });

    })

</script>

<template>

<router-link to="/user">
    <div class="text-center" id="profile">
        <img id="profile-svg" />
    </div>
</router-link>

</template>

<style scoped>

a {
    z-index: 100;
}

#svg {
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
}

#profile-svg {
    top: 2px;
}

#profile {
    top: 25px;
    right: 25px;
    width: 60px;
    height: 60px;
    background-color: white;
    float: right;
    border-radius: 100px;
    border: solid thin #383838;
}

</style>