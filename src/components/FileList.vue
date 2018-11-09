<template>
  <div class="file-list">
    <div class="actions-bar">
      <el-button type="primary"
                 size="small"
                 @click="dialogUploadVisible = true">Upload</el-button>
      <el-button type="primary"
                 @click="dialogNewFolderVisible = true"
                 size="small">New folder</el-button>
      <el-button type="danger"
                 :disabled="fileList.length === 0"
                 size="small">Delete</el-button>
      <el-autocomplete class="inline-input"
                       size="small"
                       suffix-icon="el-icon-search"
                       :fetch-suggestions="querySearch"
                       placeholder="Search files"
                       :trigger-on-focus="false"
                       @select="searchFile">
      </el-autocomplete>
    </div>
    <a download
       id="element-download"
       style="display:none">
      <span id="span-download"></span>
    </a>
    <el-table ref="multipleTable"
              stripe
              :height="tableHeight"
              highlight-current-row
              empty-text="No files"
              :data="fileList"
              v-loading="loading"
              tooltip-effect="dark">
      <el-table-column type="selection">
      </el-table-column>
      <el-table-column prop="Key"
                       label="Key"
                       show-overflow-tooltip>
      </el-table-column>
      <el-table-column prop="convertSize"
                       label="Size"
                       width="110">
      </el-table-column>
      <el-table-column prop="LastModified"
                       label="LastModified"
                       width="150">
      </el-table-column>
      <el-table-column label="Actions"
                       width="200">
        <template slot-scope="{ row }">
          <el-button type="text"
                     v-show="row.type === 'folder'"
                     @click="viewFolder(row)"
                     size="small">View</el-button>
          <el-button type="text"
                     v-show="row.type !== 'folder'"
                     @click="download(row)"
                     size="small">Download</el-button>
          <el-button type="text"
                     @click="deleteFile(row)"
                     size="small">Delete</el-button>
        </template>
      </el-table-column>
      <div v-if="nextMarker || makerArray.length"
           slot="append"
           class="append-row">
        <el-button size="small"
                   v-if="makerArray.length > 0"
                   @click="previousPage"
                   icon="el-icon-arrow-left">Before pages</el-button>
        <el-button v-if="nextMarker"
                   @click="nextPage"
                   size="small">Next pages <i class="el-icon-arrow-right"></i></el-button>
      </div>
    </el-table>
    <el-dialog title="Upload files"
               :visible.sync="dialogUploadVisible">
      <upload action="/"
              drag
              multiple
              :on-success="fileUploadSuccess"
              :on-remove="removeUploadFile"
              :bucket="bucket"
              :prefix="prefix">
        <i class="el-icon-upload"></i>
        <div class="el-upload__text">Drop file here or <em>click to upload</em></div>
      </upload>
    </el-dialog>
    <el-dialog title="New folder"
               :visible.sync="dialogNewFolderVisible">
      <el-form :model="folderForm">
        <el-form-item label="Folder name:"
                      label-width="100px">
          <el-input v-model="folderForm.name"
                    autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer"
           class="dialog-footer">
        <el-button @click="dialogNewFolderVisible = false">Cancel</el-button>
        <el-button type="primary"
                   @click="addFolder">Confirm</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import moment from 'moment'
