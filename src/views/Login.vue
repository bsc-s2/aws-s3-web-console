<template>
  <div class="login">
    <div class="wrap">
      <h1>a simple aws s3 web console</h1>
      <div class="login-form">
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
      </div>
    </div>
  </div>
</template>
<script>
export default {
  data() {
    return {
      awsKeys: {
        accesskey: '',
        secretkey: '',
      },
      awsRules: {
        accesskey: [{ required: true, trigger: 'blur' }],
        secretkey: [{ required: true, trigger: 'blur' }],
      },
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
      await this.$store.dispatch('setKeys', this.awsKeys)
      const buckets = await this.$store.dispatch('getBuckets', {})
      if (Object.keys(buckets).length > 0) {
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
