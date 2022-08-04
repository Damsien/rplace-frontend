import { defineStore } from 'pinia';

export type Pixel = {
    coord_x: number;
    coord_y: number;
    color: string;
    user: string;
    date: Date;
};

export const usePixelStore = defineStore({
  id: 'pixel',
  state: () => ({
    _pixel: {
      coord_x: 0,
      coord_y: 0,
      color: 'white',
      user: 'game',
      date: new Date()
    } as Pixel
  }),
  getters: {
    pixel: (state) => state._pixel
  },
  actions: {
    setPixel(pixel: Pixel) {
      this._pixel = pixel;
    }
  }
})