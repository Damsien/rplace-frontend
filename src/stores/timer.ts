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
    minute: (state) => Math.floor(state._timer.timeleft/60),
    second: (state) => {
      let decimal = state._timer.timeleft/60 - Math.floor(state._timer.timeleft/60);
      let seconds = ((decimal*100) * 60) / 100;
      return Math.ceil(seconds);
    }
  },
  actions: {
    setTimer(timer: number) {
      this._timer.timeleft <= (this._timer.timer - timer) ? this._timer.timeleft = 0 : this._timer.timeleft -= (this._timer.timer - timer);
      this._timer.timer = timer < 0 ? 0 : timer;
    },
    setTimeleft(timeleft: number) {
      this._timer.timeleft = timeleft < 0 ? 0 : timeleft;
    }
  }
})