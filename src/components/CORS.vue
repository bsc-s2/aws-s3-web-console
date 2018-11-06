<template>
  <div>
    <el-table :data="corsRulesList"
              stripe
              empty-text="No CORS Settings"
              v-loading="loading"
              style="width: 100%">
      <el-table-column label="AllowedOrigins"
                       prop="AllowedOrigins">
        <template slot-scope="{ row }">
          <el-tag size="mini"
                  v-for="item in row.AllowedOrigins"
                  :key="item">{{ item }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="AllowedMethods"
                       prop="AllowedMethods">
        <template slot-scope="{ row }">
          <el-tag size="mini"
                  v-for="item in row.AllowedMethods"
                  :key="item">{{ item }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="AllowedHeaders"
                       prop="AllowedHeaders">
        <template slot-scope="{ row }">
          <el-tag size="mini"
                  v-for="item in row.AllowedHeaders"
                  :key="item">{{ item }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="ExposeHeaders"
                       prop="ExposeHeaders">
        <template slot-scope="{ row }">
          <el-tag size="mini"
                  v-for="item in row.ExposeHeaders"
                  :key="item">{{ item }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="MaxAge"
                       prop="MaxAgeSeconds"
                       width="100">
        <template slot-scope="{ row }">
          {{ row.MaxAgeSeconds ? `${ row.MaxAgeSeconds } S` : '' }}
        </template>
      </el-table-column>
      <el-table-column label="Actions"
                       width="100px">
        <template slot-scope="{ row }">
          <el-button type="text"
                     size="small"
                     @click="editCorsRule(row)">Edit</el-button>
          <el-button type="text"
                     size="small"
                     @click="deleteCorsRule(row)">Delete</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div class="dialog-button">
      <el-button size="small"
                 @click="$emit('close-dialog')">
        Cancel</el-button>
      <el-button size="small"
                 @click="resetEditForm();editCORSDialogVisible = true">
        Add CORS</el-button>
      <el-button size="small"
                 type="primary"
                 @click="saveCorsRules">
        Save CORS</el-button>
    </div>
    <el-dialog width="900px"
               title="CORS"
               :visible.sync="editCORSDialogVisible"
               append-to-body>
      <el-form :model="corsItem">
        <el-form-item label="AllowedOrigins"
                      label-width="120px">
          <el-input v-model="corsItem.AllowedOrigins"
                    placeholder="Enter allowed origins split with ',' ,eg. http://www.a.com, http://www.b.com"
                    autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="AllowedMethods"
                      label-width="120px">
          <el-checkbox-group v-model="corsItem.AllowedMethods">
            <el-checkbox label="GET"></el-checkbox>
            <el-checkbox label="POST"></el-checkbox>
            <el-checkbox label="PUT"></el-checkbox>
            <el-checkbox label="HEAD"></el-checkbox>
            <el-checkbox label="DELETE"></el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="AllowedHeaders"
                      label-width="120px">
          <el-input v-model="corsItem.AllowedHeaders"
                    placeholder="Enter allowed headers split with ','"
                    autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="ExposeHeaders"
                      label-width="120px">
          <el-input v-model="corsItem.ExposeHeaders"
                    placeholder="Enter expose headers split with ','"
                    autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="MaxAgeSeconds"
                      label-width="120px">
          <el-input-number v-model="corsItem.MaxAgeSeconds"></el-input-number>
        </el-form-item>
      </el-form>
      <div slot="footer"
           class="dialog-footer">
        <el-button size="mini"
                   @click="editCORSDialogVisible = false">Cancel</el-button>
        <el-button size="mini"
                   type="primary"
                   @click="addCorsRule">Confirm</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import { handler } from '@/service/aws-http'
export default {
  props: {
    bucket: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      corsRulesList: [],
      loading: false,
      editCORSDialogVisible: false,
      corsItem: {
        AllowedOrigins: '',
        AllowedMethods: ['GET'],
        AllowedHeaders: '',
        ExposeHeaders: '',
        MaxAgeSeconds: 0,
      },
      corsItemRules: {
        AllowedOrigins: [{ required: true, trigger: 'blur' }],
        AllowedMethods: [{ required: true, trigger: 'blur' }],
      },
    }
  },
  mounted() {
    this.listCorsRules()
  },
  methods: {
    async listCorsRules() {
      try {
        const res = await handler('getBucketCors', { Bucket: this.bucket })
        this.corsRulesList = res.CORSRules.map((rule) => {
          rule.index = Math.random()
          return rule
        })
      } catch (e) {
        this.$notify.error(e)
      }
    },
    addCorsRule() {
      if (this.corsItem.index) {
        let _list = [...this.corsRulesList].filter(
          (rule) => rule.index !== this.corsItem.index,
        )
        _list.push(convertObject2Array(this.corsItem))
        this.corsRulesList = _list
      } else {
        this.corsItem.index = Math.random()
        this.corsRulesList.push(convertObject2Array(this.corsItem))
      }
      this.editCORSDialogVisible = false
    },
    async saveCorsRules() {
      let putParams = {
        Bucket: this.bucket,
        CORSConfiguration: {
          CORSRules: this.corsRulesList.map((rule) => {
            delete rule.index
            return rule
          }),
        },
      }
      try {
        await handler('putBucketCors', putParams)
        this.$emit('close-dialog')
      } catch (e) {
        this.$notify.error(e)
        this.listCorsRules()
      }
    },
    editCorsRule(item) {
      this.corsItem = convertArray2Object(item)
      this.editCORSDialogVisible = true
    },
    deleteCorsRule(item) {
      if (item.index) {
        let _list = [...this.corsRulesList].filter(
          (rule) => rule.index !== item.index,
        )
        this.corsRulesList = _list
      }
    },
    resetEditForm() {
      this.corsItem = {
        AllowedOrigins: '',
        AllowedMethods: ['GET'],
        AllowedHeaders: '',
        ExposeHeaders: '',
        MaxAgeSeconds: 0,
      }
    },
  },
  watch: {
    bucket() {
      this.listCorsRules()
    },
  },
}
function convertObject2Array(param) {
  let obj = JSON.parse(JSON.stringify(param))
  const keys = Object.keys(obj)
  if (keys.length === 0) return
  keys.forEach((key) => {
    obj[key] =
      Array.isArray(obj[key]) || Number.isInteger(obj[key])
        ? obj[key]
        : obj[key].length > 0
          ? obj[key].split(',').map((item) => item.trim())
          : []
  })
  return obj
}
function convertArray2Object(param) {
  let obj = JSON.parse(JSON.stringify(param))
  const keys = Object.keys(obj)
  if (keys.length === 0) return
  keys.forEach((key) => {
    obj[key] =
      Array.isArray(obj[key]) && key !== 'AllowedMethods'
        ? obj[key].join(',')
        : obj[key]
  })
  return obj
}
</script>
