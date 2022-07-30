<script setup lang="ts">

  function clickTest() {

    
      fetch('http://192.168.1.37:3000/api/v1/login', {
        method: 'POST',
        body: JSON.stringify({
          "username": "ddassieu",
          "password": "",
          "pscope": "inp"
        }),
        mode: 'cors',
        headers: {
          'Accept': '*/*',
          'Content-Type': 'application/json',
          'Host': '192.168.1.37:3000',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST',
        }
      })
      .then(res => {
        console.log(res);
      });
  }

</script>

<template>
  <!-- <HelloWorld msg="Vite + Vue" /> -->
  <button type="button" @click="clickTest">API GET test</button>
</template>

<style scoped>
</style>
