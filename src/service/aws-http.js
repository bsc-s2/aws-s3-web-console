import { Message } from 'element-ui'
import store from '@/store'

let host = 'http://111.62.6.198:8080/'

function parseJson(response) {
  return response.json().then((data) => {
    return {
      status: response.status,
      data,
    }
  })
}

function post(url, params) {
  try {
    return new Promise((resolve, reject) => {
      fetch(host + url, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: store.state.token || '',
        },
        method: 'post',
        body: JSON.stringify(params),
      })
        .then(parseJson)
        .then(({ status, data }) => {
          if (status === 200) {
            return resolve(data)
          } else {
            Message.error({ message: `Error: ${status} - ${data.message}` })
            return reject(status, data)
          }
        })
    })
  } catch (e) {
    return Promise.reject(e)
  }
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
