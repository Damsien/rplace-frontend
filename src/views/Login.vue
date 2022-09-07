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

    <div class="mb-3">
        <label for="pscope" class="form-label">Zone</label>
        <input type="text" class="form-control" id="pscope">
    </div>
    <div class="mb-3">
        <label for="username" class="form-label">Username</label>
        <input type="text" class="form-control" id="username">
    </div>
    <div class="mb-3">
        <label for="password" class="form-label">Password</label>
        <input type="password" class="form-control" id="password">
    </div>
    <button @touchstart="login" @click="login" class="btn btn-primary">Submit</button>

</template>
