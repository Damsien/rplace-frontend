import { defineStore } from 'pinia'
import type { Pixel } from './pixel';

export type Pattern = { pixels: [], isPatternSet: boolean, currentPatternId: string };

export const usePatternStore = defineStore({
  id: 'pattern',
  state: () => ({
    pattern: {
      isPatternSet: false,
      pixels: [],
      currentPatternId: ''
    } as Pattern
  }),
  getters: {
    pixels: (state) => state.pattern.pixels,
    isPatternSet: (state) => state.pattern.isPatternSet,
    currentPatternId: (state) => state.pattern.currentPatternId
  },
  actions: {
    setPixels(pixels: []) {
      this.pattern.pixels = pixels;
    },
    setIsPatternSet(unset: boolean) {
      this.pattern.isPatternSet = unset;
    },
    setCurrentPatternId(id: string) {
      this.pattern.currentPatternId = id;
    }
  }
})
