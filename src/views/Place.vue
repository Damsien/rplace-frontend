<script setup lang="ts">
// @ts-ignore
import Map from '@/components/Map.vue'
// @ts-ignore
import Profile from '@/components/Profile.vue'
</script>

<template>
  <main>
    <div id="screen">
      <router-link id="info" to="/info" class="position-absolute ms-2 icon" style="z-index: 10;" title="Informations">
        <svg width="47px" height="47px" clip-rule="evenodd" fill-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m12.002 2.005c5.518 0 9.998 4.48 9.998 9.997 0 5.518-4.48 9.998-9.998 9.998-5.517 0-9.997-4.48-9.997-9.998 0-5.517 4.48-9.997 9.997-9.997zm0 1.5c-4.69 0-8.497 3.807-8.497 8.497s3.807 8.498 8.497 8.498 8.498-3.808 8.498-8.498-3.808-8.497-8.498-8.497zm0 6.5c-.414 0-.75.336-.75.75v5.5c0 .414.336.75.75.75s.75-.336.75-.75v-5.5c0-.414-.336-.75-.75-.75zm-.002-3c.552 0 1 .448 1 1s-.448 1-1 1-1-.448-1-1 .448-1 1-1z" fill-rule="nonzero"/></svg>
      </router-link>
      <router-link id="pattern-list" to="/pattern-list" class="position-absolute ms-2 icon" style="z-index: 10;" title="Pattern list">
        <svg width="43px" height="43px" clip-rule="evenodd" fill-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m10.5 17.25c0-.414.336-.75.75-.75h10c.414 0 .75.336.75.75s-.336.75-.75.75h-10c-.414 0-.75-.336-.75-.75zm-1.5-3.55c0-.53-.47-1-1-1h-5c-.53 0-1 .47-1 1v4.3c0 .53.47 1 1 1h5c.53 0 1-.47 1-1zm-5.5.5h4v3.3h-4zm7-2.2c0-.414.336-.75.75-.75h10c.414 0 .75.336.75.75s-.336.75-.75.75h-10c-.414 0-.75-.336-.75-.75zm-1.5-6c0-.53-.47-1-1-1h-5c-.53 0-1 .47-1 1v4.3c0 .53.47 1 1 1h5c.53 0 1-.47 1-1zm-5.5.5h4v3.3h-4zm7 .25c0-.414.336-.75.75-.75h10c.414 0 .75.336.75.75s-.336.75-.75.75h-10c-.414 0-.75-.336-.75-.75z" fill-rule="nonzero"/></svg>
      </router-link>
      <Profile />
      <Map />
    </div>
  </main>
</template>

<style scoped>

.icon {
    text-align: center;
    background-color: white;
    float: right;
    border-radius: 100px;
    border: solid thin #383838;
    right: 25px;
    width: 60px;
    height: 60px;
}

#info {
    top: 175px;
    padding-top: 5px;
}

#pattern-list {
    top: 100px;
    padding-top: 7px;
}

#screen {
    overflow: hidden; /* Hide scrollbars */
    position: relative;
    width: 100%;
    min-height: 100vh;
}
</style>