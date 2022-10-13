import { defineStore } from 'pinia';

export type User = {
    pixelsPlaced: number;
    isGold: boolean;
    rank: number;
    bombs: number;
    stickedPixels: number;
    pscope: string;
    username: string;
    favColor: string;
};

export const useUserStore = defineStore({
  id: 'user',
  state: () => ({
    _user: {
      pixelsPlaced: 0,
      isGold: false,
      rank: 100,
      bombs: 0,
      stickedPixels: 0,
      pscope: '',
      username: '',
      favColor: ''
    } as User
  }),
  getters: {
    user: (state) => state._user
  },
  actions: {
    setUser(user: User) {
      this._user = user;
    },
    setIsGold(isGold: boolean) {
        this._user.isGold = isGold;
    },
    setRank(rank: number) {
        this._user.rank = rank;
    },
    setBombs(bombs: number) {
        this._user.bombs = bombs;
    },
    setPixelsPlaced(pixelsPlaced: number) {
        this._user.pixelsPlaced = pixelsPlaced;
    },
    setStickedPixels(stickedPixels: number) {
        this._user.stickedPixels = stickedPixels;
    },
    setPscope(pscope: string) {
        this._user.pscope = pscope
    },
    setUsername(username: string) {
        this._user.username = username;
    },
    setFavColor(color: string) {
        this._user.favColor = color;
    }
  }
})