import { defineStore } from 'pinia';

export type Step = {
    name: string;
    pixels: number;
    description: string;
    img: string;
};

export type User = {
    pixelsPlaced: number;
    isGold: boolean;
    rank: number;
    bombs: number;
    stickedPixels: number;
    pscope: string;
    username: string;
    favColor: string;
    steps: Step[];
    group: string;
    groupRank: number;
    secondFavColor: string;
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
      favColor: '',
      steps: [],
      group: '',
      groupRank: 100,
      secondFavColor: ''
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
    },
    clearSteps() {
        this._user.steps = [];
    },
    addStep(step: Step) {
        this._user.steps.push(step);
    },
    setGroup(group: string) {
        this._user.group = group;
    },
    setGroupRank(rank: number) {
        this._user.groupRank = rank;
    },
    setSecondFavColor(color: string) {
        this._user.secondFavColor = color
    },
    clearUser() {
        this._user = {
            pixelsPlaced: 0,
            isGold: false,
            rank: 100,
            bombs: 0,
            stickedPixels: 0,
            pscope: '',
            username: '',
            favColor: '',
            steps: [],
            group: '',
            groupRank: 100,
            secondFavColor: ''
        } as User
    }
  }
})
