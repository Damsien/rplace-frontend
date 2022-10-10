import { defineStore } from 'pinia'

export type Patterns = { self: [], bind: [] };

export const usePatternsStore = defineStore({
  id: 'patterns',
  state: () => ({
    _patterns: {
        self: [],
        bind: []
    } as Patterns
  }),
  getters: {
    self: (state) => state._patterns.self,
    bind: (state) => state._patterns.bind
  },
  actions: {
    setPatterns(patterns: {self: [], bind: []}) {
      this._patterns.self = patterns.self;
      this._patterns.bind = patterns.bind;
    }
  }
})
