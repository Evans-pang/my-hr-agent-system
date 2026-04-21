// 自然语言查询解析器
// 支持本地正则解析和文心一言API增强解析

const { parseWithWenxin, calculateMatchScoreWithWenxin, batchCalculateMatchScoreWithWenxin } = require('./wenxin-nlp');

// 本地基础解析（作为后备方案）
function parseLocal(query) {
  if (!query || typeof query !== 'string') {
    return { filters: {}, keywords: [], parsed: {} };
  }

  const lowerQuery = query.toLowerCase();
  const result = {
    filters: {},
    keywords: [],
    parsed: {
      skills: [],
      experience: null,
      education: null,
      dept: null,
      position: null,
      gender: null,
      age: null,
      workYears: null,
      isKeyTalent: false
    }
  };

  // 1. 解析技能关键词
  const skillPatterns = [
    { pattern: /java/i, skill: 'Java' },
    { pattern: /spring\s*boot/i, skill: 'Spring Boot' },
    { pattern: /spring/i, skill: 'Spring' },
    { pattern: /mybatis|mybatis\s*plus/i, skill: 'MyBatis' },
    { pattern: /hibernate/i, skill: 'Hibernate' },
    { pattern: /python/i, skill: 'Python' },
    { pattern: /django/i, skill: 'Django' },
    { pattern: /flask/i, skill: 'Flask' },
    { pattern: /tensorflow/i, skill: 'TensorFlow' },
    { pattern: /pytorch/i, skill: 'PyTorch' },
    { pattern: /react/i, skill: 'React' },
    { pattern: /vue/i, skill: 'Vue' },
    { pattern: /angular/i, skill: 'Angular' },
    { pattern: /javascript|js/i, skill: 'JavaScript' },
    { pattern: /typescript|ts/i, skill: 'TypeScript' },
    { pattern: /html/i, skill: 'HTML' },
    { pattern: /css/i, skill: 'CSS' },
    { pattern: /node\.?js/i, skill: 'Node.js' },
    { pattern: /mysql/i, skill: 'MySQL' },
    { pattern: /oracle/i, skill: 'Oracle' },
    { pattern: /sql\s*server/i, skill: 'SQL Server' },
    { pattern: /postgresql|postgres/i, skill: 'PostgreSQL' },
    { pattern: /mongodb/i, skill: 'MongoDB' },
    { pattern: /redis/i, skill: 'Redis' },
    { pattern: /elasticsearch|es/i, skill: 'Elasticsearch' },
    { pattern: /hadoop/i, skill: 'Hadoop' },
    { pattern: /spark/i, skill: 'Spark' },
    { pattern: /kafka/i, skill: 'Kafka' },
    { pattern: /flink/i, skill: 'Flink' },
    { pattern: /机器学习|machine\s*learning/i, skill: '机器学习' },
    { pattern: /深度学习|deep\s*learning/i, skill: '深度学习' },
    { pattern: /nlp|自然语言处理/i, skill: 'NLP' },
    { pattern: /计算机视觉|cv/i, skill: '计算机视觉' },
    { pattern: /docker/i, skill: 'Docker' },
    { pattern: /kubernetes|k8s/i, skill: 'Kubernetes' },
    { pattern: /jenkins/i, skill: 'Jenkins' },
    { pattern: /git/i, skill: 'Git' },
    { pattern: /linux/i, skill: 'Linux' },
    { pattern: /微服务/i, skill: '微服务' },
    { pattern: /go|golang/i, skill: 'Go' },
    { pattern: /rust/i, skill: 'Rust' },
    { pattern: /c\+\+/i, skill: 'C++' },
    { pattern: /c#/i, skill: 'C#' },
    { pattern: /\.net/i, skill: '.NET' },
    { pattern: /php/i, skill: 'PHP' },
    { pattern: /ruby/i, skill: 'Ruby' }
  ];

  skillPatterns.forEach(({ pattern, skill }) => {
    if (pattern.test(lowerQuery)) {
      result.parsed.skills.push(skill);
      if (!result.keywords.includes(skill)) {
        result.keywords.push(skill);
      }
    }
  });

  // 2. 解析工作年限
  const yearPatterns = [
    { pattern: /(\d+)\s*年[以上以]?[上内]?[以]?[上内]?经验/, group: 1, type: 'min' },
    { pattern: /(\d+)\s*年[以上以]?[上内]?/, group: 1, type: 'min' },
    { pattern: /(\d+)\s*年[以]?[内]?/, group: 1, type: 'max' },
    { pattern: /(\d+)\s*-\s*(\d+)\s*年/, group: 1, group2: 2, type: 'range' },
    { pattern: /经验[丰]?[富]?/, type: 'rich' },
    { pattern: /资深|senior/i, type: 'senior' },
    { pattern: /初级|junior/i, type: 'junior' },
    { pattern: /中级|middle/i, type: 'middle' }
  ];

  for (const { pattern, group, group2, type } of yearPatterns) {
    const match = lowerQuery.match(pattern);
    if (match) {
      if (type === 'min' && group) {
        result.parsed.workYears = { min: parseInt(match[group]), max: null };
      } else if (type === 'max' && group) {
        result.parsed.workYears = { min: null, max: parseInt(match[group]) };
      } else if (type === 'range' && group && group2) {
        result.parsed.workYears = { min: parseInt(match[group]), max: parseInt(match[group2]) };
      } else if (type === 'rich') {
        result.parsed.workYears = { min: 5, max: null };
      } else if (type === 'senior') {
        result.parsed.workYears = { min: 5, max: null };
      } else if (type === 'junior') {
        result.parsed.workYears = { min: 0, max: 3 };
      } else if (type === 'middle') {
        result.parsed.workYears = { min: 3, max: 5 };
      }
      break;
    }
  }

  // 3. 解析学历要求
  const educationPatterns = [
    { pattern: /博士|doctor|phd/i, level: '博士' },
    { pattern: /硕士|研究生|master/i, level: '硕士' },
    { pattern: /本科|学士|bachelor/i, level: '本科' },
    { pattern: /大专|专科|college/i, level: '大专' }
  ];

  for (const { pattern, level } of educationPatterns) {
    if (pattern.test(lowerQuery)) {
      result.parsed.education = level;
      break;
    }
  }

  // 4. 解析部门
  const deptPatterns = [
    { pattern: /研发|开发|rd/i, dept: '研发中心' },
    { pattern: /ai|人工智能|算法/i, dept: 'AI实验室' },
    { pattern: /产品|pm/i, dept: '产品部' },
    { pattern: /测试|qa/i, dept: '质量部' },
    { pattern: /hr|人事|人力/i, dept: '人力资源部' },
    { pattern: /销售|sale/i, dept: '销售部' },
    { pattern: /运维|运营|ops/i, dept: '运维部' },
    { pattern: /设计|ui|ux/i, dept: '设计部' }
  ];

  for (const { pattern, dept } of deptPatterns) {
    if (pattern.test(lowerQuery)) {
      result.parsed.dept = dept;
      break;
    }
  }

  // 5. 解析职位
  const positionPatterns = [
    { pattern: /架构师|architect/i, position: '架构师' },
    { pattern: /算法工程师|算法/i, position: '算法工程师' },
    { pattern: /java开发|java工程师|java后端/i, position: 'Java开发工程师' },
    { pattern: /后端|后台|backend/i, position: '后端工程师' },
    { pattern: /前端|frontend/i, position: '前端工程师' },
    { pattern: /全栈|fullstack/i, position: '全栈工程师' },
    { pattern: /测试|qa/i, position: '测试工程师' },
    { pattern: /运维|devops/i, position: '运维工程师' },
    { pattern: /产品|pm/i, position: '产品经理' },
    { pattern: /项目经理|pmo/i, position: '项目经理' },
    { pattern: /hrbp|人事/i, position: 'HRBP' },
    { pattern: /销售|客户经理/i, position: '销售经理' }
  ];

  for (const { pattern, position } of positionPatterns) {
    if (pattern.test(lowerQuery)) {
      result.parsed.position = position;
      break;
    }
  }
  
  // 如果解析出了技能但没有解析出职位，尝试将技能+工程师作为职位搜索
  if (result.parsed.skills.length > 0 && !result.parsed.position) {
    // 检查查询中是否包含"开发"、"工程师"等词
    if (/开发|工程师|研发/.test(lowerQuery)) {
      // 使用技能作为职位关键词的一部分
      result.parsed.position = result.parsed.skills[0] + '开发工程师';
    }
  }

  // 6. 解析性别
  if (/男|male/i.test(lowerQuery)) {
    result.parsed.gender = 1;
  } else if (/女|female/i.test(lowerQuery)) {
    result.parsed.gender = 0;
  }

  // 7. 解析关键人才
  if (/关键|核心|骨干|精英|专家|expert|key/i.test(lowerQuery)) {
    result.parsed.isKeyTalent = true;
    result.filters.isKeyTalent = 1;
  }

  // 构建SQL查询条件
  result.filters = buildFilters(result.parsed);
  
  return result;
}

// 合并本地解析和文心一言解析结果
async function parseNaturalLanguage(query, useWenxin = true) {
  // 先进行本地解析
  const localResult = parseLocal(query);
  
  // 如果启用文心一言且配置了API Key
  if (useWenxin) {
    try {
      const wenxinResult = await parseWithWenxin(query);
      
      if (wenxinResult) {
        // 合并文心一言的解析结果（优先使用文心一言的结果）
        return {
          filters: buildFilters({
            ...localResult.parsed,
            ...wenxinResult,
            skills: wenxinResult.skills || localResult.parsed.skills,
            workYears: wenxinResult.workYears || localResult.parsed.workYears,
            education: wenxinResult.education || localResult.parsed.education,
            dept: wenxinResult.dept || localResult.parsed.dept,
            position: wenxinResult.position || localResult.parsed.position,
            gender: wenxinResult.gender !== undefined ? wenxinResult.gender : localResult.parsed.gender,
            isKeyTalent: wenxinResult.isKeyTalent || localResult.parsed.isKeyTalent
          }),
          keywords: [...localResult.keywords, ...(wenxinResult.skills || [])],
          parsed: {
            ...localResult.parsed,
            ...wenxinResult,
            intention: wenxinResult.intention || '人才搜索'
          },
          source: 'wenxin'  // 只有真正调用成功才标记为wenxin
        };
      } else {
        console.log('文心一言返回空结果，使用本地解析');
      }
    } catch (error) {
      console.error('文心一言解析失败，使用本地解析:', error.message);
    }
  }
  
  // 使用本地解析
  return { ...localResult, source: 'local' };
}

// 构建查询过滤器
function buildFilters(parsed) {
  const filters = {};

  if (parsed.skills && parsed.skills.length > 0) {
    filters.skills = parsed.skills;
  }

  if (parsed.workYears) {
    filters.workYears = parsed.workYears;
  }

  if (parsed.education) {
    filters.education = parsed.education;
  }

  if (parsed.dept) {
    filters.dept = parsed.dept;
  }

  if (parsed.position) {
    filters.position = parsed.position;
  }

  if (parsed.gender !== null && parsed.gender !== undefined) {
    filters.gender = parsed.gender;
  }
  
  if (parsed.isKeyTalent) {
    filters.isKeyTalent = 1;
  }

  return filters;
}

// 本地匹配分数计算 - 全新设计
function calculateLocalMatchScore(talent, parsed) {
  let score = 0;
  let maxScore = 0;
  let matchDetails = [];

  // 统一获取人才字段（处理下划线和驼峰命名）
  const getField = (field1, field2) => talent[field1] || talent[field2] || '';
  
  const talentPosition = (getField('position_name', 'positionName') + ' ' + getField('base_position', 'basePosition')).toLowerCase();
  const talentSkills = (getField('skill_name', 'skillName') + ' ' + getField('main_skill', 'mainSkill')).toLowerCase();
  const talentDept = (getField('organization_location', 'organizationLocation') + ' ' + getField('legal_entity', 'legalEntity')).toLowerCase();
  const talentEducation = getField('education_level', 'educationLevel');
  const talentYears = getField('work_years', 'workYears') || 0;
  const talentGender = talent.gender;
  const talentIsKey = talent.is_key_talent === 1 || talent.isKeyTalent === 1;

  // 定义变量用于后续技能匹配
  let positionMatched = false;
  let parsedPosCore = '';
  
  // 1. 职位匹配 (最高35分) - 最核心的匹配项
  if (parsed.position) {
    maxScore += 35;
    const parsedPos = parsed.position.toLowerCase();
    parsedPosCore = parsedPos.replace(/工程师|开发|高级|资深|初级|中级/g, '').trim();
    
    if (talentPosition.includes(parsedPos)) {
      // 完全包含职位关键词
      score += 35;
      positionMatched = true;
      matchDetails.push('职位完全匹配');
    } else if (talentPosition.includes(parsedPosCore) && parsedPosCore.length >= 2) {
      // 核心职位词匹配（如"运维"匹配"高级运维工程师"）
      score += 30;
      positionMatched = true;
      matchDetails.push('职位核心匹配');
    } else if (parsedPosCore.length >= 2) {
      // 检查是否部分匹配
      const posWords = parsedPosCore.split(/\s+/);
      const matchedWords = posWords.filter(word => talentPosition.includes(word));
      if (matchedWords.length > 0) {
        score += 20 * (matchedWords.length / posWords.length);
        positionMatched = true;
        matchDetails.push('职位部分匹配');
      }
    }
  }

  // 2. 技能匹配 (最高30分)
  if (parsed.skills && parsed.skills.length > 0) {
    maxScore += 30;
    let skillScore = 0;
    
    parsed.skills.forEach(skill => {
      const skillLower = skill.toLowerCase();
      if (talentSkills.includes(skillLower)) {
        skillScore += 1;
      }
    });
    
    const skillMatchRate = skillScore / parsed.skills.length;
    
    // 如果职位已经完全匹配，技能匹配采用更宽松的标准
    // 或者如果技能中包含职位相关的关键词，也给予一定分数
    let finalSkillScore = skillMatchRate * 30;
    
    // 如果技能完全不匹配，但职位完全匹配，给予基础技能分（15分）
    if (skillMatchRate === 0 && positionMatched) {
      // 检查技能中是否包含职位相关的关键词
      const positionKeywords = parsedPosCore.split(/\s+/);
      const hasRelatedSkill = positionKeywords.some(keyword => 
        keyword.length >= 2 && talentSkills.includes(keyword)
      );
      
      if (hasRelatedSkill) {
        finalSkillScore = 20; // 有相关技能给20分
        matchDetails.push('技能相关');
      } else if (parsed.position && talentPosition.includes('开发')) {
        // 如果是开发类职位，且人才也是开发类，给予基础分
        finalSkillScore = 15;
        matchDetails.push('技能类型匹配');
      }
    }
    
    score += finalSkillScore;
    
    if (skillMatchRate > 0.5) {
      matchDetails.push('技能高度匹配');
    } else if (skillMatchRate > 0) {
      matchDetails.push('技能部分匹配');
    }
  }

  // 3. 工作年限匹配 (最高15分)
  if (parsed.workYears) {
    maxScore += 15;
    const { min, max } = parsed.workYears;
    const years = parseInt(talentYears) || 0;
    
    if (min !== null && max !== null) {
      if (years >= min && years <= max) {
        score += 15;
        matchDetails.push('年限完全匹配');
      } else if (years >= min * 0.8 && years <= max * 1.2) {
        score += 8;
        matchDetails.push('年限接近匹配');
      }
    } else if (min !== null) {
      if (years >= min) {
        score += 15;
        matchDetails.push('年限满足要求');
      } else if (years >= min * 0.8) {
        score += 8;
        matchDetails.push('年限接近要求');
      }
    } else if (max !== null) {
      if (years <= max) {
        score += 15;
        matchDetails.push('年限满足要求');
      } else if (years <= max * 1.2) {
        score += 8;
        matchDetails.push('年限接近要求');
      }
    }
  }

  // 4. 学历匹配 (最高10分)
  if (parsed.education) {
    maxScore += 10;
    const educationLevels = { '博士': 5, '硕士研究生': 4, '硕士': 4, '大学本科': 3, '本科': 3, '大专': 2, '高中': 1 };
    const required = educationLevels[parsed.education] || 0;
    const actual = educationLevels[talentEducation] || 0;
    
    if (actual >= required && required > 0) {
      score += 10;
      matchDetails.push('学历满足要求');
    } else if (actual >= required - 1 && required > 0) {
      score += 5;
      matchDetails.push('学历接近要求');
    }
  }

  // 5. 部门匹配 (最高5分)
  if (parsed.dept) {
    maxScore += 5;
    if (talentDept.includes(parsed.dept.toLowerCase())) {
      score += 5;
      matchDetails.push('部门匹配');
    }
  }

  // 6. 性别匹配 (最高3分)
  if (parsed.gender !== null && parsed.gender !== undefined) {
    maxScore += 3;
    if (talentGender === parsed.gender) {
      score += 3;
      matchDetails.push('性别匹配');
    }
  }

  // 7. 关键人才匹配 (最高2分)
  if (parsed.isKeyTalent) {
    maxScore += 2;
    if (talentIsKey) {
      score += 2;
      matchDetails.push('关键人才');
    }
  }

  // 计算最终分数
  let finalScore;
  if (maxScore === 0) {
    // 没有任何筛选条件，返回基础分
    finalScore = 60;
  } else {
    // 根据匹配度计算分数
    const rawScore = Math.round((score / maxScore) * 100);
    
    // 如果没有任何匹配项，给基础分60
    if (matchDetails.length === 0) {
      finalScore = 60;
    } else {
      // 有匹配的，根据匹配质量给分
      finalScore = Math.max(rawScore, 60);
    }
  }

  // 确保分数在60-100之间
  return Math.min(Math.max(finalScore, 60), 100);
}

// 智能匹配分数计算（优先使用文心一言）
async function calculateMatchScore(talent, parsed, query, useWenxin = true) {
  // 先计算本地分数
  const localScore = calculateLocalMatchScore(talent, parsed);
  
  // 如果启用文心一言且配置了API Key，尝试使用AI评分
  if (useWenxin && query) {
    try {
      const wenxinScore = await calculateMatchScoreWithWenxin(talent, query);
      if (wenxinScore && wenxinScore.matchScore !== undefined) {
        // 综合本地分数和文心一言分数（权重各占50%）
        const combinedScore = Math.round((localScore + wenxinScore.matchScore) / 2);
        return {
          score: combinedScore,
          localScore,
          wenxinScore: wenxinScore.matchScore,
          reason: wenxinScore.reason,
          matchedSkills: wenxinScore.matchedSkills,
          missingSkills: wenxinScore.missingSkills,
          source: 'combined'
        };
      }
    } catch (error) {
      console.error('文心一言评分失败，使用本地评分:', error.message);
    }
  }
  
  return {
    score: localScore,
    localScore,
    source: 'local'
  };
}

// 批量评分（优化性能）
async function batchCalculateMatchScore(talents, parsed, query, useWenxin = true) {
  if (!useWenxin || !query) {
    // 使用本地评分
    return talents.map(t => ({
      ...t,
      matchScore: calculateLocalMatchScore(t, parsed),
      matchSource: 'local'
    }));
  }
  
  try {
    // 尝试使用文心一言批量评分
    const wenxinResults = await batchCalculateMatchScoreWithWenxin(talents, query);
    
    if (wenxinResults && wenxinResults.length > 0) {
      // 合并文心一言评分结果
      const scoreMap = new Map(wenxinResults.map(r => [r.id, r]));
      
      return talents.map(t => {
        const wenxinResult = scoreMap.get(t.id);
        const localScore = calculateLocalMatchScore(t, parsed);
        
        if (wenxinResult) {
          const combinedScore = Math.round((localScore + wenxinResult.matchScore) / 2);
          return {
            ...t,
            matchScore: combinedScore,
            localScore,
            wenxinScore: wenxinResult.matchScore,
            matchReason: wenxinResult.reason,
            matchSource: 'combined'
          };
        }
        
        return { ...t, matchScore: localScore, matchSource: 'local' };
      });
    }
  } catch (error) {
    console.error('文心一言批量评分失败:', error.message);
  }
  
  // 回退到本地评分
  return talents.map(t => ({
    ...t,
    matchScore: calculateLocalMatchScore(t, parsed),
    matchSource: 'local'
  }));
}

module.exports = {
  parseNaturalLanguage,
  calculateMatchScore,
  batchCalculateMatchScore,
  calculateLocalMatchScore
};
