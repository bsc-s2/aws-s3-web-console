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
        <el-card shadow="hover"
                 style="margin-top: 20px">
          <el-button size="mini"
                     type="danger"
                     @click="logout">Logout</el-button>
        </el-card>
      </el-aside>
      <el-main>
        <el-card v-if="hasPrefix"
                 class="breadcrumb"
                 shadow="hover">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/' }">Bucket List</el-breadcrumb-item>
            <el-breadcrumb-item v-for="{ text, prefix } in breadcrumb"
                                :key="text"
                                :to="{ path: prefix }">{{ text }}</el-breadcrumb-item>
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
    <footerBar>
      <div class="upload"
           v-if="hasPrefix"
           slot="left">
        <el-popover v-if="uploadFileList.length > 0"
                    placement="top-start"
                    width="400"
                    trigger="click">
          <Upload :bucket="bucket"
                  :listMode="hasPrefix"
                  :disabled="hasPrefix"
                  :fileList="uploadFileList">
          </Upload>
          <el-badge slot="reference"
                    :value="uploadFileList.length"
                    class="item">
            <el-button size="small">Upload file list</el-button>
          </el-badge>
        </el-popover>
        <el-badge v-else
                  :value="uploadFileList.length"
                  class="item">
          <el-button size="small">Upload file list</el-button>
        </el-badge>
      </div>
      <div class="logout"
           slot="right">
        <el-button size="small"
                   type="danger"
                   @click="logout">Logout</el-button>
      </div>
    </footerBar>
  </div>
</template>
<script>
import bucketNav from '@/components/BucketNav'
import bucketList from '@/components/BucketList'
import fileList from '@/components/FileList'
import footerBar from '@/components/FooterBar'
import Upload from '@/components/upload/index'
import { convertPrefix2Router } from '@/service/util'
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
    breadcrumb() {
      return convertPrefix2Router(this.$route.params.prefix)
    },
    uploadFileList() {
      return this.$store.state.uploadFileList
    },
    bucket() {
      return (
        this.$route.params.prefix && this.$route.params.prefix.split('/')[0]
      )
    },
  },
  components: { bucketNav, bucketList, fileList, footerBar, Upload },
  methods: {
    async logout() {
      await Promise.all([
        this.$store.dispatch('setValueWithStorage', {
          keys: {},
          token: '',
        }),
        this.$store.dispatch('setValues', {
          bucketList: [],
          buckets: {},
          uploadFileList: [],
        }),
      ])
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
.logout,
.upload {
  height: 100%;
  display: flex;
  align-items: center;
}
.breadcrumb {
  margin-bottom: 12px;
}
</style>
