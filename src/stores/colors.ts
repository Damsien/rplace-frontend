import { defineStore } from 'pinia'

export type Color = { name: string; hex: string };

export const useColorsStore = defineStore({
  id: 'colors',
  state: () => ({
    _colors: [] as Color[]
  }),
  getters: {
    colors: (state) => state._colors
  },
  actions: {
    addColor(color: Color) {
      this._colors.push(color);
    },
    setColors(colors: Color[]) {
      this._colors = colors;
    }
  }
})
