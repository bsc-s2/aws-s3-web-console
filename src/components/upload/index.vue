<script>
import UploadList from './upload-list'
import Upload from './upload'
import { Progress } from 'element-ui'
import Migrating from 'element-ui/src/mixins/migrating'

function noop() {}

export default {
  name: 'ElUpload',

  mixins: [Migrating],

  components: {
    Progress,
    UploadList,
    Upload,
  },

  provide() {
    return {
      uploader: this,
    }
  },

  inject: {
    elForm: {
      default: '',
    },
  },

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
    listMode: {
      type: Boolean,
      default: false,
    },
    multiple: Boolean,
    drag: Boolean,
    dragger: Boolean,
    withCredentials: Boolean,
    showFileList: {
      type: Boolean,
      default: true,
    },
    accept: String,
    type: {
      type: String,
      default: 'select',
    },
    beforeUpload: Function,
    beforeRemove: Function,
    onRemove: {
      type: Function,
      default: noop,
    },
    onChange: {
      type: Function,
      default: noop,
    },
    onPreview: {
      type: Function,
    },
    onSuccess: {
      type: Function,
      default: noop,
    },
    onProgress: {
      type: Function,
      default: noop,
    },
    onError: {
      type: Function,
      default: noop,
    },
    fileList: {
      type: Array,
      default() {
        return []
      },
    },
    autoUpload: {
      type: Boolean,
      default: true,
    },
    listType: {
      type: String,
      default: 'text', // text,picture,picture-card
    },
    httpRequest: Function,
    disabled: Boolean,
    limit: Number,
    onExceed: {
      type: Function,
      default: noop,
    },
  },

  data() {
    return {
      uploadFiles: [],
      dragOver: false,
      draging: false,
      tempIndex: 1,
    }
  },

  computed: {
    uploadDisabled() {
      return this.disabled || (this.elForm || {}).disabled
    },
  },

  watch: {
    fileList: {
      immediate: true,
      handler(fileList) {
        this.uploadFiles = fileList.map((item) => {
          item.uid = item.uid || Date.now() + this.tempIndex++
          item.status = item.status || 'success'
          return item
        })
      },
    },
    uploadFiles: {
      handler: function(val) {
        !this.listMode && this.setStore(val)
      },
      deep: true,
      immediate: true,
    },
  },

  methods: {
    handleStart(rawFile) {
      rawFile.uid = Date.now() + this.tempIndex++
      let file = {
        status: 'ready',
        name: rawFile.name,
        size: rawFile.size,
        bucket: this.bucket,
        prefix: this.prefix,
        percentage: 0,
        uid: rawFile.uid,
        raw: rawFile,
      }

      if (this.listType === 'picture-card' || this.listType === 'picture') {
        try {
          file.url = URL.createObjectURL(rawFile)
        } catch (e) {
          this.$notify.error(e)
          return
        }
      }
      this.uploadFiles.push(file)
      this.onChange(file, this.uploadFiles)
    },
    handleProgress(ev, rawFile) {
      const file = this.getFile(rawFile)
      this.onProgress(ev, file, this.uploadFiles)
      file.status = 'uploading'
      file.percentage = ev.percent || 0
    },
    handleSuccess(res, rawFile) {
      const file = this.getFile(rawFile)

      if (file) {
        file.status = 'success'
        file.response = res

        this.onSuccess(file, this.uploadFiles)
        this.onChange(file, this.uploadFiles)
      }
    },
    handleError(err, rawFile) {
      const file = this.getFile(rawFile)
      const fileList = this.uploadFiles

      file.status = 'fail'

      fileList.splice(fileList.indexOf(file), 1)

      this.onError(err, file, this.uploadFiles)
      this.onChange(file, this.uploadFiles)
    },
    handleRemove(file, raw) {
      if (raw) {
        file = this.getFile(raw)
      }
      let doRemove = () => {
        this.abort(file)
        let fileList = this.uploadFiles
        fileList.splice(fileList.indexOf(file), 1)
        this.onRemove(file, fileList)
      }

      if (!this.beforeRemove) {
        doRemove()
      } else if (typeof this.beforeRemove === 'function') {
        const before = this.beforeRemove(file, this.uploadFiles)
        if (before && before.then) {
          before.then(() => {
            doRemove()
          }, noop)
        } else if (before !== false) {
          doRemove()
        }
      }
    },
    getFile(rawFile) {
      let fileList = this.uploadFiles
      let target
      fileList.every((item) => {
        target = rawFile.uid === item.uid ? item : null
        return !target
      })
      return target
    },
    abort(file) {
      this.$refs['upload-inner'].abort(file)
    },
    clearFiles() {
      this.uploadFiles = []
    },
    submit() {
      this.uploadFiles
        .filter((file) => file.status === 'ready')
        .forEach((file) => {
          this.$refs['upload-inner'].upload(file.raw)
        })
    },
    setStore(val) {
      this.$store.dispatch('setValues', {
        uploadFileList: val,
      })
    },
  },

  beforeDestroy() {
    this.uploadFiles.forEach((file) => {
      if (file.url && file.url.indexOf('blob:') === 0) {
        URL.revokeObjectURL(file.url)
      }
    })
  },

  render(h) {
    let uploadList

    if (this.showFileList) {
      uploadList = (
        <UploadList
          disabled={this.uploadDisabled}
          listType={this.listType}
          files={this.uploadFiles}
          on-remove={this.handleRemove}
          handlePreview={this.onPreview}
        />
      )
    }

    const uploadData = {
      props: {
        bucket: this.bucket,
        prefix: this.prefix,
        aclType: this.aclType,
        type: this.type,
        drag: this.drag,
        multiple: this.multiple,
        'before-upload': this.beforeUpload,
        'with-credentials': this.withCredentials,
        fileList: this.uploadFiles,
        autoUpload: this.autoUpload,
        listType: this.listType,
        disabled: this.uploadDisabled,
        limit: this.limit,
        'on-exceed': this.onExceed,
        'on-start': this.handleStart,
        'on-progress': this.handleProgress,
        'on-success': this.handleSuccess,
        'on-error': this.handleError,
        'on-preview': this.onPreview,
        'on-remove': this.handleRemove,
        'http-request': this.httpRequest,
      },
      ref: 'upload-inner',
    }

    const trigger = this.$slots.trigger || this.$slots.default
    const uploadComponent = <upload {...uploadData}>{trigger}</upload>

    return (
      <div>
        {this.listMode ? (
          uploadList
        ) : (
          <div>
            {this.listType === 'picture-card' ? uploadList : ''}
            {this.$slots.trigger
              ? [uploadComponent, this.$slots.default]
              : uploadComponent}
            {this.$slots.tip}
            {this.listType !== 'picture-card' ? uploadList : ''}
          </div>
        )}
      </div>
    )
  },
}
</script>
