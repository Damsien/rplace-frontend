import { defineStore } from 'pinia'

export type Patterns = { self: [], bind: [], wantDeleteName: string, wantDeleteId: string };

export const usePatternsStore = defineStore({
  id: 'patterns',
  state: () => ({
    _patterns: {
        self: [],
        bind: [],
        wantDeleteName: '',
        wantDeleteId: ''
    } as Patterns
  }),
  getters: {
    self: (state) => state._patterns.self,
    bind: (state) => state._patterns.bind,
    deleteName: (state) => state._patterns.wantDeleteName,
    deleteId: (state) => state._patterns.wantDeleteId
  },
  actions: {
    setPatterns(patterns: {self: [], bind: []}) {
      this._patterns.self = patterns.self;
      this._patterns.bind = patterns.bind;
    },
    setDeleteName(wantDelete: string) {
      this._patterns.wantDeleteName = wantDelete;
    },
    setDeleteId(wantDelete: string) {
      this._patterns.wantDeleteId = wantDelete;
    }
  }
})
