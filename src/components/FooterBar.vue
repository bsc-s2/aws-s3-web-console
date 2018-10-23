<template>
  <div class="footer-bar">
    <div>
      <slot name="left"></slot>
    </div>
    <div>
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

  & > div {
    height: 100%;
  }

  & > div:first-child {
    margin-left: 20px;
  }

  & > div:last-child {
    margin-right: 20px;
  }
}
</style>
