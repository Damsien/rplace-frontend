import { defineStore } from 'pinia'

export type Patterns = { patterns: [] };

export const usePatternsStore = defineStore({
  id: 'patterns',
  state: () => ({
    _patterns: {
        patterns: []
    } as Patterns
  }),
  getters: {
    patterns: (state) => state._patterns.patterns
  },
  actions: {
    setPatterns(patterns: []) {
      this._patterns.patterns = patterns;
    },

  }
})
