<template>
  <el-table ref="multipleTable"
            stripe
            :data="fileList"
            v-loading="loading"
            tooltip-effect="dark">
    <el-table-column type="selection">
    </el-table-column>
    <el-table-column prop="Key"
                     label="Key">
    </el-table-column>
    <el-table-column prop="Size"
                     label="Size">
    </el-table-column>
    <el-table-column prop="LastModified"
                     label="LastModified">
    </el-table-column>
    <el-table-column label="Actions"
                     width="150">
      <template slot-scope="scope">
        <el-button type="text"
                   size="small">View</el-button>
        <el-button type="text"
                   size="small">Edit</el-button>
        <el-button type="text"
                   size="small">Delete</el-button>
      </template>
    </el-table-column>
  </el-table>
</template>
<script>
import moment from 'moment'
import { handler } from '@/service/aws'
import { keyFilter, bytes, isImage } from '@/service/util'
export default {
  name: 'fileList',
  data() {
    return {
      fileList: [],
      loading: false,
    }
  },
  computed: {
    bucket() {
      return this.$route.params.prefix.split('/')[0]
    },
    prefix() {
      return this.$route.params.prefix &&
        this.$route.params.prefix.split('/').length > 1
        ? '/' +
            this.$route.params.prefix
              .split('/')
              .reduce((accu, currnet, index) => index !== 0 && accu + currnet)
        : ''
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
          foler.Type = 'folder'
          foler.LastModified = ''
          foler.convertSize = ''
          return foler
        }).concat(
          res.Contents.map((item) => {
            item.Key = keyFilter(item.Key, self.prefix)
            item.convertSize = bytes(item.Size)
            item.Type = 'file'
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
  },
  watch: {
    $route: function() {
      this.getData()
    },
  },
}
</script>
