<template>
  <div>
    <el-table :data="aclList"
              stripe
              v-loading="loading"
              empty-text="No ACL Settings"
              style="width: 100%">
      <el-table-column label="Grantee"
                       prop="Grantee"
                       width="120">
        <template slot-scope="{ row }">
          {{ row.Grantee | userType }}
        </template>
      </el-table-column>
      <el-table-column label="Type"
                       width="90">
        <template slot-scope="{ row }">
          {{ row.Grantee.Type === 'Group' ? 'Group' : 'User' }}
        </template>
      </el-table-column>
      <el-table-column label="Permission">
        <template slot-scope="{ row }">
          <el-checkbox v-model="row.Permission.READ">List objects</el-checkbox>
          <el-checkbox v-model="row.Permission.READ_ACP">Read bucket permissions</el-checkbox>
          <el-checkbox v-model="row.Permission.WRITE">Write objects</el-checkbox>
          <el-checkbox v-model="row.Permission.WRITE_ACP">Write bucket permissions</el-checkbox>
        </template>
      </el-table-column>
    </el-table>
    <div class="dialog-button">
      <el-button size="small"
                 @click="$emit('close-dialog')">
        Cancel</el-button>
      <el-button size="small"
                 @click="addUserDialogVisible = true">
        Add account</el-button>
      <el-button size="small"
                 type="primary"
                 @click="ACLsubmitForm">
        Save ACL</el-button>
    </div>
    <el-dialog width="900px"
               title="Add account"
               :visible.sync="addUserDialogVisible"
               append-to-body>
      <el-form :model="newUserItem">
        <el-form-item label="Account"
                      label-width="100px">
          <el-input v-model="newUserItem.name"
                    placeholder="Enter a canonical ID or an email address"
                    autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="permissions"
                      label-width="100px">
          <el-checkbox v-model="newUserItem.Permission.READ">List objects</el-checkbox>
          <el-checkbox v-model="newUserItem.Permission.READ_ACP">Read bucket permissions</el-checkbox>
          <el-checkbox v-model="newUserItem.Permission.WRITE">Write objects</el-checkbox>
          <el-checkbox v-model="newUserItem.Permission.WRITE_ACP">Write bucket permissions</el-checkbox>
        </el-form-item>
      </el-form>
      <div slot="footer"
           class="dialog-footer">
        <el-button size="mini" @click="addUserDialogVisible = false">Cancel</el-button>
        <el-button size="mini"
                   type="primary"
                   @click="addUser">Confirm</el-button>
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
      GroupACLList: [],
      UserACLList: [],
      deleteList: [],
      loading: false,
      isAdd: false,
      addUserDialogVisible: false,
      owner: this.owner,
      newUserItem: {
        name: '',
        Permission: {
          READ: false,
          WRITE: false,
          READ_ACP: false,
          WRITE_ACP: false,
        },
      },
    }
  },
  computed: {
    aclList() {
      return this.GroupACLList.concat(this.UserACLList)
    },
  },
  mounted() {
    this.getACLList()
  },
  methods: {
    async getACLList() {
      try {
        this.loading = true
        let res = await handler('getBucketAcl', {
          Bucket: this.bucket,
        })
        this.GroupACLList = convertGrants(res.Grants)[0]
        this.UserACLList = convertGrants(res.Grants)[1]
        this.loading = false
        this.Data = {
          bucket: this.bucket,
          grants: res.Grants,
          owner: res.Owner,
        }
        this.owner = res.Owner.ID
      } catch (e) {
        this.$notify.error(e)
      }
    },
    deleteUser(item) {
      item.Permission = {
        READ: false,
        WRITE: false,
        READ_ACP: false,
        WRITE_ACP: false,
      }
      this.deleteList.push(item)
      this.UserACLList = this.UserACLList.filter((val) => val !== item)
    },
    newUserItemInit() {
      this.newUserItem = {
        Permission: { ...permissionFalse },
        name: '',
      }
    },
    addUser() {
      this.UserACLList.push(convertNewUserItem(this.newUserItem))
      this.addUserDialogVisible = false
    },
    async ACLsubmitForm() {
      const arrays = [
        ...this.GroupACLList,
        ...this.UserACLList,
        ...this.deleteList,
      ]
      let items = JSON.parse(JSON.stringify(arrays))
      items = items
        .map((value) => {
          return convertObject2String(value)
        })
        .filter((value) => {
          return Array.isArray(value)
        })
        .flat()
      if (items.length === 0) {
        this.$notify.error('ACL settings is empty')
        return false
      }
      let params = {
        Bucket: this.Data.bucket,
        AccessControlPolicy: {
          Grants: items,
          Owner: this.Data.owner,
        },
      }
      try {
        await handler('putBucketAcl', params)
        this.$emit('close-dialog')
        this.deleteList = []
      } catch (e) {
        this.$notify.error(e)
      }
    },
  },
  watch: {
    bucket() {
      this.getACLList()
    },
  },
  filters: {
    userType: (Grantee) => {
      if (
        Grantee.URI &&
        Grantee.URI === 'http://acs.amazonaws.com/groups/global/AllUsers'
      ) {
        return 'Everyone'
      } else if (
        Grantee.Type === 'Group' &&
        (Grantee.URI &&
          Grantee.URI ===
            'http://acs.amazonaws.com/groups/global/AuthenticatedUsers')
      ) {
        return 'Auth Users'
      } else {
        return Grantee.DisplayName || Grantee.ID
      }
    },
  },
}
const permissionFalse = {
  READ: false,
  WRITE: false,
  READ_ACP: false,
  WRITE_ACP: false,
}
const gropItemsDefaultInit = () => {
  const gropItemsDefault = [
    {
      Permission: { ...permissionFalse },
      Grantee: {
        URI: 'http://acs.amazonaws.com/groups/global/AllUsers',
        Type: 'Group',
      },
    },
    {
      Permission: { ...permissionFalse },
      Grantee: {
        URI: 'http://acs.amazonaws.com/groups/global/AuthenticatedUsers',
        Type: 'Group',
      },
    },
  ]
  return gropItemsDefault
}

