<h2 align="center">白山云存储基于 AWS S3 标准开发的存储文件管理平台</h2>
<p align="center"><b>为 S3 文件管理提供一个简单方便的选择</b></p>

<div align="center">

![](https://ss.bscstorage.com/front-end-resource/WX20181106-164439.png)

</div>

### 特性

- 支持所有基于 `aws-s3` 标准开发的存储系统
- 基于 `AWS JS API` 开发，支持桶和文件的管理
- 使用 `Vue + Element UI` 进行开发，可拓展性强
- 专业存储厂商开发团队支持

### 已实现功能

- 使用 `accessKey & secretKey` 登录管理平台
- 新建、删除 bucket, 获取 bucket 列表
- bucket 中的 `ACL` `CORS` 配置
- 上传文件、删除文件、按文件夹浏览文件列表

### Todo

- 文件管理方向
  - 文件列表翻页
  - 文件列表检索
  - 文件粒度的 `ACL` `CORS` 配置
  - 图片文件预览
  - 文件下载
  - 文件重命名
  - 生成文件地址

- 帐号方向
  - 实现多种登录方式

- 交互方向
  - 列表视图/图标视图切换

- ...

### Tips

- 本地 `aws-sdk` 处理文件上传请求签名功能，其他请求使用 [aws-node-server](https://github.com/bsc-s2/aws-s3-node-server) 作为中间层发送给 S3 服务器, 该项目也已经开源，目前源码中的地址为测试用服务器且配置较低，请求可能出现失败的情况
- `ak & sk` 会保存在 `sessionStorage` 中
