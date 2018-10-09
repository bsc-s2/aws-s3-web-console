import Vue from 'vue'
import Vuex from 'vuex'
import { handler } from './service/aws'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    keys: sessionStorage.getItem('keys') || {},
    buckets: {},
  },
  actions: {
    setKeys({ commit }, keys) {
      commit('SET_KEYS', keys)
    },
    async getBuckets({ commit, state }, forceUpdate = false) {
      if (Object.keys(state.buckets).length === 0 || forceUpdate) {
        let buckets = await handler('listBuckets')
        commit('SET_VALUES', { buckets: buckets })
        return buckets
      } else {
        return state.buckets
      }
    },
  },
  mutations: {
    SET_KEYS(state, keys) {
      sessionStorage.setItem('keys', keys)
      state.keys = keys
    },
    SET_VALUES(state, data) {
      const _state = Object.assign(state, data)
      state = _state
    },
  },
})
