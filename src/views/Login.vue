<script setup lang="ts">
    import http from '@/router/http';
    import router from '@/router/index';
    import axios from 'axios';
    // @ts-ignore
    import $ from 'jquery';


    (function () {
        'use strict'

        // Fetch all the forms we want to apply custom Bootstrap validation styles to
        var forms = document.querySelectorAll('.needs-validation')

        // Loop over them and prevent submission
        Array.prototype.slice.call(forms)
            .forEach(function (form) {
            form.addEventListener('submit', function (event: any | Event) {
                if (!form.checkValidity()) {
                event.preventDefault()
                event.stopPropagation()
                }

                form.classList.add('was-validated')
            }, false)
        })
    })()


    let pscope;
    let username;
    let password;

    function login() {
        pscope = $('#pscope').val();
        username = $('#username').val();
        password = $('#password').val();
        http.post(`http://${import.meta.env.VITE_APP_BACKEND_API_URL}/login`, {
            "pscope": pscope,
            "username": username,
            "password": password
        }).then(res => {
            localStorage.setItem('ACCESS_TOKEN', res.data['access_token']);
            localStorage.setItem('REFRESH_TOKEN', res.data['refresh_token']);
            router.push('/?login=true');
        });
    }

</script>

<template>

    <div id="card" class="px-4">
        <h2>Login</h2>
        <form @submit.prevent="login" class="needs-validation">
            <div class="mb-3">
                <label for="pscope" class="form-label">School</label>
                <select required class="form-select" id="pscope">
                    <option>inp</option>
                    <option>ecv</option>
                </select>
            </div>
            <div class="mb-3">
                <label for="username" class="form-label">Username</label>
                <input required type="text" class="form-control" id="username">
                <div class="invalid-feedback">
                    Please provide a username.
                </div>
            </div>
            <div class="mb-3">
                <label for="password" class="form-label">Password</label>
                <input required type="password" class="form-control" id="password">
                <div class="invalid-feedback">
                    Please provide a password.
                </div>
            </div>
            <button type="submit" class="btn btn-primary">Submit</button>
        </form>
    </div>

</template>
