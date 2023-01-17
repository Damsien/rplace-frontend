<script setup lang="ts">
import router from '@/router/index';
import $ from 'jquery';
import { Modal } from 'bootstrap';
import axios from 'axios';
import { usePatternsStore } from '@/stores/patterns.js';
import { usePatternStore } from '@/stores/pattern.js';
import http from '@/router/http';
import { HEADERS } from '@/App.vue';
import { ref, onActivated } from 'vue'

const patternsSts = usePatternsStore();
const patternSts = usePatternStore();

// When the document is ready
$(function() {
    $('#liveToast').on('click', function() {
        $('#liveToast').hide();
    });
});

// When the user reaches the page
onActivated(() => {
    http.get(`${window.env.VITE_APP_BACKEND_API_URL}/pattern/all`, {
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
    navigator.clipboard.writeText(location.host+'/canva/'+e.currentTarget.id.split('/')[1]);
}

function onRemove(e: any | Event, type: string, name: string) {
    const id = e.currentTarget.id.split('/')[1];
    patternsSts.setDeleteName(name);
    patternsSts.setDeleteId(id);
    if (type == 'self') {
        const modal = new Modal(document.getElementById('deleteModal') ?? '', {});
        modal.show();
    } else {
        doDelete();
    }
    e.stopPropagation();
    e.stopImmediatePropagation();
}

function doDelete() {
    http.delete(`${window.env.VITE_APP_BACKEND_API_URL}/pattern/${patternsSts.deleteId}`, {
        headers: HEADERS,
        method: 'DELETE',
    }).then(res => {
        document.getElementById('pattern/'+patternsSts.deleteId)?.remove();
    });
}

function createPattern() {
    const name = $('#name').val()?.toString();
    const regex = /^[^\/|^\n]+$/;
    if (name?.match(regex)) {
        http.post(`${window.env.VITE_APP_BACKEND_API_URL}/pattern`, {
            patternName: name
        }, {
            headers: HEADERS,
            method: 'POST',
        }).then(res => {
            const id = res.data.patternId;
            $('#name').val('');
            router.push(`/pattern/${id}`);
        });
    }
}


function goBack() {
    if (patternSts.isPatternSet === true) {
        router.go(-1);
    } else {
        router.push('/');
    }
}

</script>

<template>

    <div id="deleteModal" class="modal fade" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Delete {{ patternsSts.deleteName }}</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <p>Are you sure you want to delete <strong>{{ patternsSts.deleteName }}</strong> ?</p>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button @click="doDelete" type="button" class="btn btn-danger" data-bs-dismiss="modal">Delete</button>
                </div>
            </div>
        </div>
    </div>

    <div class="position-fixed bottom-0 end-0 p-3" style="z-index: 11">
        <div id="liveToast" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="toast-header">
                <strong class="me-auto">Link copied to the clipboard</strong>
                <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        </div>
    </div>

    <div id="card" class="px-4">
        <div class="row">
            <div class="col-2 cursor-pointer" @click="goBack" style="z-index: 10;">
                <svg width="50px" height="50px" clip-rule="evenodd" fill-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m9.474 5.209s-4.501 4.505-6.254 6.259c-.147.146-.22.338-.22.53s.073.384.22.53c1.752 1.754 6.252 6.257 6.252 6.257.145.145.336.217.527.217.191-.001.383-.074.53-.221.293-.293.294-.766.004-1.057l-4.976-4.976h14.692c.414 0 .75-.336.75-.75s-.336-.75-.75-.75h-14.692l4.978-4.979c.289-.289.287-.761-.006-1.054-.147-.147-.339-.221-.53-.221-.191-.001-.38.071-.525.215z" fill-rule="nonzero"/></svg>
            </div>
            <h2 class="col-8 text-center">All canvas</h2>
            <span class="col-2"></span>
        </div>
        <br />
        <h3 id="self-h2" v-if="patternsSts.self.length != 0">Your canvases</h3>
        <ul class="list-group" v-if="patternsSts.self.length != 0">
            <li class="list-group-item list-group-item-action d-flex justify-content-between align-items-start" v-for="pattern in patternsSts.self" :key="pattern.patternId" :id="'pattern/'+pattern.patternId">
                <router-link :to="'/canva/'+pattern.patternId" class="fw-bold">{{ pattern.name }}</router-link>
                <div>
                    <router-link :to="'/pattern/'+pattern.patternId">
                        <svg width="30" height="30" class="me-2 pointer" :id="'goto/'+pattern.patternId" clip-rule="evenodd" fill-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m19 20.25c0-.402-.356-.75-.75-.75-2.561 0-11.939 0-14.5 0-.394 0-.75.348-.75.75s.356.75.75.75h14.5c.394 0 .75-.348.75-.75zm-7.403-3.398 9.124-9.125c.171-.171.279-.423.279-.684 0-.229-.083-.466-.28-.662l-3.115-3.104c-.185-.185-.429-.277-.672-.277s-.486.092-.672.277l-9.143 9.103c-.569 1.763-1.555 4.823-1.626 5.081-.02.075-.029.15-.029.224 0 .461.349.848.765.848.511 0 .991-.189 5.369-1.681zm-3.27-3.342 2.137 2.137-3.168 1.046zm.955-1.166 7.651-7.616 2.335 2.327-7.637 7.638z" fill-rule="nonzero"/></svg>
                    </router-link>
                    <svg @click="onLink" class="pointer link me-2" :id="'copy/'+pattern.patternId" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path d="M6 17c2.269-9.881 11-11.667 11-11.667v-3.333l7 6.637-7 6.696v-3.333s-6.17-.171-11 5zm12 .145v2.855h-16v-12h6.598c.768-.787 1.561-1.449 2.339-2h-10.937v16h20v-6.769l-2 1.914z"/></svg>
                    <svg @click="(e) => onRemove(e, 'self', pattern.name)" class="pointer remove" :id="'remove/'+pattern.patternId" width="24" height="24" xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd" clip-rule="evenodd"><path d="M19 24h-14c-1.104 0-2-.896-2-2v-16h18v16c0 1.104-.896 2-2 2m-9-14c0-.552-.448-1-1-1s-1 .448-1 1v9c0 .552.448 1 1 1s1-.448 1-1v-9zm6 0c0-.552-.448-1-1-1s-1 .448-1 1v9c0 .552.448 1 1 1s1-.448 1-1v-9zm6-5h-20v-2h6v-1.5c0-.827.673-1.5 1.5-1.5h5c.825 0 1.5.671 1.5 1.5v1.5h6v2zm-12-2h4v-1h-4v1z"/></svg>
                </div>
            </li>
        </ul>
        <br />
        <h3 id="bind-h2" v-if="patternsSts.bind.length != 0">Registered canvases</h3>
        <ul class="list-group" v-if="patternsSts.bind.length != 0">
            <li class="list-group-item list-group-item-action d-flex justify-content-between align-items-start" v-for="pattern in patternsSts.bind" :key="pattern.patternId" :id="'pattern/'+pattern.patternId">
                <router-link :to="'/canva/'+pattern.patternId" class="fw-bold">{{ pattern.name }}</router-link>
                <div>
                    <svg @click="onLink" class="pointer link me-2" :id="'copy/'+pattern.patternId" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path d="M6 17c2.269-9.881 11-11.667 11-11.667v-3.333l7 6.637-7 6.696v-3.333s-6.17-.171-11 5zm12 .145v2.855h-16v-12h6.598c.768-.787 1.561-1.449 2.339-2h-10.937v16h20v-6.769l-2 1.914z"/></svg>
                    <svg @click="(e) => onRemove(e, 'self', pattern.name)" class="pointer remove" :id="'remove/'+pattern.patternId" width="24" height="24" xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd" clip-rule="evenodd"><path d="M19 24h-14c-1.104 0-2-.896-2-2v-16h18v16c0 1.104-.896 2-2 2m-9-14c0-.552-.448-1-1-1s-1 .448-1 1v9c0 .552.448 1 1 1s1-.448 1-1v-9zm6 0c0-.552-.448-1-1-1s-1 .448-1 1v9c0 .552.448 1 1 1s1-.448 1-1v-9zm6-5h-20v-2h6v-1.5c0-.827.673-1.5 1.5-1.5h5c.825 0 1.5.671 1.5 1.5v1.5h6v2zm-12-2h4v-1h-4v1z"/></svg>
                </div>
            </li>
        </ul>
        <br />
        <h4>Create new canvas</h4>
        <form @submit.prevent="createPattern">
            <div class="mb-3">
                <label for="name" class="form-label">Pattern name</label>
                <input type="text" class="form-control" id="name" name="name">
            </div>
            <button type="submit" class="btn btn-primary">Create</button>
        </form>
    </div>
    
</template>

<style scoped>

.pointer {
    cursor: pointer;
}
</style>