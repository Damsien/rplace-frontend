<script setup lang="ts">
import router from '@/router/index';
import $ from 'jquery';
import axios from 'axios';
import { usePatternsStore } from '@/stores/patterns.js';
import http from '@/router/http';
import { HEADERS } from '@/App.vue';
import { ref, onActivated } from 'vue'

const patternsSts = usePatternsStore();

// When the document is ready
$(function() {
    $('#liveToast').on('click', function() {
        $('#liveToast').hide();
    });
});

// When the user reaches the page
onActivated(() => {
    http.get(`http://${import.meta.env.VITE_APP_BACKEND_API_URL}/pattern/all`, {
        headers: HEADERS,
        method: 'GET',
    }).then(res => {
        patternsSts.setPatterns(res.data);
    });
});

function onLink(e: any | Event) {
    $("#liveToast").show();
    e.stopPropagation();
    e.stopImmediatePropagation();
    navigator.clipboard.writeText(location.host+'?pattern='+e.currentTarget.id.split('/')[1]);
}

function onRemove(e: any | Event) {
    let id = e.currentTarget.id;
    http.delete(`http://${import.meta.env.VITE_APP_BACKEND_API_URL}/pattern/${id.split('/')[1]}`, {
        headers: HEADERS,
        method: 'DELETE',
    }).then(res => {
        document.getElementById('pattern/'+id.split('/')[1])?.remove();
        document.getElementById('pattern/'+id.split('/')[1])?.remove();
    });
    e.stopPropagation();
    e.stopImmediatePropagation();
}

function goToPattern(e: any | Event) {
    let id = e.currentTarget.id;
    router.push(`/?pattern=${id.split('/')[1]}`);
}

function createPattern() {
    const name = $('#name').val()?.toString();
    http.post(`http://${import.meta.env.VITE_APP_BACKEND_API_URL}/pattern`, {
        patternName: name
    }, {
        headers: HEADERS,
        method: 'POST',
    }).then(res => {
        console.log(res.data)
        const id = res.data.patternId;
        router.push(`/pattern/${id}`);
    });
}

</script>

<template>

    <div class="position-fixed bottom-0 end-0 p-3" style="z-index: 11">
        <div id="liveToast" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="toast-header">
                <strong class="me-auto">Link copied to the clipboard</strong>
                <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        </div>
    </div>

  <main>
    <div id="screen">
        <div class="card m-4 p-2">
            <h2 id="self-h2" v-if="patternsSts.self.length != 0">Your patterns</h2>
            <ul v-if="patternsSts.self.length != 0">
                <li v-for="pattern in patternsSts.self" :key="pattern.patternId" :id="'pattern/'+pattern.patternId">
                    <router-link :to="'/pattern/'+pattern.patternId" class="me-3">{{ pattern.name }}</router-link>
                    <svg @click="onLink" class="pointer link me-2" :id="'copy/'+pattern.patternId" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path d="M18 6v-6h-18v18h6v6h18v-18h-6zm-16 10v-14h14v4h-10v10h-4z"/></svg>
                    <svg @click="onRemove" class="pointer remove" :id="'remove/'+pattern.patternId" width="24" height="24" xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd" clip-rule="evenodd"><path d="M19 24h-14c-1.104 0-2-.896-2-2v-16h18v16c0 1.104-.896 2-2 2m-9-14c0-.552-.448-1-1-1s-1 .448-1 1v9c0 .552.448 1 1 1s1-.448 1-1v-9zm6 0c0-.552-.448-1-1-1s-1 .448-1 1v9c0 .552.448 1 1 1s1-.448 1-1v-9zm6-5h-20v-2h6v-1.5c0-.827.673-1.5 1.5-1.5h5c.825 0 1.5.671 1.5 1.5v1.5h6v2zm-12-2h4v-1h-4v1z"/></svg>
                    <svg @click="goToPattern" width="30" height="30" class="ms-2 pointer" :id="'goto/'+pattern.patternId" clip-rule="evenodd" fill-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m13.022 14.999v3.251c0 .412.335.75.752.75.188 0 .375-.071.518-.206 1.775-1.685 4.945-4.692 6.396-6.069.2-.189.312-.452.312-.725 0-.274-.112-.536-.312-.725-1.451-1.377-4.621-4.385-6.396-6.068-.143-.136-.33-.207-.518-.207-.417 0-.752.337-.752.75v3.251h-9.02c-.531 0-1.002.47-1.002 1v3.998c0 .53.471 1 1.002 1zm1.5-4.498v-3.008l4.751 4.507-4.751 4.507v-3.008h-10.022v-2.998z" fill-rule="nonzero"/></svg>
                </li>
            </ul>
            <h2 id="bind-h2" v-if="patternsSts.bind.length != 0">Registered patterns</h2>
            <ul v-if="patternsSts.bind.length != 0">
                <li v-for="pattern in patternsSts.bind" :key="pattern.patternId" :id="'pattern/'+pattern.patternId">
                    <router-link :to="'/pattern/'+pattern.patternId" class="me-3">{{ pattern.name }}</router-link>
                    <svg @click="onLink" class="pointer link me-2" :id="'copy/'+pattern.patternId" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path d="M18 6v-6h-18v18h6v6h18v-18h-6zm-16 10v-14h14v4h-10v10h-4z"/></svg>
                    <svg @click="onRemove" class="pointer remove" :id="'remove/'+pattern.patternId" width="24" height="24" xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd" clip-rule="evenodd"><path d="M19 24h-14c-1.104 0-2-.896-2-2v-16h18v16c0 1.104-.896 2-2 2m-9-14c0-.552-.448-1-1-1s-1 .448-1 1v9c0 .552.448 1 1 1s1-.448 1-1v-9zm6 0c0-.552-.448-1-1-1s-1 .448-1 1v9c0 .552.448 1 1 1s1-.448 1-1v-9zm6-5h-20v-2h6v-1.5c0-.827.673-1.5 1.5-1.5h5c.825 0 1.5.671 1.5 1.5v1.5h6v2zm-12-2h4v-1h-4v1z"/></svg>
                    <svg @click="goToPattern" width="30" height="30" class="ms-2 pointer" :id="'goto/'+pattern.patternId" clip-rule="evenodd" fill-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m13.022 14.999v3.251c0 .412.335.75.752.75.188 0 .375-.071.518-.206 1.775-1.685 4.945-4.692 6.396-6.069.2-.189.312-.452.312-.725 0-.274-.112-.536-.312-.725-1.451-1.377-4.621-4.385-6.396-6.068-.143-.136-.33-.207-.518-.207-.417 0-.752.337-.752.75v3.251h-9.02c-.531 0-1.002.47-1.002 1v3.998c0 .53.471 1 1.002 1zm1.5-4.498v-3.008l4.751 4.507-4.751 4.507v-3.008h-10.022v-2.998z" fill-rule="nonzero"/></svg>
                </li>
            </ul>
            <h3>Create new pattern</h3>
            <form @submit.prevent="createPattern">
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

<style>

.pointer {
    cursor: pointer;
}

#screen {
    overflow: hidden; /* Hide scrollbars */
    position: relative;
    width: 100%;
    min-height: 100vh;
}
</style>