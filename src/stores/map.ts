import { defineStore } from 'pinia'
import type { Pixel } from './pixel';

export type Map = { width: number, pixels: Pixel[] };

export const useMapStore = defineStore({
  id: 'map',
  state: () => ({
    map: {
      width: 0,
      pixels: []
    } as Map
  }),
  getters: {
    width: (state) => state.map.width,
    pixels: (state) => state.map.pixels
  },
  actions: {
    setWidth(width: number) {
      this.map.width = width;
    },
    setMap(pixels: []) {
      this.map.pixels = pixels;
    },
    addPixel(pixel: Pixel) {
      this.map.pixels.push(pixel);
    },
  }
})
