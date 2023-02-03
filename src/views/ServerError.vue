<script setup lang='ts'>

    import router from '@/router/index';

    localStorage.removeItem('before-log');

</script>

<template>
    <div id="card" class="p-4">
        <h1>Backend error {{ router.currentRoute.value.params.id }}</h1>
        <br>
        <p>{{ router.currentRoute.value.query['req_url'] }}</p>
        <br>
        <p>{{ router.currentRoute.value.query['req_params'] }}</p>
        <br>
        <p>{{ router.currentRoute.value.query['res'] }}</p>
        <br>
        <p>Please contact the game administrator with a screenshot of this page.</p>
        <p>If you don't know the game administrator, please contact <a href="https://m.me/Dami1Da" target="_blank">Damien Dassieu</a></p>
        <br>
        <router-link to="/" class="btn btn-primary">Go to the main page</router-link>
    </div>
</template>