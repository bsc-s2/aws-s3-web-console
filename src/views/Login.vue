<template>
  <div class="login">
    <div class="wrap">
      <h1>A simple s3 management console</h1>
      <div class="login-form">
        <el-tabs v-model="tabs">
          <el-tab-pane label="BaishanCloud"
                       name="baishan">
            <el-form :model="baishanKeys"
                     status-icon
                     :rules="baishanRules"
                     ref="baishanKeys"
                     label-position="left"
                     label-width="80px"
                     class="demo-ruleForm">
              <el-form-item label="accesskey"
                            prop="accesskey">
                <el-input type="text"
                          v-model="baishanKeys.accesskey"
                          autocomplete="off"></el-input>
              </el-form-item>
              <el-form-item label="secretkey"
                            prop="secretkey">
                <el-input type="password"
                          v-model="baishanKeys.secretkey"
                          autocomplete="off"></el-input>
              </el-form-item>
              <el-form-item>
                <el-button type="primary"
                           @click="submitForm('baishanKeys')">Submit</el-button>
                <el-button @click="resetForm('baishanKeys')">Reset</el-button>
              </el-form-item>
            </el-form>
          </el-tab-pane>
          <el-tab-pane label="AWS S3"
                       name="aws">
            <el-form :model="awsKeys"
                     status-icon
                     :rules="awsRules"
                     ref="awsKeys"
                     label-position="left"
                     label-width="80px"
                     class="demo-ruleForm">
              <el-form-item label="accesskey"
                            prop="accesskey">
                <el-input type="text"
                          v-model="awsKeys.accesskey"
                          autocomplete="off"></el-input>
              </el-form-item>
              <el-form-item label="secretkey"
                            prop="secretkey">
                <el-input type="password"
                          v-model="awsKeys.secretkey"
                          autocomplete="off"></el-input>
              </el-form-item>
              <el-form-item>
                <el-button type="primary"
                           @click="submitForm('awsKeys')">Submit</el-button>
                <el-button @click="resetForm('awsKeys')">Reset</el-button>
              </el-form-item>
            </el-form>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
  </div>
</template>
<script>
import { login } from '@/service/aws-http'
export default {
  data() {
    return {
      baishanKeys: {
        accesskey: '',
        secretkey: '',
        region: 'us-west-1',
        host: 'http://ss.bscstorage.com',
      },
      awsKeys: {
        accesskey: '',
        secretkey: '',
        region: 'us-west-1',
        host: 'http://s3.us-west-1.amazonaws.com',
      },
      baishanRules: {
        accesskey: [{ required: true, trigger: 'blur' }],
        secretkey: [{ required: true, trigger: 'blur' }],
      },
      awsRules: {
        accesskey: [{ required: true, trigger: 'blur' }],
        secretkey: [{ required: true, trigger: 'blur' }],
        region: [{ required: true, trigger: 'blur' }],
      },
      tabs: 'aws',
    }
  },
  methods: {
    submitForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.setKeysAndGetBuckets()
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    async setKeysAndGetBuckets() {
      const keys = this.tabs === 'aws' ? this.awsKeys : this.baishanKeys
      await this.$store.dispatch('setValueWithStorage', { keys })

      const res = await login(keys)
      if (Object.keys(res).length > 0 && res.token.length > 0) {
        await this.$store.dispatch('setValues', res)
        sessionStorage.setItem('token', res.token)
        this.$router.push({ name: 'bucket' })
      }
    },
    resetForm(formName) {
      this.$refs[formName].resetFields()
    },
  },
}
</script>
<style scoped lang="less">
.wrap {
  width: 400px;
  padding: 20px;
  margin: 160px auto 10px;
}
h1 {
  padding-bottom: 30px;
}
</style>
