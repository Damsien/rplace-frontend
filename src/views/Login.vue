<script setup lang="ts">
    import router from '@/router/index';
    import axios from 'axios';
    // @ts-ignore
    import $ from 'jquery';

    let pscope;
    let username;
    let password;

    function login() {
        pscope = $('#pscope').val();
        username = $('#username').val();
        password = $('#password').val();
        axios.post(`http://${import.meta.env.VITE_APP_BACKEND_API_URL}/login`, {
            "pscope": pscope,
            "username": username,
            "password": password
        }).then(res => {
            localStorage.setItem('ACCESS_TOKEN', res.data['access_token']);
            localStorage.setItem('REFRESH_TOKEN', res.data['refresh_token']);
            router.push('/');
        });
    }

</script>

<template>

    <div id="login">
        Pscope : <input id="pscope">
        Username : <input id="username">
        Password : <input id="password" type="password">
        <button @click="login">Login</button>
    </div>

</template>
