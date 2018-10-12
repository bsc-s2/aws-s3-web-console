<template>
  <div>
    <el-container>
      <el-aside width="200px">
        <el-card>
          <el-button type="primary" size="mini" @click="logout">Logout</el-button>
        </el-card>
        <el-card class="bucket-nav-card">
          <div>
            <el-button type="primary" size="mini">New Bucket</el-button>
            <bucketNav :bucketList="bucketList"></bucketNav>
          </div>
        </el-card>
      </el-aside>
      <el-main>
        <el-card>
          <el-table ref="multipleTable"
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
            <el-table-column
              label="Actions"
              width="150">
              <template slot-scope="scope">
                <el-button type="text" size="small">View</el-button>
                <el-button type="text" size="small">Edit</el-button>
                <el-button type="text" size="small">Delete</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-main>
    </el-container>
  </div>
</template>
<script>
import moment from 'moment'
import bucketNav from '@/components/BucketNav'
export default {
  name: 'bucket',
  data() {
    return {
      createBucketValue: '',
      fetchDone: false,
      createBucketModal: false,
      inputCheck: false,
      bucketList: [],
    }
  },
  components: { bucketNav },
  created() {
    this.getBucketList()
  },
  methods: {
    async getBucketList(forceUpdate = false) {
      const buckets = await this.$store.dispatch('getBuckets', forceUpdate)
      this.fetchDone = true
      buckets.Buckets.forEach((item) => {
        item.CreationDate = moment(item.CreationDate).format('YYYY-MM-DD HH:mm')
      })
      this.bucketList = buckets.Buckets
    },
    async logout() {
      await this.$store.dispatch('setKeys', {})
      this.$router.push({ name: 'login' })
    },
  },
}
</script>
<style lang="less" scoped>
.h2-logo {
  content: url(../assets/logo.png);
  width: 50px;
  margin: 0 auto;
}
.bucket-nav-card {
  margin-top: 20px;
}
</style>
