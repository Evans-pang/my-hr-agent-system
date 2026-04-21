# 文心一言模型选择指南

## 推荐模型（按优先级排序）

### 1. ERNIE-Speed-128K ⭐ 首选推荐
```
模型名称：ernie-speed-128k
适用场景：人才搜索、简历解析、招聘需求理解
特点：
- ✅ 128K长上下文，可处理复杂查询
- ✅ 响应速度快（比4.0快3-5倍）
- ✅ 价格适中（约4.0的1/10）
- ✅ 文本理解能力强

价格参考：
- 输入：约 0.004元/千tokens
- 输出：约 0.008元/千tokens

配置方式：
set WENXIN_MODEL=ernie-speed-128k
```

### 2. ERNIE-Lite-8K 💰 免费选择
```
模型名称：ernie-lite-8k
适用场景：简单查询解析、原型测试
特点：
- ✅ 完全免费（有每日额度限制）
- ✅ 响应速度最快
- ⚠️ 能力相对较弱
- ⚠️ 8K上下文限制

限制：
- 每日免费额度有限
- 复杂语义理解能力一般

配置方式：
set WENXIN_MODEL=ernie-lite-8k
```

### 3. ERNIE-4.0-Turbo-8K 🚀 最强能力
```
模型名称：ernie-4.0-turbo-8k
适用场景：复杂招聘需求分析、人才画像生成
特点：
- ✅ 文心一言最强模型
- ✅ 深度语义理解
- ✅ 推理能力最强
- ❌ 价格较高
- ❌ 8K上下文限制

价格参考：
- 输入：约 0.03元/千tokens
- 输出：约 0.09元/千tokens

配置方式：
set WENXIN_MODEL=ernie-4.0-turbo-8k
```

## 模型对比

| 特性 | ERNIE-Speed-128K | ERNIE-Lite-8K | ERNIE-4.0-Turbo-8K |
|-----|------------------|---------------|-------------------|
| 上下文长度 | 128K | 8K | 8K |
| 响应速度 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| 理解能力 | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| 价格 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐(免费) | ⭐⭐ |
| 适用场景 | 生产环境 | 测试/原型 | 高精度需求 |

## 配置方法

### 方法1：环境变量（推荐）
```bash
# Windows
set WENXIN_API_KEY=your-api-key
set WENXIN_SECRET_KEY=your-secret-key
set WENXIN_MODEL=ernie-speed-128k

# Linux/Mac
export WENXIN_API_KEY=your-api-key
export WENXIN_SECRET_KEY=your-secret-key
export WENXIN_MODEL=ernie-speed-128k
```

### 方法2：修改代码
在 `wenxin-nlp.js` 文件中修改：
```javascript
const WENXIN_MODEL = 'ernie-speed-128k'; // 修改这里
```

## 获取API Key

1. 访问 [百度智能云](https://cloud.baidu.com/)
2. 注册/登录账号
3. 进入"千帆大模型平台"
4. 创建应用，获取 API Key 和 Secret Key
5. 开通所需模型的使用权限

## 成本估算

以 ERNIE-Speed-128K 为例：

假设每次搜索请求：
- 输入：约 500 tokens（查询+提示词）
- 输出：约 200 tokens（解析结果）

单次成本：
- 输入：500 × 0.004 / 1000 = 0.002元
- 输出：200 × 0.008 / 1000 = 0.0016元
- 总计：约 0.0036元/次

月度成本（1000次搜索）：
- 约 3.6元/月

## 使用建议

1. **开发测试阶段**：使用 ERNIE-Lite-8K（免费）
2. **生产环境**：使用 ERNIE-Speed-128K（性价比高）
3. **高精度场景**：使用 ERNIE-4.0-Turbo-8K（如人才画像生成）

## 故障处理

如果调用失败：
1. 检查 API Key 和 Secret Key 是否正确
2. 检查模型是否有使用权限
3. 检查账户余额是否充足
4. 查看百度智能云控制台的错误日志
