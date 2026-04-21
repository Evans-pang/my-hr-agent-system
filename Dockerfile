# 阶段1: 构建前端
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

# 复制前端依赖文件
COPY frontend/package*.json ./
RUN npm install

# 复制前端源码
COPY frontend/ ./

# 构建前端（生产环境）
RUN npm run build

# 阶段2: 构建后端
FROM node:20-alpine AS backend

# 安装 SQLite 编译依赖
RUN apk add --no-cache python3 make g++ sqlite

WORKDIR /app

# 复制后端依赖文件
COPY mock-server/package*.json ./
RUN npm install

# 复制后端源码
COPY mock-server/ ./

# 复制前端构建产物到后端的 public 目录
COPY --from=frontend-builder /app/frontend/dist ./public

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
