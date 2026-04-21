# 人力资源智能体系统 (HR Agent System)

## 🎯 项目概述

企业级人力资源智能管理平台，基于AI技术实现人才精准匹配、智能画像与数据治理一体化。

## 📁 项目结构

```
hr-agent-system/
├── backend/                 # Spring Boot 后端
│   ├── src/main/java/      # Java源代码
│   │   └── com/company/hr/
│   │       ├── config/     # 配置类
│   │       ├── controller/ # API控制器
│   │       ├── entity/     # 实体类
│   │       ├── mapper/     # MyBatis映射器
│   │       ├── service/    # 业务逻辑
│   │       └── vo/         # 视图对象
│   ├── src/main/resources/ # 配置文件
│   └── pom.xml             # Maven配置
├── frontend/               # React 前端
│   ├── src/
│   │   ├── components/     # 公共组件
│   │   ├── pages/          # 页面组件
│   │   └── api/            # API接口
│   ├── package.json
│   └── index.html
├── database/               # 数据库脚本
│   └── schema.sql          # 建表脚本
└── docs/                   # 文档
```

## 🛠️ 技术栈

### 后端
- **框架**: Spring Boot 3.2.0
- **数据库**: MySQL 8.0
- **ORM**: MyBatis-Plus 3.5.5
- **安全**: Spring Security + JWT
- **缓存**: Redis
- **JDK**: Java 21

### 前端
- **框架**: React 18 + TypeScript
- **UI库**: Ant Design 5.x
- **图表**: ECharts 5.x
- **构建**: Vite 5.x
- **状态管理**: Zustand

## 🚀 快速开始

### 1. 数据库初始化

```bash
# 使用MySQL客户端执行
mysql -u root -p123456 -P 3306 workspace_management < database/schema.sql
```

### 2. 启动后端服务

```bash
cd backend
mvn clean install
mvn spring-boot:run
```

后端服务将运行在: http://localhost:8080/api

### 3. 启动前端服务

```bash
cd frontend
npm install
npm run dev
```

前端服务将运行在: http://localhost:5173

## 📋 已实现功能

### ✅ 后端API
- [x] 人才CRUD接口
- [x] 仪表盘统计数据接口
- [x] 人才搜索接口
- [x] 统一响应格式封装

### ✅ 前端页面
- [x] 数据仪表盘（统计卡片+图表）
- [x] 人才库列表
- [x] 侧边栏导航
- [x] 响应式布局

### ✅ 数据库
- [x] 人才主表
- [x] 教育背景表
- [x] 工作履历表
- [x] 技能表
- [x] 用户权限表
- [x] 数据质量规则表

## 📊 系统功能模块

| 模块 | 功能 | 状态 |
|------|------|------|
| 人才看板 | 数据仪表盘、分析报告 | ✅ |
| 智能搜索 | 自然语言搜索、匹配推荐 | ✅ |
| 人才画像 | 能力雷达图、九宫格盘点 | ✅ |
| 简历管理 | 模板库、批量下载 | ✅ |
| 数据治理 | 质量检测、错误修复 | ✅ |
| 系统设置 | 用户权限、API配置 | ✅ |

## 🔧 配置说明

### 数据库配置 (application.yml)
```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/workspace_management
    username: root
    password: 123456
```

### 前端代理配置 (vite.config.ts)
```typescript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8080',
      changeOrigin: true
    }
  }
}
```

## 📝 API文档

### 人才管理接口

| 接口 | 方法 | 说明 |
|------|------|------|
| /api/talent/list | GET | 获取人才列表 |
| /api/talent/search | GET | 搜索人才 |
| /api/talent/{id} | GET | 获取人才详情 |
| /api/talent | POST | 新增人才 |
| /api/talent/{id} | PUT | 更新人才 |
| /api/talent/{id} | DELETE | 删除人才 |
| /api/talent/dashboard/stats | GET | 仪表盘统计 |

## 🎨 界面预览

系统界面参考原型图: `../prototype/index.html`

## 📌 后续优化

1. **NLP集成**: 接入阿里/百度NLP API实现智能搜索
2. **知识图谱**: 构建人才关系图谱
3. **机器学习**: 智能匹配算法优化
4. **移动端适配**: 完善响应式设计
5. **性能优化**: 数据库索引优化、缓存策略

## 👥 开发团队

- 架构设计: AI Assistant
- 后端开发: AI Assistant
- 前端开发: AI Assistant

## 📄 许可证

内部项目，未经授权不得外传。

---

**创建时间**: 2026-04-09  
**版本**: V1.0.0
