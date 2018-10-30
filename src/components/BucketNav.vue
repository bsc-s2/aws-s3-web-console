<template>
  <div class="wrap" v-show="bucketList.length > 0">
    <ul>
      <li v-for="bucket in bucketList"
          @click="viewBucket(bucket)"
          :class="{ 'selected': bucket.Name === selectedBucket }"
          :key="bucket.Name">{{bucket.Name}}</li>
    </ul>
  </div>
</template>
<script>
export default {
  name: 'BucketNav',
  computed: {
    bucketList() {
      return this.$store.getters.getBucketList
    },
    selectedBucket() {
      return (
        (this.$route.params.prefix &&
          this.$route.params.prefix.split('/')[0]) ||
        ''
      )
    },
  },
  mounted() {
    this.$store.dispatch('getBuckets')
  },
  methods: {
    viewBucket(row) {
      this.$router.push(`/file/${row.Name}`)
    },
  },
}
</script>
<style lang="less" scoped>
.wrap {
  margin-top: 20px;
}
ul {
  list-style: none;
  margin: 0 auto;
  padding-left: 0;
  border: 1px solid #e8e8e8;
  border-radius: 3px;
}
li {
  padding: 12px 4px;
  cursor: pointer;
}
li:hover {
  background-color: #f5f7fa;
}
li.selected {
  color: #409eff;
  background-color: #f5f7fa;
}
li:not(:last-child) {
  border-bottom: 1px solid #e8e8e8;
}
</style>
