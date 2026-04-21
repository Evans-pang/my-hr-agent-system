# 文心一言API Key配置说明

## 问题说明

您提供的Key格式 `bce-v3/ALTAK-PVCDZ4R0hbH1DceQCTl7Q/3cd6b074b3b7d2c43ed1f486e93d65d9a0fe34aa` 是百度智能云的**Access Key**，但调用文心一言API需要的是**API Key**和**Secret Key**。

## 正确的Key格式

文心一言API需要以下两个值：

1. **API Key** (client_id) - 格式如：`9s4ZGFjRjfOYKj9GxG2vGqG5`
2. **Secret Key** (client_secret) - 格式如：`rK2vL8nX5mP3qR7sT9uW2yZ4`

## 获取正确的API Key步骤

### 方法1：通过百度智能云控制台获取

1. 访问 [百度智能云控制台](https://console.bce.baidu.com/)
2. 登录您的账号
3. 点击右上角头像 → "安全认证"
4. 在左侧菜单选择"Access Key管理"
5. 您会看到类似这样的信息：
   ```
   Access Key ID: bce-v3/ALTAK-xxxxx
   Secret Access Key: xxxxxxxxxx
   ```

**注意**：这里的Secret Access Key才是调用API需要的Secret Key。

### 方法2：通过千帆大模型平台获取（推荐）

1. 访问 [千帆大模型平台](https://console.bce.baidu.com/qianfan/overview)
2. 登录账号
3. 点击左侧菜单 "应用接入" → "创建应用"
4. 填写应用名称和描述
5. 创建后会获得：
   ```
   API Key: xxxxxxxxxxxxxxxx
   Secret Key: xxxxxxxxxxxxxxxx
   ```

### 方法3：使用Access Token直接调用

如果您只有Access Key，可以使用以下方式获取Access Token：

```bash
curl -X POST "https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=您的AccessKey&client_secret=您的SecretKey"
```

## 配置方法

获取到正确的API Key和Secret Key后，有以下配置方式：

### 方式1：修改代码文件（当前使用）

编辑 `wenxin-nlp.js` 文件：

```javascript
const WENXIN_API_KEY = '您的API Key';
const WENXIN_SECRET_KEY = '您的Secret Key';
```

### 方式2：环境变量（推荐）

Windows:
```cmd
set WENXIN_API_KEY=您的API Key
set WENXIN_SECRET_KEY=您的Secret Key
```

Linux/Mac:
```bash
export WENXIN_API_KEY=您的API Key
export WENXIN_SECRET_KEY=您的Secret Key
```

### 方式3：.env文件

创建 `.env` 文件：
```
WENXIN_API_KEY=您的API Key
WENXIN_SECRET_KEY=您的Secret Key
```

## 验证配置

配置完成后，重启服务并测试：

```bash
# 重启服务
cd mock-server
npm start

# 测试API
curl "http://localhost:8082/api/talent/search?keyword=Python&useWenxin=true"
```

如果配置正确，您应该能看到日志输出：
```
正在获取Access Token...
Access Token获取成功
文心一言解析结果: {...}
```

## 常见问题

### 1. 401错误 - 认证失败
- 原因：API Key或Secret Key不正确
- 解决：检查Key是否正确，是否有多余空格

### 2. 403错误 - 没有权限
- 原因：账号没有开通文心一言服务
- 解决：在千帆大模型平台开通相应模型的使用权限

### 3. 429错误 - 请求过于频繁
- 原因：超过了API调用频率限制
- 解决：降低请求频率，或升级服务套餐

## 需要帮助？

如果仍有问题，可以：
1. 查看百度智能云官方文档：https://cloud.baidu.com/doc/WENXINWORKSHOP/index.html
2. 联系百度智能云客服
3. 检查账户余额是否充足
