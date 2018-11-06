<template>
  <div>
    <el-table ref="multipleTable"
              stripe
              :height="tableHeight"
              :data="bucketList"
              empty-text="No buckets"
              tooltip-effect="dark">
      <el-table-column label="Bucket">
        <template slot-scope="{ row }">
          <el-button type="text"
                    size="small"
                    @click="viewBucket(row)">{{ row.Name }}</el-button>
        </template>
      </el-table-column>
      <el-table-column prop="CreationDate"
                      width="180"
                      label="CreationDate">
      </el-table-column>
      <el-table-column label="Actions"
                      width="200">
        <template slot-scope="{ row }">
          <el-button type="text"
                    size="small"
                    @click="selectedBucket = row;settingDialogVisible = true">Permissions</el-button>
          <el-button type="text"
                    size="small"
                    @click="viewBucket(row)">View</el-button>
          <el-button type="text"
                    size="small"
                    @click="deleteBucket(row)">Delete</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog
      title="Permissions"
      :visible.sync="settingDialogVisible"
      width="1000px">
      <el-tabs v-model="activeTab" type="card">
        <el-tab-pane label="Access Control List" name="acl">
          <Acl :bucket="selectedBucket.Name" v-on:close-dialog="settingDialogVisible = false"></Acl>
        </el-tab-pane>
        <el-tab-pane label="CORS Configuration" name="cors">
          <Cors :bucket="selectedBucket.Name" v-on:close-dialog="settingDialogVisible = false"></Cors>
        </el-tab-pane>
      </el-tabs>
    </el-dialog>
  </div>
</template>
<script>
import { handler } from '@/service/aws-http'
import Acl from './ACL'
import Cors from './CORS'
export default {
  name: 'bucketList',
  data() {
    return {
      settingDialogVisible: false,
      activeTab: 'acl',
      selectedBucket: {},
    }
  },
  components: { Acl, Cors },
  computed: {
    bucketList() {
      return this.$store.getters.getBucketList
    },
    tableHeight() {
      const scrollHeight = document.querySelector('body').offsetHeight
      const bucketListLength =
        (this.$store.state.bucketList && this.$store.state.bucketList.length) ||
        0
      return bucketListLength * 57 < scrollHeight
        ? undefined
        : scrollHeight - 146
    },
  },
  mounted() {
    this.$store.dispatch('getBuckets')
  },
  methods: {
    viewBucket(row) {
      this.$router.push(`/file/${row.Name}`)
    },
    async deleteBucket(row) {
      try {
        await handler('deleteBucket', { Bucket: row.Name })
        await this.$store.dispatch('getBuckets', true)
      } catch (e) {
        this.$notify.error(e)
      }
    },
  },
}
</script>
