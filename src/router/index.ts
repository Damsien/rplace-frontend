import { createRouter, createWebHistory } from 'vue-router'
import Place from '../views/Place.vue';
import Login from '../views/Login.vue';
import User from '../views/User.vue';
import Pattern from '../views/Pattern.vue';
import PatternList from '../views/PatternList.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'place',
      component: Place
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
    },
    {
      path: '/pattern',
      name: 'pattern-add',
      component: Pattern
    },
    {
      path: '/pattern/:id',
      name: 'pattern-edit',
      component: Pattern
    },
    {
      path: '/pattern-list',
      name: 'pattern-list',
      component: PatternList
    }
  ]
})

export default router
