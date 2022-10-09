import { defineStore } from 'pinia'
import type { Pixel } from './pixel';

export type Pattern = { pixels: [], isPatternUnset: boolean };

export const usePatternStore = defineStore({
  id: 'pattern',
  state: () => ({
    pattern: {
      isPatternUnset: false,
      pixels: []
    } as Pattern
  }),
  getters: {
    pixels: (state) => state.pattern.pixels,
    isPatternUnset: (state) => state.pattern.isPatternUnset
  },
  actions: {
    setPixels(pixels: []) {
      this.pattern.pixels = pixels;
    },
    setIsPatternUnset(unset: boolean) {
      this.pattern.isPatternUnset = unset;
    }
  }
})
