<template>
  <div>
    <el-upload class="upload-demo"
               drag
               action="/"
               :http-request="upload"
               :on-remove="handleRemove"
               :before-remove="beforeRemove"
               multiple>
      <i class="el-icon-upload"></i>
      <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
      <div class="el-upload__tip"
           slot="tip">只能上传jpg/png文件，且不超过500kb</div>
    </el-upload>
  </div>
</template>
<script>
import { getS3 } from '@/service/aws'
import moment from 'moment'
import { xmlFetch } from '@/service/util'
export default {
  name: 'Upload',
  props: {
    bucket: {
      type: String,
      required: true,
    },
    prefix: {
      type: String,
      default: '',
    },
    aclType: {
      type: String,
      default: 'public-read',
    },
    checkFileType: {
      type: Boolean,
      default: false,
    },
    validation: {
      type: RegExp,
    },
    multiple: {
      type: Boolean,
      default: true,
    },
    showUploadList: {
      type: Boolean,
      default: true,
    },
    accept: {
      type: String,
    },
    validateMessage: {
      type: String,
    },
  },
  data() {
    return {
      fileList: [],
      url: '/',
    }
  },
  methods: {
    async upload(props) {
      const params = {
        ACL: this.aclType,
        Bucket: this.bucket,
        Key: this.prefix + props.file.name,
        ContentType: props.file.type,
        Body: props.file,
      }
      const aws = await getS3({ timeout: 3600000 })
      const url = aws.getSignedUrl('putObject', params)

      return xmlFetch(
        url,
        {
          method: 'PUT',
          headers: {
            'Content-Type': props.file.type,
            'x-amz-acl': 'public-read',
          },
          body: props.file,
        },
        this.onProgress(props.file)
      )
        .then(this.onSuccess, this.onError)
        .catch((err) => {
          this.onError(err)
        })
    },
    beforeRemove(file) {
      return this.$confirm(`确定移除 ${file.name}？`)
    },
    onSuccess(res) {
      console.log(res)
    },
    onError(err) {
      console.error(err)
    },
    onProgress(e, file) {
      file.status = 'uploading'
      file.percentage = e.loaded / e.total * 100
      console.log(file.percentage)
    },
  },
}
</script>
