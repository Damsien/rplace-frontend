import { createRouter, createWebHistory } from 'vue-router'
import PlaceView from '../views/PlaceView.vue';
import Login from '../views/Login.vue';
import User from '../views/User.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'place',
      component: PlaceView
    },
    {
      path: '/login',
      name: 'login',
      component: Login
    },
    {
      path: '/user',
      name: 'user',
      component: User
    }
  ]
})

export default router
