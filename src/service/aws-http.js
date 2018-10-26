import { Message } from 'element-ui'

let host = ''

function post(params) {
  return fetch(host, {
    method: 'post',
    params,
  })
}

function login(params) {
  host = params.host
  return post(params)
}

function handler(func, params) {
  if (host === '') {
    Message.error({ message: 'no host' })
    return
  }

  return post(params)
}

export { login, handler }
