import { refreshToken } from "@/auth";
import axios from "axios";
import router from ".";

const http = axios.create();

http.interceptors.response.use(undefined, async function (err) {
  console.log(err)
  if (err.response.status == 401) {
    if(!await refreshToken()) {
      localStorage.clear();
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