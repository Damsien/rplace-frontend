import { refreshToken } from "@/auth";
import axios from "axios";
import router from ".";

const http = axios.create();

http.interceptors.response.use(undefined, async function (err) {
  if (err.response.status == 401) {
    if(!await refreshToken()) {
      router.push('/login');
    } else {
      window.location.reload();
    }
  }
});

export default http;