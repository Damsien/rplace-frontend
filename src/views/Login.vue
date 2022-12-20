<script setup lang="ts">
    import http from '@/router/http';
    import router from '@/router/index';
    import axios from 'axios';
    // @ts-ignore
    import $ from 'jquery';
    import { onUpdated } from 'vue';
    import { onActivated } from 'vue';

    onActivated(() => {
        checkParams();
    });

    onUpdated(() => {
        checkParams();
    });

    function checkParams() {
        var form = document.getElementById('form');

        if (router.currentRoute.value.query['redirect'] == '401') {
            $('#401-danger').removeClass('d-none');
            form?.classList.remove('was-validated');
        }

        if (router.currentRoute.value.query['redirect'] == 'forbidden') {
            $('#forbidden-danger').removeClass('d-none');
            form?.classList.remove('was-validated');
        }

        if (router.currentRoute.value.query['redirect'] == 'bad_cred') {
            $('#bad_cred-danger').removeClass('d-none');
            form?.classList.remove('was-validated');
        }
        
        router.push('/login');
    }

    $(function () {


        // Fetch all the forms we want to apply custom Bootstrap validation styles to
        var forms = document.querySelectorAll('.needs-validation')

        // Loop over them and prevent submission
        Array.prototype.slice.call(forms)
            .forEach(function (form) {
            form.addEventListener('submit', function (event: any) {

                event.preventDefault()
                event.stopPropagation()
                form.classList.add('was-validated');
                
                if (form.checkValidity()) {
                    login();
                }
            }, false)
        })

    });

    


    let pscope;
    let username;
    let password;

    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

    function login() {
        pscope = $('#pscope').val();
        username = $('#username').val();
        password = $('#password').val();
        http.post(`${window.env.VITE_APP_BACKEND_API_URL}/login`, {
            "pscope": pscope,
            "username": username,
            "password": password
        }).then((res) => {
            localStorage.setItem('ACCESS_TOKEN', res.data['access_token']);
            localStorage.setItem('REFRESH_TOKEN', res.data['refresh_token']);
            try {
                http.get(`${window.env.VITE_APP_BACKEND_API_URL}/user/game-state`, {
                    headers: {
                        'Accept': '*/*',
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                        'Authorization': `Bearer ${res.data['access_token']}`
                    },
                    method: 'GET'
                }).then(res => {
                    const beforeLog = localStorage.getItem('before-log') ?? '/';
                    // localStorage.removeItem('before-log');
                    router.push(`${beforeLog}?login=true`);
                });
            } catch (err) { }
        });
    }

</script>

<template>

    <div id="card" class="px-4">
        <div class="alert alert-danger d-none" role="alert" id="401-danger">
            You are not authorized / not logged in
        </div>
        <div class="alert alert-danger d-none" role="alert" id="forbidden-danger">
            The game does not take place at this time
        </div>
        <div class="alert alert-danger d-none" role="alert" id="bad_cred-danger">
            Bad credentials
        </div>
        <h2>Sign in</h2>
        <p>Use your <strong>university identifiers</strong> (Planete,Moodle,ect..)</p>
        <form class="needs-validation" novalidate id="form">
            <div class="mb-3">
                <label for="pscope" class="form-label">School</label>
                <select required class="form-select" id="pscope">
                    <option>inp</option>
                    <option>loc</option>
                    <option>ecv</option>
                </select>
            </div>
            <div class="mb-3">
                <label for="username" class="form-label">Username</label>
                <input placeholder="Lea Calzamiglia : lcalzami" type="text" class="form-control" id="username" required>
                <div class="invalid-feedback">
                    Please provide a username.
                </div>
            </div>
            <div class="mb-3">
                <label for="password" class="form-label">Password</label>
                <input placeholder="Mail/Moodle password" type="password" class="form-control" id="password" required>
                <div class="invalid-feedback">
                    Please provide a password.
                </div>
            </div>
            <button type="submit" class="btn btn-primary">Login</button>
        </form>
    </div>

</template>
