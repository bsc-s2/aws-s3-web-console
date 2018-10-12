<template>
  <el-table ref="multipleTable"
            stripe
            :data="fileList"
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
export default {
  name: 'fileList',
  props: {
    fileList: {
      type: Array,
      required: true,
      default: () => [],
    },
  },
}
</script>
