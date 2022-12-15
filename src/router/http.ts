import { refreshToken } from "@/auth";
import axios from "axios";
import path from "path";
import router from ".";

const http = axios.create();

http.interceptors.response.use(undefined, async function (err) {
  console.log(err)
  console.log(window.location)
  if (err.response.status == 401) {
    if(!await refreshToken()) {
      localStorage.clear();
      const pathname = window.location.pathname
      if (!pathname.includes('null') && !pathname.includes('login')) {
        localStorage.setItem('before-log', pathname);
      }
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
});

export default http;