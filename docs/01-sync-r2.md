# 博客周刊同步部署方案

## 概述

本脚本用于将 Cloudflare R2 存储中的 Markdown 文件同步到本地，保存为 mdx 格式。

## 环境

1. 本地缓存目录
  - 开发环境：`node_modules/.cache`
  - 生产环境：`~/.pnpm-store`
2. 远程存储 Cloudflare R2 的前缀为 `Newsletter/`，是以年份为单位的文件夹结构

## 流程

1. 获取 R2 存储中的周刊列表
2. 以文件数量为基准，比较远程和本地的文件数量，如果不一致，则下载远程文件
3. 下载远程文件到本地，修改扩展名为 `.mdx`
4. 将下载的文件复制到项目目录下的 `src/content/newsletter`
