const axios = require('axios');

// 文心一言API配置 - V3版本
const WENXIN_V3_KEY = 'bce-v3/ALTAK-PVCDZ4R0hbH1DceQCTl7Q/3cd6b074b3b7d2c43ed1f486e93d65d9a0fe34aa';
const WENXIN_MODEL = 'ernie-bot';
const WENXIN_API_URL = 'https://qianfan.baidubce.com/v2/chat/completions';

// V3版本认证 - 使用Bearer Token
function generateV3AuthHeaders() {
  const timestamp = new Date().toISOString();
  const nonce = Math.random().toString(36).substring(2, 15);
  
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${WENXIN_V3_KEY}`,
    'X-Bce-Date': timestamp,
    'X-Bce-Request-Id': nonce
  };
}

async function testWenxinAPI() {
  try {
    console.log('========== 测试文心一言API ==========\n');
    console.log('API Key:', WENXIN_V3_KEY.substring(0, 30) + '...');
    console.log('API URL:', WENXIN_API_URL);
    console.log('模型:', WENXIN_MODEL);
    console.log('\n正在调用API...\n');
    
    const headers = generateV3AuthHeaders();
    const requestBody = {
      model: WENXIN_MODEL,
      messages: [
        {
          role: 'user',
          content: '请解析以下人才搜索需求：找5年以上Java经验的后端工程师'
        }
      ],
      temperature: 0.1,
      max_tokens: 500
    };
    
    const response = await axios.post(WENXIN_API_URL, requestBody, {
      headers,
      timeout: 30000
    });
    
    console.log('API调用成功!');
    console.log('响应状态:', response.status);
    console.log('响应结果:', response.data.result);
    
  } catch (error) {
    console.error('API调用失败!');
    console.error('错误信息:', error.message);
    if (error.response) {
      console.error('错误状态码:', error.response.status);
      console.error('错误详情:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testWenxinAPI();
