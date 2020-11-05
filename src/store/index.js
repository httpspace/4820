import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    Profile: {
      name: '馬力歐',
      id: '123',
      locale: 'zh_TW',
      photo: 'images.jpg'
    },
  },
  mutations: {
    setProfile(state, config) {
      state.Profile = config;
    },
  },
  actions: {
    SET_PROFILE({
      commit
    }, config) {
      commit('setProfile', config)
    },
  },
  modules: {},
  getters: {
    Profile(state) {
      return state.Profile
    }
  }
})