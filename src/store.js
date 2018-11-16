import Vue from 'vue'
import Vuex from 'vuex'
import moment from 'moment'
import { handler } from './service/aws-http'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    keys: JSON.parse(sessionStorage.getItem('keys')) || {},
    buckets: {},
    uploadFileList: [],
  },
  actions: {
    setValueWithStorage({ commit }, data) {
      commit('SET_KEYS', data)
    },
    async getBuckets({ commit, state }, isForceUpdate = false) {
      const buckets =
        Object.keys(state.buckets).length === 0 || isForceUpdate
          ? await handler('listBuckets')
          : state.buckets
      commit('SET_VALUES', { buckets })
      return buckets
    },
    setValues({ commit }, state) {
      commit('SET_VALUES', state)
    },
  },
  mutations: {
    SET_KEYS(state, data) {
      const keys = Object.keys(data)
      keys.length > 0 &&
        keys.forEach((key) => {
          sessionStorage.setItem(key, JSON.stringify(data[key]))
          state[key] = data[key]
        })
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
    getBucketList(state) {
      return state.buckets.Buckets && state.buckets.Buckets.length > 0
        ? isRetrunList(state.buckets)
        : []
    },
    uploading_file(state) {
      return state.uploadFileList.filter((file) => file.state === 'uploading')
    },
  },
})

function isRetrunList(buckets) {
  const list = [...buckets.Buckets]
  list.forEach((item) => {
    item.CreationDate = moment(item.CreationDate).format('YYYY-MM-DD HH:mm')
  })
  return list
}
