import { defineStore } from 'pinia'

export type Map = { width: number };

export const useMapStore = defineStore({
  id: 'map',
  state: () => ({
    map: {
      width: 0
    } as Map
  }),
  getters: {
    width: (state) => state.map.width
  },
  actions: {
    setWidth(width: number) {
      this.map.width = width;
    }
  }
})
