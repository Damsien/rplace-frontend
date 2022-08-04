import { defineStore } from 'pinia';

export type Timer = { timer: number; timeleft: number };

export const useTimerStore = defineStore({
  id: 'timer',
  state: () => ({
    _timer: {
      timer: 60,
      timeleft: 60,
    } as Timer
  }),
  getters: {
    timer: (state) => state._timer.timer,
    timeleft: (state) => state._timer.timeleft,
  },
  actions: {
    setTimer(timer: number) {
      this._timer.timer = timer;
    },
    setTimeleft(timeleft: number) {
      this._timer.timeleft = timeleft;
    }
  }
})