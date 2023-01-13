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
      beforeEnter: (to, from) => {
        if (to.query['link'] && to.query['link'] != '/') {
          let isLogin = `?login=${to.query['login']}` ?? ''
          router.push(to.query['link']+isLogin)
        }
        return true;
      },
      path: '/',
      name: 'place',
      component: Place
    },
    {
      beforeEnter: (to, from) => {
        if (localStorage.getItem('ACCESS_TOKEN')) {
          router.push(localStorage.getItem('before-log') ?? '/');
        }
        return true;
      },
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
  if (!to.fullPath.includes('login')) {
    localStorage.setItem('before-log', to.fullPath);
    if (to.query['canva']) {
      localStorage.setItem('before-log', to.path+'/canva/'+to.query['canva']);
    }
  } else {
    if (to.query['link']) {
      localStorage.setItem('before-log', to.query['link']);
    }
    to.fullPath = `/login?link=${localStorage.getItem('before-log') ?? ''}`
  }
  return true
})

export default router;