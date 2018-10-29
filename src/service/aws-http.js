let host = 'http://127.0.0.1:7001/'

function post(url, params) {
  return fetch(host + url, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    method: 'post',
    body: JSON.stringify(params),
  })
}

function login(params) {
  return post('login', params)
}

function handler(params) {
  return post('handler', params)
}

export { login, handler }
