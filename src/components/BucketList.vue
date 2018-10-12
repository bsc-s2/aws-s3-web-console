<template>
  <el-table ref="multipleTable"
            stripe
            :data="bucketList"
            tooltip-effect="dark">
    <el-table-column type="selection">
    </el-table-column>
    <el-table-column prop="Name"
                     label="Bucket">
    </el-table-column>
    <el-table-column prop="CreationDate"
                     label="CreationDate">
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
export default {
  name: 'bucketList',
  computed: {
    bucketList() {
      return this.$store.state.bucketList
    },
  },
  mounted() {
    this.$store.dispatch('getBuckets', {})
  },
}
</script>
