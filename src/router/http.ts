import { refreshToken } from "@/auth";
import axios from "axios";
import path from "path";
import router from ".";
import { updateHeaders } from '@/App.vue';

const http = axios.create();

http.interceptors.request.use(function (config) {
  console.log('local storaaage')
  // console.log(localStorage.getItem('ACCESS_TOKEN'))
  updateHeaders()
  // config.headers['Authorization'] = `Bearer ${localStorage.getItem('ACCESS_TOKEN')}`;
  return config;
});

http.interceptors.response.use(undefined, async function (err) {
  if (err.response.status == 401) {
    if(!await refreshToken()) {
      // router.push('/login?redirect=401');
      if (err.config.url.includes('login')) {
        router.push('/login?redirect=bad_cred');
      } else {
        router.push('/login');
      }
    } else {
      window.location.reload();
    }
  }

  if (err.response.status == 403) {
    router.push('/login?redirect=forbidden');
  }
});

export default http;