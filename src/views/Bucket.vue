<template>
  <div>
    <el-container>
      <el-aside width="200px">
        <el-card class="bucket-nav-card"
                 shadow="hover">
          <div>
            <el-button type="primary"
                       size="mini">New Bucket</el-button>
            <bucketNav></bucketNav>
          </div>
        </el-card>
      </el-aside>
      <el-main>
        <el-card v-if="hasPrefix"
                 class="breadcrumb"
                 shadow="hover">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item>Bucket List</el-breadcrumb-item>
            <el-breadcrumb-item>活动列表</el-breadcrumb-item>
            <el-breadcrumb-item>活动详情</el-breadcrumb-item>
          </el-breadcrumb>
        </el-card>
        <el-card v-if="!hasPrefix"
                 shadow="hover">
          <bucketList></bucketList>
        </el-card>
        <el-card v-if="hasPrefix"
                 shadow="hover">
          <fileList :fileList="fileList"></fileList>
        </el-card>
      </el-main>
    </el-container>
  </div>
</template>
<script>
import bucketNav from '@/components/BucketNav'
import bucketList from '@/components/BucketList'
import fileList from '@/components/FileList'
export default {
  name: 'bucket',
  data() {
    return {
      createBucketValue: '',
      fetchDone: false,
      createBucketModal: false,
      inputCheck: false,
      fileList: [],
    }
  },
  computed: {
    hasPrefix() {
      return this.$route.params.prefix !== undefined
    },
    prefix() {
      return this.$route.params.prefix
    },
    bucketList() {
      return this.$store.state.bucketList
    },
  },
  components: { bucketNav, bucketList, fileList },
  methods: {
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
.logout-button {
  margin: 4px 0 4px;
}
.breadcrumb {
  margin-bottom: 12px;
}
</style>
