import { defineStore } from 'pinia'
import type { Pixel } from './pixel';

export type Pattern = { pixels: [] };

export const usePatternStore = defineStore({
  id: 'pattern',
  state: () => ({
    pattern: {
      pixels: []
    } as Pattern
  }),
  getters: {
    pixels: (state) => state.pattern.pixels
  },
  actions: {
    setPixels(pixels: []) {
      this.pattern.pixels = pixels;
    },

  }
})
