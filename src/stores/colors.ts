import { defineStore } from 'pinia'

export type Color = { name: string; hex: string, isColorUser: boolean };

export const useColorsStore = defineStore({
  id: 'colors',
  state: () => ({
    _colors: [] as Color[]
  }),
  getters: {
    colors: (state) => state._colors,
    color: (state) => {
      return (name: string) => <Color>state._colors.find((el) => el.name === name);
    }
  },
  actions: {
    addColor(color: Color) {
      this._colors.push(color);
    },
    setColors(colors: Color[]) {
      this._colors = colors;
    },
    clearColors() {
      this._colors = [];
    },
    clearColorsGame() {
      const copyColors = this._colors;
      this.clearColors();
      for (let color of copyColors) {
        if (color.isColorUser === true) {
          this.addColor(color);
        }
      }
    },
    addColorGame(color: Color) {
      let copyColors: Color[] = [];
      for (let i=0; i<this._colors.length; i++) {
        let color = this._colors[i];
        if (color.isColorUser === true) {
          copyColors.push(color);
          this._colors.splice(i, 1);
          i--;
        }
      }
      this.addColor(color);
      this._colors.push(...copyColors);
    }
  }
})