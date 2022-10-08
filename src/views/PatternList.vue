<script setup lang="ts">
import $ from 'jquery';
import axios from 'axios';
import { usePatternsStore } from '@/stores/patterns.js';

const TOKEN = localStorage.getItem('ACCESS_TOKEN');
const HEADERS = {
        'Accept': '*/*',
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Authorization': `Bearer ${TOKEN}`
    };

const patternsSts = usePatternsStore();

var patterns: any[] = [];

axios.get(`http://${import.meta.env.VITE_APP_BACKEND_API_URL}/pattern/all`, {
    headers: HEADERS,
    method: 'GET',
}).then(res => {
    res.data.forEach((pattern: any) => {
        patterns.push(pattern);
    });
    patternsSts.setPatterns(patterns);
});

function onLink(e: Event) {
    e.stopPropagation();
    e.stopImmediatePropagation();
    navigator.clipboard.writeText(e.currentTarget?.id.split('/')[1]);
}

function onRemove(e: Event) {
    let id = e.currentTarget?.id;
    axios.delete(`http://${import.meta.env.VITE_APP_BACKEND_API_URL}/pattern/${id.split('/')[1]}`, {
        headers: HEADERS,
        method: 'DELETE',
    }).then(res => {
        document.getElementById('pattern/'+id.split('/')[1])?.remove();
    });
    e.stopPropagation();
    e.stopImmediatePropagation();
}

function createPattern() {
    const name = $('#name').val()?.toString();
    axios.post(`http://${import.meta.env.VITE_APP_BACKEND_API_URL}/pattern`, {
        patternName: name
    }, {
        headers: HEADERS,
        method: 'POST',
    }).then(res => {
        const id = res.data.identifiers[0].patternId;
        const removeLogo = $(`
            <svg class="pointer remove" id="remove/${id}" width="24" height="24" xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd" clip-rule="evenodd"><path d="M19 24h-14c-1.104 0-2-.896-2-2v-16h18v16c0 1.104-.896 2-2 2m-9-14c0-.552-.448-1-1-1s-1 .448-1 1v9c0 .552.448 1 1 1s1-.448 1-1v-9zm6 0c0-.552-.448-1-1-1s-1 .448-1 1v9c0 .552.448 1 1 1s1-.448 1-1v-9zm6-5h-20v-2h6v-1.5c0-.827.673-1.5 1.5-1.5h5c.825 0 1.5.671 1.5 1.5v1.5h6v2zm-12-2h4v-1h-4v1z"/></svg>
        `).on('click', onRemove);
        const copyLogo = $(`
            <svg class="pointer link me-2" id="copy/${id}" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path d="M18 6v-6h-18v18h6v6h18v-18h-6zm-16 10v-14h14v4h-10v10h-4z"/></svg>
        `).on('click', onLink);
        $('#list').append($(`
            <li id="pattern/${id}">
                <a href="/pattern/${id}" class="me-3">${name}</a>
            </li>`).append(copyLogo).append(removeLogo)
        );
        // document.getElementById('svg#remove/'+id+'.pointer.remove')?.addEventListener('click', (e) => onRemove(e));
        // document.getElementById('svg#remove/'+id+'.pointer.link')?.addEventListener('click', (e) => onLink(e));
    });
}

</script>

<template>
  <main>
    <div id="screen">
        <div class="card m-4 p-2">
            <h2>Pattern list</h2>
            <ul id="list">
                <li v-for="pattern in patternsSts.patterns" :id="'pattern/'+pattern.patternId">
                    <router-link :to="'/pattern/'+pattern.patternId" class="me-3">{{ pattern.name }}</router-link>
                    <svg @click="onLink" class="pointer link me-2" :id="'copy/'+pattern.patternId" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path d="M18 6v-6h-18v18h6v6h18v-18h-6zm-16 10v-14h14v4h-10v10h-4z"/></svg>
                    <svg @click="onRemove" class="pointer remove" :id="'remove/'+pattern.patternId" width="24" height="24" xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd" clip-rule="evenodd"><path d="M19 24h-14c-1.104 0-2-.896-2-2v-16h18v16c0 1.104-.896 2-2 2m-9-14c0-.552-.448-1-1-1s-1 .448-1 1v9c0 .552.448 1 1 1s1-.448 1-1v-9zm6 0c0-.552-.448-1-1-1s-1 .448-1 1v9c0 .552.448 1 1 1s1-.448 1-1v-9zm6-5h-20v-2h6v-1.5c0-.827.673-1.5 1.5-1.5h5c.825 0 1.5.671 1.5 1.5v1.5h6v2zm-12-2h4v-1h-4v1z"/></svg>
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