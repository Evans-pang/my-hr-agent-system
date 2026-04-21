FROM node:20-slim

# 安装 SQLite 和构建工具
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    sqlite3 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 复制后端依赖
COPY mock-server/package*.json ./
RUN npm install

# 复制后端源码
COPY mock-server/ ./

# 复制前端构建产物（已预构建）
COPY mock-server/public ./public

# 创建数据目录
RUN mkdir -p /app/data

# 暴露端口
EXPOSE 8082

# 设置环境变量
ENV NODE_ENV=production
ENV PORT=8082
ENV SQLITE_DB_PATH=/app/data/hr_system.db

# 启动命令
CMD ["node", "server.js"]
