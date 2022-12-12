import { defineStore } from 'pinia';

export type Pixel = {
    coord_x: number;
    coord_y: number;
    color: string;
    user: string;
    date: Date;
    isSticked: boolean;
    isUserGold: boolean;
};

export const usePixelStore = defineStore({
  id: 'pixel',
  state: () => ({
    _pixel: {
      coord_x: 0,
      coord_y: 0,
      color: '',
      user: '',
      date: new Date(),
      isSticked: false,
      isUserGold: false
    } as Pixel
  }),
  getters: {
    pixel: (state) => state._pixel,
    user: (state) => {
      if (state._pixel.user === undefined) {
        return '';
      } else {
        return state._pixel.user.split('.')[0]+'-'+state._pixel.user.split('.')[1];
      }
    }
  },
  actions: {
    setCoords(x: number, y: number) {
      this._pixel.coord_x = x;
      this._pixel.coord_y = y;
    },
    setPixel(pixel: Pixel) {
      this._pixel = pixel;
    },
    setUser(user: string) {
      this._pixel.user = user;
      console.log(this._pixel.user);
    },
    setIsSticked(isSticked: boolean) {
      this._pixel.isSticked = isSticked;
    },
    setIsUserGold(isUserGold: boolean) {
      this._pixel.isUserGold = isUserGold;
    }
  }
})