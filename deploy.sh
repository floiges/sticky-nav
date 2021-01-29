#!/usr/bin/env sh

# 当发生错误时终止脚本执行
set -e

# 打包
npm run build

# 移动至打包后的 dist 目录
cd dist

git init # 因为 dist 目录默认是 ignore 的，因此进入此目录后先初始化 git
git add -A
git commit -m 'deploy'

# 部署到 https://github.com/floiges/sticky-nav.git，分支为 gh-pages
# 分支名为 gh-pages 是因为 github 部署时默认只允许三种来源(master、gh-pages、master/docs)
git push -f https://github.com/floiges/sticky-nav.git master:gh-pages

cd -