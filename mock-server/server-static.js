// 生产环境静态文件服务
// 当 Docker 容器运行时，前端构建产物放在 public 目录下

const express = require('express');
const path = require('path');

function setupStaticFiles(app) {
  // 检查 public 目录是否存在（Docker 环境）
  const publicPath = path.join(__dirname, 'public');
  
  // 检查 index.html 是否存在
  const indexPath = path.join(publicPath, 'index.html');
  
  const fs = require('fs');
  if (fs.existsSync(indexPath)) {
    console.log('✅ 检测到前端构建产物，启用静态文件服务');
    
    // 静态文件服务
    app.use(express.static(publicPath));
    
    // 所有非 API 请求返回 index.html（支持前端路由）
    app.get('*', (req, res) => {
      if (!req.path.startsWith('/api')) {
        res.sendFile(indexPath);
      }
    });
  } else {
    console.log('ℹ️ 未检测到前端构建产物，仅提供 API 服务');
    console.log('   如需前后端一体部署，请将前端构建产物放入 public 目录');
  }
}

module.exports = { setupStaticFiles };
