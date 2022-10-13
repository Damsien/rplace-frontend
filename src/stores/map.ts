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
    editPixel(pixel: Pixel) {
      const index = this.map.pixels.findIndex(
        (el) => el.coord_x == pixel.coord_x && el.coord_y == pixel.coord_y
      );
      this.map.pixels[index] = pixel;
    }
  }
})
