# Gian 个人博客管理端

![typescript](https://img.shields.io/badge/typescript-4.0.5-brightgreen) ![mobx](https://img.shields.io/badge/mobx-5.15.7-brightgreen) ![react](https://img.shields.io/badge/react-16.14.0-brightgreen) ![antd](https://img.shields.io/badge/antd-4.8.0-brightgreen) ![graphql](https://img.shields.io/badge/graphql-15.4.0-brightgreen) ![highlight.js](https://img.shields.io/badge/highlight.js-10.3.2-brightgreen) ![markdown-it](https://img.shields.io/badge/markdown--it-11.0.1-brightgreen) ![react-router-dom](https://img.shields.io/badge/react--router--dom-5.2.0-brightgreen) ![craco](https://img.shields.io/badge/craco-5.8.0-brightgreen) ![less](https://img.shields.io/badge/less-3.12.2-brightgreen)

# 欢迎 😁start，fork，watch⭐~

## 效果图(多图预警!!!)

登录效果图

![登录效果图](screens/login.png "登录效果图")

列表页效果图

![列表页效果图](screens/list.png "列表页效果图")

编辑效果图

![编辑效果图](screens/details.png "编辑png效果图")

全屏编辑效果图

![全屏编辑效果图](screens/fullscreendetails.png "全屏编辑效果图")

添加效果图

![编辑效果图](screens/details2.png "添加png效果图")

全屏添加效果图

![编辑效果图](screens/fullscreendetails2.png "添加png效果图")

## 技术栈

- typescript
- mobx
- craco
- react
- react-router-dom
- antd
- graphql
- highlight.js
- markdown-it
- less

## 开发步骤

1. 安装本项目依赖的 API 项目或者自行开发
2. 打开命令行终端并进入项目根目录
3. 创建.env.local 文件 `cp .env.local.template .env.local`
4. 更新.env.local 文件中的环境变量：

   GENERATE_SOURCEMAP=true(production 环境下最好为 false)

   REACT_APP_API_HOST=运行 API 的主机 IP

   REACT_APP_API_PORT=API 运行端口

   REACT_APP_CLIENT_ID=API 端配置的客户端编号

   REACT_APP_CLIENT_SECRET=API 端配置的客户端密钥

5. 安装项目依赖,终端里运行 `npm i` or `yarn`
6. 开始吧 😁,终端里运行 `npm run dev` or `yarn run dev`

## 生产模式下运行

`npm run build && npm run start` or `yarn run build && yarn run start`

## pm2 部署

```bash
bash start.sh
```
