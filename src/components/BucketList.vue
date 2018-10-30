<template>
  <el-table ref="multipleTable"
            stripe
            :height="tableHeight"
            :data="bucketList"
            tooltip-effect="dark">
    <el-table-column prop="Name"
                     label="Bucket">
    </el-table-column>
    <el-table-column prop="CreationDate"
                     width="180"
                     label="CreationDate">
    </el-table-column>
    <el-table-column label="Actions"
                     width="150">
      <template slot-scope="{ row }">
        <el-button type="text"
                   size="small"
                   @click="viewBucket(row)">View</el-button>
        <el-button type="text"
                   size="small"
                   @click="deleteBucket(row)">Delete</el-button>
      </template>
    </el-table-column>
  </el-table>
</template>
<script>
import { handler } from '@/service/aws-http'
export default {
  name: 'bucketList',
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
