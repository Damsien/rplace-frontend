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
      component: Place,
      beforeEnter: (to, from, next) => {
          const uri = to.query.uri?.toString();
          if (uri != undefined && uri != null && uri != '/' && !uri.includes('login')) {
              next(false);
              localStorage.setItem('before-log', uri);
              router.push(uri);
          } else {
              next();
          }
      }
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

export default router;