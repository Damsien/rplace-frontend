<script setup lang="ts">
    import http from '@/router/http';
    import router from '@/router/index';
    import axios from 'axios';
    // @ts-ignore
    import $ from 'jquery';
    import { onActivated } from 'vue';

    $(function () {

        if (router.currentRoute.value.query['redirect'] == '401') {
            $('#alert-danger').removeClass('d-none');
        }


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

    function login() {
        pscope = $('#pscope').val();
        username = $('#username').val();
        password = $('#password').val();
        http.post(`http://${window.env.VITE_APP_BACKEND_API_URL}/login`, {
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
        <div class="alert alert-danger d-none" role="alert" id="alert-danger">
            You are not authorized / not logged in
        </div>
        <h2>Sign in</h2>
        <form class="needs-validation" novalidate>
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
