import { defineStore } from 'pinia'

export const useUserStore  = defineStore('UserStore', {
  state: () => {
    return {
      walletAddress: ""
    }
  },
  getters: {
    smallAddress: (state) => {return state.walletAddress.substring(0, 6) + "..." + state.walletAddress.substring(38)},
    isConnected: (state) => {return state.walletAddress.length > 0},
  },
  actions: {
  },
})