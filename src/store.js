import Vue from 'vue'
import Vuex from 'vuex'
import moment from 'moment'
import { handler } from './service/aws'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    keys: JSON.parse(sessionStorage.getItem('keys')) || {},
    bucketList: [],
    buckets: {},
  },
  actions: {
    setKeys({ commit }, keys) {
      commit('SET_KEYS', keys)
    },
    async getBuckets(
      { commit, state },
      { isForceUpdate = false, isGetList = true },
    ) {
      if (Object.keys(state.buckets).length === 0 || isForceUpdate) {
        let buckets = await handler('listBuckets')
        const result = isRetrunList(buckets, isGetList)
        commit('SET_VALUES', result)
        return result
      } else {
        return isGetList ? state.bucketList : state.buckets
      }
    },
  },
  mutations: {
    SET_KEYS(state, keys) {
      sessionStorage.setItem('keys', JSON.stringify(keys))
      state.keys = keys
    },
    SET_VALUES(state, data) {
      const _state = Object.assign(state, data)
      state = _state
    },
  },
  getters: {
    hasKeys(state) {
      return Object.keys(state.keys).length > 0
    },
  },
})

function isRetrunList(buckets, isGetList) {
  if (isGetList) {
    const list = [...buckets.Buckets]
    list.forEach((item) => {
      item.CreationDate = moment(item.CreationDate).format('YYYY-MM-DD HH:mm')
    })
    return { bucketList: list }
  } else {
    return { buckets: buckets }
  }
}
