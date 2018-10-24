<template>
  <div>
    <el-upload class="upload"
               drag
               action="/"
               :http-request="upload"
               :before-remove="beforeRemove"
               multiple>
      <i class="el-icon-upload"></i>
      <div class="el-upload__text"><em>Click</em> or drag the file here to upload</div>
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

      return fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': props.file.type,
          'x-amz-acl': 'public-read',
        },
        body: props.file,
      })
        .then(this.onSuccess(params.Key))
        .catch((err) => {
          this.onError(err)
        })
    },
    beforeRemove(file) {
      return this.$confirm(`确定移除 ${file.name}？`)
    },
    onSuccess(res) {
      this.$notify({
        type: 'success',
        message: `${res} 上传成功`,
      })
    },
    onError(res) {
      this.$notify({
        type: 'error',
        message: `${res} 上传成功`,
      })
    },
  },
}
</script>
<style lang="less">
.el-upload-dragger {
  width: 560px;
}
</style>
