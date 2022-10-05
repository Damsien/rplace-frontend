import { defineStore } from 'pinia';

export type User = {
    pixelsPlaced: number;
    isGold: boolean;
    rank: number;
    bombs: number;
    stickedPixels: number;
};

export const useUserStore = defineStore({
  id: 'user',
  state: () => ({
    _user: {
      pixelsPlaced: 0,
      isGold: false,
      rank: 100,
      bombs: 0,
      stickedPixels: 0
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
    }
  }
})