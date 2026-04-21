# HR Agent System 部署指南

## 方案：Docker + Render 免费部署

### 1. 推送代码到 Gitee

```bash
# 在 Gitee 创建新仓库（如 hr-agent-system）
# 然后执行以下命令

cd hr-agent-system-v1.0.0
git init
git add .
git commit -m "init: SQLite + Docker 改造"
git remote add origin https://gitee.com/你的用户名/hr-agent-system.git
git push -u origin master
```

### 2. 注册 Render 账号

1. 访问 https://render.com
2. 用 GitHub 或邮箱注册
3. 点击 "New" → "Web Service"

### 3. 在 Render 上部署

1. 选择 "Build and deploy from a Git repository"
2. 连接你的 Gitee 仓库（如果 Render 不支持 Gitee，可先用 GitHub 中转，或用本地上传）
3. 配置：
   - **Runtime**: Docker
   - **Branch**: master
   - **Plan**: Free
4. 点击 "Create Web Service"

### 4. 环境变量（已配置在 render.yaml 中）

| 变量 | 值 |
|------|-----|
| NODE_ENV | production |
| PORT | 8082 |
| SQLITE_DB_PATH | /app/data/hr_system.db |

### 5. 访问应用

部署完成后，Render 会提供一个公网 URL，如：
```
https://hr-agent-system-xxx.onrender.com
```

打开即可访问系统。

### 6. 注意事项

- **免费版休眠**：15分钟无访问自动休眠，下次访问需等待 10-30 秒冷启动
- **数据持久化**：SQLite 数据文件保存在磁盘卷 `/app/data`，重启不会丢失
- **单用户访问**：适合演示场景，免费版资源有限

### 7. 更新部署

代码更新后，推送到 Gitee，Render 会自动重新构建部署。
