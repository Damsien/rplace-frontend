<script setup lang="ts">
import Pattern from '@/components/Pattern.vue'
import $ from 'jquery';

$(function() {
    $('.link').on('click', function(e) {
        e.stopPropagation();
        e.stopImmediatePropagation();
        navigator.clipboard.writeText(this.id);
    });

    $('.remove').on('click', function(e) {
        e.stopPropagation();
        e.stopImmediatePropagation();
        navigator.clipboard.writeText(this.id);
    });
})

</script>

<template>
  <main>
    <div id="screen">
        <div class="card m-4 p-2">
            <h2>Pattern list</h2>
            <ul>
                <li>
                    <router-link to="/pattern/1" class="me-3">Pattern #1</router-link>
                    <svg class="pointer link me-2" id="pattern-1" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path d="M18 6v-6h-18v18h6v6h18v-18h-6zm-16 10v-14h14v4h-10v10h-4z"/></svg>
                    <svg class="pointer remove" width="24" height="24" xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd" clip-rule="evenodd"><path d="M19 24h-14c-1.104 0-2-.896-2-2v-16h18v16c0 1.104-.896 2-2 2m-9-14c0-.552-.448-1-1-1s-1 .448-1 1v9c0 .552.448 1 1 1s1-.448 1-1v-9zm6 0c0-.552-.448-1-1-1s-1 .448-1 1v9c0 .552.448 1 1 1s1-.448 1-1v-9zm6-5h-20v-2h6v-1.5c0-.827.673-1.5 1.5-1.5h5c.825 0 1.5.671 1.5 1.5v1.5h6v2zm-12-2h4v-1h-4v1z"/></svg>
                </li>
            </ul>
            <h3>Create new pattern</h3>
            <form action="/pattern">
                <div class="mb-3">
                    <label for="name" class="form-label">Pattern name</label>
                    <input type="text" class="form-control" id="name" name="name">
                </div>
                <button type="submit" class="btn btn-primary">Submit</button>
            </form>
        </div>
    </div>
  </main>
</template>

<style scoped>

.pointer {
    cursor: pointer;
}

li {
    display: inline;
}

#screen {
    overflow: hidden; /* Hide scrollbars */
    position: relative;
    width: 100%;
    min-height: 100vh;
}
</style>