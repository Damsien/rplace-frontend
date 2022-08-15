<script setup lang="ts">
    // @ts-ignore
    import $ from 'jquery';
    
    $(function () {
        var imgUrl = "https://avatars.dicebear.com/api/pixel-art/edzedezze.svg";
        $('#profile-svg').attr('src', imgUrl);
        $('#profile-svg').attr('width', '50px');
        $('#profile-svg').attr('height', '50px');
    })

</script>

<template>

<a href="../user">
    <div class="text-center" id="profile">
        <img id="profile-svg" />
    </div>
</a>

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