import { createApp } from 'vue'
import { createPinia } from 'pinia'
// @ts-ignore
import $ from 'jquery';

// @ts-ignore
import App from './App.vue'
import router from './router'

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap/dist/js/bootstrap.js'

import './assets/main.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