const userItemsDefaultInit = () => {
  let userACLItemsDefault = {
    Permission: { ...permissionFalse },
    Grantee: {},
  }
  return userACLItemsDefault
}
const convertGrants = (grants) => {
  let userACLItems = []

  let gropItemsDefault = gropItemsDefaultInit()
  if (grants.length) {
    let IDArry = []
    grants.forEach((grant) => {
      if (
        grant.Grantee.URI &&
        grant.Grantee.URI === 'http://acs.amazonaws.com/groups/global/AllUsers'
      ) {
        convertPermission(gropItemsDefault[0], grant.Permission)
      } else if (
        grant.Grantee.Type === 'Group' &&
        (grant.Grantee.URI &&
          grant.Grantee.URI ===
            'http://acs.amazonaws.com/groups/global/AuthenticatedUsers')
      ) {
        convertPermission(gropItemsDefault[1], grant.Permission)
      } else if (grant.Grantee.ID) {
        let id = grant.Grantee.ID
        let ObjIndex = IDArry.findIndex((val) => val === id)
        if (IDArry.includes(id)) {
          convertPermission(userACLItems[ObjIndex], grant.Permission)
        } else {
          let userItemsDefault = userItemsDefaultInit()
          userItemsDefault.Grantee = grant.Grantee
          convertPermission(userItemsDefault, grant.Permission)
          userACLItems.push(userItemsDefault)
          IDArry.push(id)
        }
      }
    })
  }
  return [gropItemsDefault, userACLItems]
}
const convertPermission = (grant, permission) => {
  if (permission === 'FULL_CONTROL') {
    grant.Permission = {
      READ: true,
      WRITE: true,
      READ_ACP: true,
      WRITE_ACP: true,
    }
  } else {
    grant.Permission[permission] = true
  }
}
const convertObject2String = (object) => {
  let truePermission = {}
  let arrays = []
  for (const item in object.Permission) {
    if (object.Permission[item]) {
      truePermission[item] = true
    }
  }
  const keys = Object.keys(truePermission)
  if (keys.length > 0 && keys.length < 4) {
    keys.forEach((key) =>
      arrays.push({
        Grantee: object.Grantee,
        Permission: key,
      }),
    )
    return arrays
  } else if (keys.length === 4) {
    return [
      {
        Grantee: object.Grantee,
        Permission: 'FULL_CONTROL',
      },
    ]
  }
}
const convertNewUserItem = (item) => {
  let newItem = { ...item }
  newItem.Grantee = item.name.includes('@')
    ? { Type: 'AmazonCustomerByEmail', EmailAddress: item.name }
    : { Type: 'CanonicalUser', ID: item.name }
  delete newItem.name
  return newItem
}
</script>
<style lang="less">
.dialog-button {
  margin-top: 12px;
  text-align: right;
}
</style>