import { handler } from '@/service/aws-http'
import { getS3 } from '@/service/aws'
import upload from './upload/index'
import {
  keyFilter,
  bytes,
  isImage,
  isFolder,
  repliceAllString,
  removeItemFromArray,
} from '@/service/util'
export default {
  name: 'FileList',
  data() {
    return {
      fileList: [],
      loading: false,
      nextMarker: '',
      searchValue: '',
      makerArray: [],
      folderForm: { name: '' },
      dialogNewFolderVisible: false,
      dialogUploadVisible: false,
    }
  },
  components: { upload },
  computed: {
    bucket() {
      return this.$route.params.prefix.split('/')[0]
    },
    prefix() {
      const prefixArray = repliceAllString(
        this.$route.params.prefix,
        '%2F',
        '/',
      ).split('/')
      prefixArray.shift()
      return prefixArray.length > 0 ? prefixArray.join('/') + '/' : ''
    },
    tableHeight() {
      const tableMaxHeight = document.querySelector('body').offsetHeight - 246
      const tableHeight =
        this.fileList.length > 0
          ? // table row's height = 57px & table padding total = 96px
            this.fileList.length * 57 + (this.fileList.length > 100 ? 154 : 96)
          : 205
      return tableHeight < tableMaxHeight ? tableHeight - 48 : tableMaxHeight
    },
  },
  created() {
    this.$root.Bus.$on('clickUpload', () => {
      this.dialogUploadVisible = true
    })
  },
  mounted() {
    this.getData()
  },
  methods: {
    async getData(nextMarker, searchValue = '') {
      try {
        this.loading = true
        let self = this
        let res = await handler('listObjects', {
          Bucket: this.bucket,
          Delimiter: '/',
          MaxKeys: 100,
          Marker: nextMarker || this.prefix,
          Prefix: this.prefix + searchValue,
        })
        this.nextMarker = res.NextMarker
        this.fileList = res.CommonPrefixes.map((foler) => {
          foler.Key = keyFilter(foler.Prefix, self.prefix)
          foler.type = 'folder'
          foler.LastModified = ''
          foler.convertSize = ''
          return foler
        }).concat(
          res.Contents.map((item) => {
            item.Key = keyFilter(item.Key, self.prefix)
            item.convertSize = bytes(item.Size)
            item.type = 'file'
            item.isImage = isImage(item)
            item.LastModified = moment(item.LastModified).format(
              'YYYY-MM-DD HH:mm',
            )
            return item
          }),
        )
        this.loading = false
      } catch (error) {
        this.loading = false
      }
    },
    searchFile(item) {
      this.$refs.multipleTable.setCurrentRow(item.file)
    },
    querySearch(queryString, cb) {
      const results = queryString
        ? this.fileList.filter((file) => {
            return (
              file.Key.toLowerCase().indexOf(queryString.toLowerCase()) === 0
            )
          })
        : [...this.fileList]
      cb(
        results.map((file) => {
          return { value: file.Key, file: file }
        }),
      )
    },
    async download(file) {
      const url = await getURL(this.bucket, file, this.prefix, true)
      document.querySelector('#element-download').href = url
      document.querySelector('#span-download').click()
    },
    previousPage() {
      let maker = this.makerArray[this.makerArray.length - 2]
      this.makerArray.pop()
      this.getData(maker, this.searchValue)
    },
    nextPage() {
      this.nextMarker && this.makerArray.push(this.nextMarker)
      this.getData(this.nextMarker, this.searchValue)
    },
    viewFolder(folder) {
      this.$router.push(
        `/file/${repliceAllString(
          this.bucket + '/' + folder.Prefix,
          '/',
          '%2F',
        )}`,
      )
    },
    async deleteFile(file) {
      try {
        if (file.type === 'file') {
          await handler('deleteObject', {
            Bucket: this.bucket,
            Key: this.prefix + file.Key,
          })
          this.fileList = removeItemFromArray([...this.fileList], file)
        } else {
          await this.deleteFolders(file)
        }
      } catch (e) {
        this.$notify.error(e)
      }
    },
    async deleteFolders(folder, marker = '') {
      try {
        let res = await handler('listObjects', {
          Bucket: this.bucket,
          Prefix: folder.Prefix,
          MaxKeys: 1000,
          Marker: marker,
        })
        await handler('deleteObjects', {
          Bucket: this.bucket,
          Delete: {
            Objects: res.Contents.map((file) => {
              return {
                Key: file.Key,
              }
            }),
          },
        })
        if (res.Contents.length === 1000) {
          await this.deleteFolders(folder, res.Contents[100].Key)
        } else {
          await handler('deleteObject', {
            Bucket: this.bucket,
            Key: this.prefix + folder.Key,
          })
          this.spinShow = false
        }
        this.fileList = removeItemFromArray([...this.fileList], folder)
      } catch (e) {
        this.$notify.error(e)
      }
    },
    async batchDelete() {
      let self = this
      await Promise.all(
        self.selectedFileList.map((file) => self.deleteFile(file)),
      )
    },
    async addFolder() {
      if (!this.folderForm.name) return
      this.dialogNewFolderVisible = false
      try {
        await handler('putObject', {
          Bucket: this.bucket,
          Key: this.prefix + this.folderForm.name + '/',
          Body: '',
        })
        this.getData()
      } catch (e) {
        this.$notify.error(e)
      }
    },
    fileUploadSuccess(file) {
      if (file.bucket === this.bucket && file.prefix === this.prefix) {
        const awsFile = {
          Key: file.name,
          LastModified: moment(file.raw.LastModified).format(
            'YYYY-MM-DD HH:mm',
          ),
          Prefix: file.prefix,
          Size: file.size,
          convertSize: bytes(file.size),
          isImage: isImage({ Key: file.name }),
          type: isFolder(file.name),
        }
        this.fileList = [awsFile, ...this.fileList]
      }
    },
    removeUploadFile(file) {
      if (file.status === 'success') {
        const fileList = [...this.fileList]
        const obj = fileList.find((item) => item.Key === file.name)
        obj ? this.deleteFile(obj) : this.$notify.error('no this file')
      }
    },
  },
  beforeDestroy() {
    this.$root.Bus.$off('clickUpload')
  },
  watch: {
    $route: function() {
      this.getData()
    },
  },
}
const getURL = async (bucket, file, prefix, isDownload = false) => {
  try {
    let getURLparams = isDownload
      ? {
          Bucket: bucket,
          Key: prefix + file.Key,
          ResponseContentDisposition: 'attachment',
        }
      : { Bucket: bucket, Key: prefix + file.Key }
    let getAclparams = { Bucket: bucket, Key: prefix + file.Key }
    let s3 = await getS3()
    let url = await s3.getSignedUrl('getObject', getURLparams)
    let acl = await handler('getObjectAcl', getAclparams)
    let isAllUser = acl.Grants.find(
      (item) =>
        item.Grantee.URI &&
        item.Grantee.URI === 'http://acs.amazonaws.com/groups/global/AllUsers',
    )
    return isDownload ? url : isAllUser ? url.split('?')[0] : url
  } catch (error) {
    return Promise.reject(error)
  }
}
</script>
<style lang="less" scoped>
.actions-bar {
  text-align: left;
  padding-bottom: 8px;
  margin-bottom: 8px;

  .el-autocomplete {
    float: right;
  }
}
.append-row {
  margin-top: 10px;
  height: 57px;
}
</style>
