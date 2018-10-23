<template>
  <div class="file-list">
    <div class="actions-bar">
      <el-button type="primary"
                 size="small"
                 @click="dialogVisible = true">Upload</el-button>
      <el-button type="primary"
                 size="small">New folder</el-button>
      <el-button type="danger"
                 :disabled="fileList.length === 0"
                 size="small">Delete</el-button>
    </div>
    <el-table ref="multipleTable"
              stripe
              :height="tableHeight"
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
        <template slot-scope="scope">
          <el-button type="text"
                     v-show="scope.row.type === 'folder'"
                     @click="viewFolder(scope.row)"
                     size="small">View</el-button>
          <el-button type="text"
                     v-show="scope.row.type !== 'folder'"
                     size="small">Edit</el-button>
          <el-button type="text"
                     size="small">Delete</el-button>
        </template>
      </el-table-column>
      <div v-if="nextMarker" slot="append" class="append-row">
        <el-button size="small" icon="el-icon-arrow-left">Before pages</el-button>
        <el-button v-if="nextMarker" size="small">Next pages <i class="el-icon-arrow-right"></i></el-button>
      </div>
    </el-table>
    <el-dialog title="收货地址" :visible.sync="dialogVisible">
      <upload :bucket="bucket" :prefix="prefix"></upload>
    </el-dialog>
  </div>
</template>
<script>
import moment from 'moment'
import { handler } from '@/service/aws'
import upload from './Upload'
import { keyFilter, bytes, isImage, repliceAllString } from '@/service/util'
export default {
  name: 'fileList',
  data() {
    return {
      fileList: [],
      loading: false,
      nextMarker: '',
      makerArray: [],
      dialogVisible: false,
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
    viewFolder(folder) {
      this.$router.push(
        `/file/${repliceAllString(
          this.bucket + '/' + folder.Prefix,
          '/',
          '%2F',
        )}`,
      )
    },
  },
  watch: {
    $route: function() {
      this.getData()
    },
  },
}
</script>
<style lang="less" scoped>
.actions-bar {
  text-align: left;
  padding-bottom: 8px;
  margin-bottom: 8px;
}
.append-row {
  margin-top: 10px;
  height: 57px;
}
</style>
