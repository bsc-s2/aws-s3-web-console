<template>
  <div class="footer-bar">
    <div class="left">
      <slot name="left"></slot>
    </div>
    <div class="right">
      <slot name="right"></slot>
    </div>
  </div>
</template>
<style lang="less" scoped>
.footer-bar {
  position: fixed;
  display: inline-flex;
  justify-content: space-between;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 50px;
  background-color: #fff;
  border-top: 1px solid #e8e8e8;
  z-index: 100;

  .left,
  .right {
    height: 100%;
  }

  .left {
    margin-left: 20px;
  }

  .right {
    margin-right: 20px;
  }
}
</style>
