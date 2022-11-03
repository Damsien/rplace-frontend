


<template>
    <div id="card">
        <router-link to="/" class="position-absolute ms-2" style="z-index: 10;">
            <svg width="50px" height="50px" clip-rule="evenodd" fill-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m9.474 5.209s-4.501 4.505-6.254 6.259c-.147.146-.22.338-.22.53s.073.384.22.53c1.752 1.754 6.252 6.257 6.252 6.257.145.145.336.217.527.217.191-.001.383-.074.53-.221.293-.293.294-.766.004-1.057l-4.976-4.976h14.692c.414 0 .75-.336.75-.75s-.336-.75-.75-.75h-14.692l4.978-4.979c.289-.289.287-.761-.006-1.054-.147-.147-.339-.221-.53-.221-.191-.001-.38.071-.525.215z" fill-rule="nonzero"/></svg>
        </router-link>
        <div id="info" class="container">
            <h2 class="text-center">Informations</h2>
            <br>
            <h3>What is the project</h3>
            <p>
                The project is managed by the BDA of the ENSEEIHT.
            </p>
            <img id="bda-img" alt="BDA of the ENSEEIHT" src="/src/assets/bda.png">
            <br><br>
            <h4>Group</h4>
            <p>
                If you want to create a group, first make sure that the group does not already exist. 
                It is best if you join the group of your list or of a club you belong to. 
                Otherwise, you can contact us in the section below.
            </p>
            <br>
            <h3>Contact</h3>
            <p>
                If you have any problem, you can contact us here :
            </p>
            <ul class="list-group">
                <li class="list-group-item"><a href="https://m.me/Dami1Da" target="_blank">Damien Dassieu</a></li>
                <li class="list-group-item"><a href="https://m.me/Dami1Da" target="_blank">Diego Barragan</a></li>
                <li class="list-group-item"><a href="https://m.me/Dami1Da" target="_blank">Victor Marti</a></li>
            </ul>
            <br>
            <p>
                This website was created by Damien Dassieu. It is hosted by Net7.
            </p>
        </div>
    </div>
</template>



<style scoped>

    #bda-img {
        max-width: 100%;
        max-height: 100%;
        border-radius: 20px;
    }

</style>