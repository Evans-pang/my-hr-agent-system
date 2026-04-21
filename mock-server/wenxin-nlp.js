// 文心一言API封装
// 用于自然语言理解和人才搜索意图解析
// 支持V3版本 - 使用bce-v3认证

const axios = require('axios');

// 文心一言API配置 - V3版本
// V3版本完整Key (格式: bce-v3/ALTAK-xxx/xxx)
const WENXIN_V3_KEY = process.env.WENXIN_V3_KEY || 'bce-v3/ALTAK-PVCDZ4R0hbH1DceQCTl7Q/3cd6b074b3b7d2c43ed1f486e93d65d9a0fe34aa';

// 推荐模型配置
// 可选模型: ernie-bot-4, ernie-bot, ernie-speed, ernie-lite
const WENXIN_MODEL = process.env.WENXIN_MODEL || 'ernie-bot';

// V3版本使用千帆平台的v2 API
const WENXIN_API_URL = 'https://qianfan.baidubce.com/v2/chat/completions';

// V3版本认证 - 使用Bearer Token
function generateV3AuthHeaders() {
  const timestamp = new Date().toISOString();
  const nonce = Math.random().toString(36).substring(2, 15);
  
  // V3版本使用Bearer Token方式
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${WENXIN_V3_KEY}`,
    'X-Bce-Date': timestamp,
    'X-Bce-Request-Id': nonce
  };
}

// 调用文心一言API解析自然语言查询
async function parseWithWenxin(query) {
  try {
    // 如果没有配置V3 Key，返回null使用本地解析
    if (!WENXIN_V3_KEY || WENXIN_V3_KEY === 'your-v3-key-here') {
      console.log('未配置文心一言API Key，使用本地解析');
      return null;
    }

    const headers = generateV3AuthHeaders();

    const requestBody = {
      model: WENXIN_MODEL,
      messages: [
        {
          role: 'user',
          content: `你是一位专业的人力资源助手，擅长理解人才搜索需求。
请将用户的自然语言查询解析为结构化的搜索条件。

用户查询："${query}"

请解析以下字段（以JSON格式返回）：
{
  "skills": ["技能1", "技能2"],
  "workYears": { "min": 数字或null, "max": 数字或null },
  "education": "学历要求",
  "dept": "部门",
  "position": "职位",
  "gender": 数字或null,
  "isKeyTalent": true/false,
  "intention": "搜索意图描述"
}

只返回JSON，不要其他解释。`
        }
      ],
      temperature: 0.1,
      max_tokens: 500
    };

    console.log('正在调用文心一言V3 API...');
    console.log('V3 Key:', WENXIN_V3_KEY.substring(0, 30) + '...');
    
    const response = await axios.post(WENXIN_API_URL, requestBody, {
      headers,
      timeout: 30000
    });

    const result = response.data.result;
    
    // 解析返回的JSON
    try {
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        console.log('文心一言V3解析结果:', parsed);
        return parsed;
      }
    } catch (e) {
      console.error('解析文心一言返回结果失败:', e);
    }
    
    return null;
  } catch (error) {
    console.error('调用文心一言V3 API失败:', error.message);
    if (error.response) {
      console.error('错误状态:', error.response.status);
      console.error('错误详情:', error.response.data);
    }
    return null;
  }
}

// 使用文心一言进行语义匹配评分
async function calculateMatchScoreWithWenxin(talent, query) {
  try {
    if (!WENXIN_V3_KEY || WENXIN_V3_KEY === 'your-v3-key-here') {
      return null;
    }

    const headers = generateV3AuthHeaders();

    const talentInfo = `
姓名：${talent.name || '未知'}
职位：${talent.positionName || '未知'}
部门：${talent.deptName || '未知'}
工作年限：${talent.workYears || 0}年
学历：${talent.educationLevel || '未知'}
技能：${(talent.skills || []).join(', ')}
`;

    const requestBody = {
      model: WENXIN_MODEL,
      messages: [
        {
          role: 'user',
          content: `你是一位专业的HR招聘专家，需要评估候选人与招聘需求的匹配度。

招聘需求："${query}"

候选人信息：
${talentInfo}

请评估匹配度并返回JSON格式：
{
  "matchScore": 0-100的数字,
  "reason": "评分理由简述",
  "matchedSkills": ["匹配的技能1", "匹配的技能2"],
  "missingSkills": ["缺失的技能1"]
}

只返回JSON，不要其他解释。`
        }
      ],
      temperature: 0.2,
      max_tokens: 500
    };

    const response = await axios.post(WENXIN_API_URL, requestBody, {
      headers,
      timeout: 30000
    });

    const result = response.data.result;
    
    try {
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        console.log('文心一言V3匹配评分:', parsed);
        return parsed;
      }
    } catch (e) {
      console.error('解析文心一言评分结果失败:', e);
    }
    
    return null;
  } catch (error) {
    console.error('调用文心一言V3评分失败:', error.message);
    if (error.response) {
      console.error('错误详情:', error.response.data);
    }
    return null;
  }
}

// 批量评分（优化性能，一次性评分多个候选人）
async function batchCalculateMatchScoreWithWenxin(talents, query) {
  try {
    if (!WENXIN_V3_KEY || WENXIN_V3_KEY === 'your-v3-key-here' || talents.length === 0) {
      return null;
    }

    const headers = generateV3AuthHeaders();

    // 限制批量数量，避免token超限
    const batchSize = 5;
    const batch = talents.slice(0, batchSize);
    
    const talentsInfo = batch.map((t, i) => `
候选人${i + 1}：
ID: ${t.id}
姓名：${t.name || '未知'}
职位：${t.positionName || '未知'}
部门：${t.deptName || '未知'}
工作年限：${t.workYears || 0}年
学历：${t.educationLevel || '未知'}
技能：${(t.skills || []).join(', ')}
`).join('\n---\n');

    const requestBody = {
      model: WENXIN_MODEL,
      messages: [
        {
          role: 'user',
          content: `你是一位专业的HR招聘专家，需要评估候选人与招聘需求的匹配度。

招聘需求："${query}"

候选人列表：
${talentsInfo}

请为每个候选人评估匹配度并返回JSON数组：
[
  {
    "id": 候选人ID,
    "matchScore": 0-100的数字,
    "reason": "评分理由简述"
  }
]

只返回JSON数组，不要其他解释。`
        }
      ],
      temperature: 0.2,
      max_tokens: 1000
    };

    const response = await axios.post(WENXIN_API_URL, requestBody, {
      headers,
      timeout: 30000
    });

    const result = response.data.result;
    
    try {
      const jsonMatch = result.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        console.log('文心一言V3批量评分结果:', parsed);
        return parsed;
      }
    } catch (e) {
      console.error('解析文心一言批量评分失败:', e);
    }
    
    return null;
  } catch (error) {
    console.error('调用文心一言V3批量评分失败:', error.message);
    if (error.response) {
      console.error('错误详情:', error.response.data);
    }
    return null;
  }
}

module.exports = {
  parseWithWenxin,
  calculateMatchScoreWithWenxin,
  batchCalculateMatchScoreWithWenxin
};
