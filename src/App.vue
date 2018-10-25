<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: 'app',
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
body,
html {
  margin: 0;
  height: 100%;
}
.el-aside {
  padding: 20px 0 20px 20px;
}
.el-dialog__body {
  padding: 20px 20px !important;
}
.el-form > .el-form-item:last-child {
  margin-bottom: 0;
}
</style>
