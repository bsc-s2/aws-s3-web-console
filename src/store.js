import Vue from 'vue'
import Vuex from 'vuex'
import moment from 'moment'
import { handler } from './service/aws'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    token: sessionStorage.getItem('token') || '',
    keys: JSON.parse(sessionStorage.getItem('keys')) || {},
    bucketList: [],
    buckets: {},
    uploadFileList: [],
  },
  actions: {
    setKeys({ commit }, keys) {
      commit('SET_KEYS', keys)
    },
    async getBuckets(
      { commit, state },
      { isForceUpdate = false, isGetList = true },
    ) {
      const buckets =
        Object.keys(state.buckets).length === 0 || isForceUpdate
          ? await handler('listBuckets')
          : state.buckets
      const result = isRetrunList(buckets, isGetList)
      commit('SET_VALUES', result)
      return result
    },
    setValues({ commit }, state) {
      commit('SET_VALUES', state)
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
    uploading_file(state) {
      return state.uploadFileList.filter((file) => file.state === 'uploading')
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
