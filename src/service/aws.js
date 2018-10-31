import { Message } from 'element-ui'
import AWS from 'aws-sdk'
import store from '@/store'

let awsKey = {}

export const clear = () => (awsKey = {})

export const getKey = async () => {
  awsKey = store.state.keys
  return awsKey
}

export const config = async ({ timeout = 10000, s3ForcePathStyle }) => {
  let _key = Object.keys(awsKey).length > 0 ? awsKey : await getKey()
  AWS.config.update({
    accessKeyId: _key.accesskey,
    secretAccessKey: _key.secretkey,
  })
  AWS.config.region = _key.region
  AWS.config.httpOptions = { timeout: timeout }
  AWS.config.endpoint = _key.host
  AWS.config.s3ForcePathStyle = s3ForcePathStyle
}

export const getS3 = async ({
  timeout = 10000,
  s3ForcePathStyle = true,
} = {}) => {
  await config({ timeout, s3ForcePathStyle })
  return new AWS.S3()
}

export const handler = async (
  method,
  params = '',
  s3ForcePathStyle = true,
  timeout = 10000,
) => {
  try {
    const s3 = await getS3({ timeout, s3ForcePathStyle })
    return new Promise((resolve, reject) =>
      s3[method](params, (error, data) => {
        error && Message.error({ message: error.message })
        return error ? reject(error) : resolve(data)
      }),
    )
  } catch (error) {
    Message.error({ message: error.message })
    return Promise.reject(error)
  }
}
