import { createRouter, createWebHistory } from 'vue-router'
// @ts-ignore
import Place from '../views/Place.vue';
// @ts-ignore
import Login from '../views/Login.vue';
// @ts-ignore
import User from '../views/User.vue';
// @ts-ignore
import Pattern from '../views/Pattern.vue';
// @ts-ignore
import PatternList from '../views/PatternList.vue';
// @ts-ignore
import Info from '../views/Info.vue';

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
      path: '/user/:id',
      name: 'other-user',
      component: User
    },
    {
      path: '/pattern/:id',
      name: 'pattern',
      component: Pattern
    },
    {
      path: '/pattern-list',
      name: 'pattern-list',
      component: PatternList
    },
    {
      path: '/info',
      name: 'info',
      component: Info
    },
    {
      path: '/canva/:id',
      name: 'canva',
      component: Place
    }
  ]
})

router.beforeEach((to, from) => {
  const path = to.fullPath;
  if (!path.includes('login')) {
    localStorage.setItem('before-log', to.fullPath);
  }
  return true
})

export default router;