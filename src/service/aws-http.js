import store from '@/store'

let host = 'http://47.75.196.0:8080/'

function post(url, params) {
  return fetch(host + url, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: store.state.token || '',
    },
    method: 'post',
    body: JSON.stringify(params),
  }).then((res) => {
    return res.json()
  })
}

function login(params) {
  return post('login', params)
}

function handler(method, params) {
  return post('handler', {
    method,
    params,
  })
}

export { login, handler }
