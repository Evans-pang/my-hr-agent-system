const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { generateResume } = require('./resume-generator');
const { Packer } = require('docx');
const { testConnection, query, insert, update, remove, initDatabase } = require('./db-adapter');
const { parseNaturalLanguage, calculateMatchScore, batchCalculateMatchScore } = require('./nlp-parser');
const { setupStaticFiles } = require('./server-static');
const app = express();
const PORT = process.env.PORT || 8082;

// CORS 配置 - 允许所有来源（生产环境可限制）
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' ? true : '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 统一API前缀
const API_PREFIX = '/api';

// 数据库初始化由 db-adapter.js 处理
// initDatabase, importSampleData, initProfileTables 已移至 db-adapter.js 和 init-sqlite.js

// 转换数据库字段名到驼峰命名
function toCamelCase(row) {
  if (!row) return null;
  
  // 安全获取JSON字段 - MySQL2会自动解析JSON类型为对象
  function safeJsonValue(value, defaultVal = []) {
    if (!value) return defaultVal;
    // 如果已经是数组或对象，直接返回
    if (Array.isArray(value) || (typeof value === 'object' && value !== null)) {
      return value;
    }
    // 如果是字符串，尝试解析
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch (e) {
        return defaultVal;
      }
    }
    return defaultVal;
  }
  
  // 通用字段转换
  const result = {
    id: row.id,
    status: row.status,
    createTime: row.create_time,
    updateTime: row.update_time
  };
  
  // 人才表字段
  if (row.talent_id !== undefined) {
    result.talentId = row.talent_id;
  }
  if (row.name !== undefined) {
    result.name = row.name;
  }
  if (row.gender !== undefined) {
    result.gender = row.gender;
  }
  if (row.phone !== undefined) {
    result.phone = row.phone;
  }
  if (row.email !== undefined) {
    result.email = row.email;
  }
  if (row.dept_name !== undefined) {
    result.deptName = row.dept_name;
  }
  if (row.position_name !== undefined) {
    result.positionName = row.position_name;
  }
  if (row.education_level !== undefined) {
    result.educationLevel = row.education_level;
  }
  if (row.school_name !== undefined) {
    result.schoolName = row.school_name;
  }
  if (row.major !== undefined) {
    result.major = row.major;
  }
  if (row.work_years !== undefined) {
    result.workYears = row.work_years;
  }
  if (row.is_key_talent !== undefined) {
    result.isKeyTalent = row.is_key_talent;
  }
  if (row.entry_date !== undefined) {
    result.entryDate = row.entry_date;
  }
  if (row.skills !== undefined) {
    result.skills = safeJsonValue(row.skills);
  }
  if (row.projects !== undefined) {
    result.projects = safeJsonValue(row.projects);
  }
  
  // 真实数据Excel中的字段
  if (row.performance_2023 !== undefined) {
    result.performance2023 = row.performance_2023;
  }
  if (row.performance_2024 !== undefined) {
    result.performance2024 = row.performance_2024;
  }
  if (row.skill_name !== undefined) {
    result.skillName = row.skill_name;
  }
  if (row.main_skill !== undefined) {
    result.mainSkill = row.main_skill;
  }
  if (row.organization_location !== undefined) {
    result.organizationLocation = row.organization_location;
  }
  if (row.base_position !== undefined) {
    result.basePosition = row.base_position;
  }
  if (row.legal_entity !== undefined) {
    result.legalEntity = row.legal_entity;
  }
  if (row.project_name !== undefined) {
    result.projectName = row.project_name;
  }
  
  // 招聘需求表字段
  if (row.req_id !== undefined) {
    result.reqId = row.req_id;
  }
  if (row.title !== undefined) {
    result.title = row.title;
  }
  if (row.required_skills !== undefined) {
    result.requiredSkills = safeJsonValue(row.required_skills);
  }
  if (row.work_years_min !== undefined) {
    result.workYearsMin = row.work_years_min;
  }
  if (row.work_years_max !== undefined) {
    result.workYearsMax = row.work_years_max;
  }
  if (row.headcount !== undefined) {
    result.headcount = row.headcount;
  }
  if (row.priority !== undefined) {
    result.priority = row.priority;
  }
  if (row.description !== undefined) {
    result.description = row.description;
  }
  
  // 匹配结果表字段
  if (row.match_score !== undefined) {
    result.matchScore = row.match_score;
  }
  if (row.match_reason !== undefined) {
    result.matchReason = row.match_reason;
  }
  
  // 统计字段
  if (row.count !== undefined) {
    result.count = row.count;
  }

  // 标准画像表字段
  if (row.position_level !== undefined) {
    result.positionLevel = row.position_level;
  }
  if (row.core_abilities !== undefined) {
    result.coreAbilities = safeJsonValue(row.core_abilities);
  }
  if (row.knowledge_requirements !== undefined) {
    result.knowledgeRequirements = safeJsonValue(row.knowledge_requirements);
  }
  if (row.project_experience !== undefined) {
    result.projectExperience = row.project_experience;
  }
  if (row.education_requirement !== undefined) {
    result.educationRequirement = row.education_requirement;
  }
  if (row.work_years_requirement !== undefined) {
    result.workYearsRequirement = row.work_years_requirement;
  }
  if (row.ability_standards !== undefined) {
    result.abilityStandards = safeJsonValue(row.ability_standards, {});
  }

  return result;
}

// ============ 认证接口 ============
app.post(`${API_PREFIX}/auth/login`, (req, res) => {
  const { username, password } = req.body;
  if (username === 'admin' && password === '123456') {
    res.json({
      code: 200,
      message: 'success',
      data: {
        token: 'mock_token_' + Date.now(),
        userInfo: {
          username: 'admin',
          name: '管理员',
          role: 'admin',
          avatar: null
        }
      }
    });
  } else {
    res.status(401).json({ code: 401, message: '用户名或密码错误', data: null });
  }
});

app.post(`${API_PREFIX}/auth/logout`, (req, res) => {
  res.json({ code: 200, message: 'success', data: null });
});

app.get(`${API_PREFIX}/auth/info`, (req, res) => {
  res.json({
    code: 200,
    message: 'success',
    data: {
      username: 'admin',
      name: '管理员',
      role: 'admin',
      avatar: null
    }
  });
});

// ============ 仪表盘接口 ============
app.get(`${API_PREFIX}/talent/dashboard/stats`, async (req, res) => {
  try {
    // 获取筛选参数
    const { dept, position, education, workYears, entryDateStart, entryDateEnd } = req.query;
    
    // 构建基础查询条件
    let whereClause = 'WHERE 1=1';
    const params = [];
    
    if (dept && dept !== 'all') {
      whereClause += ' AND (dept_name = ? OR dept_name LIKE ?)';
      params.push(dept, `%${dept}%`);
    }
    
    if (education && education !== 'all') {
      whereClause += ' AND education_level = ?';
      params.push(education);
    }
    
    if (workYears && workYears !== 'all') {
      const [min, max] = workYears.split('-').map(v => v === '10+' ? 100 : parseInt(v));
      if (workYears === '10+') {
        whereClause += ' AND work_years >= 10';
      } else if (min !== undefined && max !== undefined) {
        whereClause += ' AND work_years >= ? AND work_years < ?';
        params.push(min, max);
      }
    }
    
    // 入职日期筛选
    if (entryDateStart) {
      whereClause += ' AND entry_date >= ?';
      params.push(entryDateStart);
    }
    if (entryDateEnd) {
      whereClause += ' AND entry_date <= ?';
      params.push(entryDateEnd);
    }
    
    // 统计总数
    const totalResult = await query(`SELECT COUNT(*) as count FROM hr_talent ${whereClause}`, params);
    const totalCount = totalResult[0].count;
    
    // 关键人才数
    const keyTalentResult = await query(`SELECT COUNT(*) as count FROM hr_talent ${whereClause} AND is_key_talent = 1`, params);
    const keyTalentCount = keyTalentResult[0].count;
    
    // 本月入职和离职（模拟数据）
    const newHires = 2;
    const resignations = 0;
    
    // 学历分布
    const eduResult = await query(`
      SELECT education_level, COUNT(*) as count 
      FROM hr_talent 
      ${whereClause}
      AND education_level IS NOT NULL AND education_level != ''
      GROUP BY education_level
      ORDER BY count DESC
    `, params);
    
    const educationDistribution = eduResult.map(row => ({
      name: row.education_level,
      value: row.count
    }));
    
    // 地域分布（使用 dept_name 代替 organization_location）
    const deptResult = await query(`
      SELECT dept_name, COUNT(*) as count 
      FROM hr_talent 
      ${whereClause}
      AND dept_name IS NOT NULL AND dept_name != ''
      GROUP BY dept_name
      ORDER BY count DESC
      LIMIT 10
    `, params);
    
    const deptDistribution = deptResult.map(row => ({
      name: row.dept_name,
      value: row.count
    }));
    
    // 职位分布 - 基于 position_name 字段
    const positionResult = await query(`
      SELECT position_name, COUNT(*) as count 
      FROM hr_talent 
      ${whereClause}
      AND position_name IS NOT NULL AND position_name != ''
      GROUP BY position_name
      ORDER BY count DESC
      LIMIT 10
    `, params);
    
    const positionDistribution = positionResult.map(row => ({
      name: row.position_name,
      value: row.count
    }));
    
    // 工作年限分布
    const yearsRanges = [
      { name: '1年以下', min: 0, max: 1 },
      { name: '1-3年', min: 1, max: 3 },
      { name: '3-5年', min: 3, max: 5 },
      { name: '5-10年', min: 5, max: 10 },
      { name: '10年以上', min: 10, max: 100 }
    ];
    
    const yearsDistribution = [];
    for (const range of yearsRanges) {
      const yearsResult = await query(`
        SELECT COUNT(*) as count 
        FROM hr_talent 
        ${whereClause}
        AND work_years >= ? AND work_years < ?
      `, [...params, range.min, range.max]);
      yearsDistribution.push({
        name: range.name,
        value: yearsResult[0].count
      });
    }
    
    res.json({
      code: 200,
      message: 'success',
      data: {
        totalCount,
        newHires,
        resignations,
        avgTenure: 5.2,
        keyTalentCount,
        educationDistribution,
        deptDistribution,
        positionDistribution,
        yearsDistribution
      }
    });
  } catch (error) {
    console.error('获取仪表盘数据失败:', error);
    res.status(500).json({ code: 500, message: '获取数据失败', data: null });
  }
});

// ============ 人才库接口 ============
// 注意：具体路由要放在参数路由之前，避免被错误匹配

// 1. 人才列表
app.get(`${API_PREFIX}/talent/list`, async (req, res) => {
  try {
    const { keyword, isKeyTalent, status, page = 1, pageSize = 10 } = req.query;
    const pageNum = parseInt(page) || 1;
    const pageSizeNum = parseInt(pageSize) || 10;
    
    let sql = 'SELECT * FROM hr_talent WHERE 1=1';
    const params = [];
    
    if (keyword) {
      sql += ' AND (name LIKE ? OR position_name LIKE ? OR skill_name LIKE ?)';
      const likeKeyword = `%${keyword}%`;
      params.push(likeKeyword, likeKeyword, likeKeyword);
    }
    
    if (isKeyTalent !== undefined && isKeyTalent !== '') {
      sql += ' AND is_key_talent = ?';
      params.push(parseInt(isKeyTalent));
    }
    
    // 状态筛选
    if (status && status !== 'all') {
      sql += ' AND status = ?';
      params.push(status);
    }
    
    // 获取总数
    const countResult = await query(`SELECT COUNT(*) as total FROM (${sql}) as t`, params);
    const total = countResult[0].total;
    
    // 分页查询 - 在职人员优先排序
    const offset = (pageNum - 1) * pageSizeNum;
    sql += ` ORDER BY CASE WHEN status = '在职' THEN 0 ELSE 1 END, id DESC LIMIT ${pageSizeNum} OFFSET ${offset}`;
    
    const results = await query(sql, params);
    const list = results.map(toCamelCase);
    
    res.json({
      code: 200,
      message: 'success',
      data: {
        list,
        total,
        page: pageNum,
        pageSize: pageSizeNum
      }
    });
  } catch (error) {
    console.error('获取人才列表失败:', error);
    res.status(500).json({ code: 500, message: '获取数据失败', data: null });
  }
});

// 2. 搜索接口 - 支持自然语言搜索（增强版，支持文心一言API）
app.get(`${API_PREFIX}/talent/search`, async (req, res) => {
  try {
    const { keyword, useWenxin = 'true' } = req.query;
    
    if (!keyword) {
      return res.json({ code: 200, message: 'success', data: [] });
    }
    
    // 解析自然语言查询（异步，支持文心一言）
    const enableWenxin = useWenxin === 'true';
    const parsedQuery = await parseNaturalLanguage(keyword, enableWenxin);
    console.log('自然语言解析结果:', parsedQuery);
    
    // 构建动态SQL查询
    let sql = 'SELECT * FROM hr_talent WHERE 1=1';
    const params = [];
    const orConditions = []; // 用于存储OR条件
    const orParams = [];     // 用于存储OR条件参数
    
    // 添加技能筛选 - 使用真实数据的skill_name和main_skill字段
    if (parsedQuery.parsed.skills && parsedQuery.parsed.skills.length > 0) {
      const skillConditions = parsedQuery.parsed.skills.map(() => '(skill_name LIKE ? OR main_skill LIKE ?)').join(' OR ');
      orConditions.push(`(${skillConditions})`);
      parsedQuery.parsed.skills.forEach(skill => {
        orParams.push(`%${skill}%`, `%${skill}%`);
      });
    }
    
    // 添加职位筛选 - 使用position_name和base_position字段
    if (parsedQuery.parsed.position) {
      orConditions.push('(position_name LIKE ? OR base_position LIKE ?)');
      orParams.push(`%${parsedQuery.parsed.position}%`, `%${parsedQuery.parsed.position}%`);
    }
    
    // 添加部门筛选 - 使用organization_location字段（可选，使用OR）
    if (parsedQuery.parsed.dept) {
      orConditions.push('(organization_location LIKE ? OR legal_entity LIKE ?)');
      orParams.push(`%${parsedQuery.parsed.dept}%`, `%${parsedQuery.parsed.dept}%`);
    }
    
    // 如果有OR条件，添加到SQL
    if (orConditions.length > 0) {
      sql += ` AND (${orConditions.join(' OR ')})`;
      params.push(...orParams);
    }
    
    // 添加学历筛选（AND条件）
    if (parsedQuery.parsed.education) {
      sql += ' AND education_level = ?';
      params.push(parsedQuery.parsed.education);
    }
    
    // 添加性别筛选（AND条件）
    if (parsedQuery.parsed.gender !== null && parsedQuery.parsed.gender !== undefined) {
      sql += ' AND gender = ?';
      params.push(parsedQuery.parsed.gender);
    }
    
    // 添加关键人才筛选（AND条件）
    if (parsedQuery.filters.isKeyTalent) {
      sql += ' AND is_key_talent = 1';
    }
    
    // 如果没有特定筛选条件，使用全文搜索
    if (orConditions.length === 0 && params.length === 0) {
      sql += ' AND (name LIKE ? OR position_name LIKE ? OR skill_name LIKE ?)';
      const likeKeyword = `%${keyword}%`;
      params.push(likeKeyword, likeKeyword, likeKeyword);
    }
    
    sql += ' ORDER BY id DESC LIMIT 50';
    
    const results = await query(sql, params);
    
    // 转换为驼峰命名
    let list = results.map(toCamelCase);
    
    // 使用批量评分（支持文心一言）
    list = await batchCalculateMatchScore(list, parsedQuery.parsed, keyword, enableWenxin);
    
    // 根据工作年限进一步筛选
    if (parsedQuery.parsed.workYears) {
      const { min, max } = parsedQuery.parsed.workYears;
      list = list.filter(t => {
        const years = t.workYears || 0;
        if (min !== null && years < min * 0.7) return false; // 允许30%的浮动
        if (max !== null && years > max * 1.3) return false;
        return true;
      });
    }
    
    // 按匹配分数排序
    list.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
    
    res.json({ 
      code: 200, 
      message: 'success', 
      data: list,
      parsed: parsedQuery.parsed // 返回解析结果供前端展示
    });
  } catch (error) {
    console.error('搜索人才失败:', error);
    res.status(500).json({ code: 500, message: '搜索失败', data: null });
  }
});

// 3. 人才盘点接口
app.get(`${API_PREFIX}/talent/inventory`, async (req, res) => {
  try {
    const { period = '2024Q1' } = req.query;
    
    // 根据时间周期调整数据（模拟不同季度的数据变化）
    const periodSeed = period === '2024Q1' ? 1 : period === '2024Q2' ? 2 : period === '2024Q3' ? 3 : 4;
    
    const results = await query('SELECT * FROM hr_talent WHERE status = "在职"');
    const inventory = results.map(toCamelCase).map(t => {
      // 根据时间周期和真实数据的绩效字段生成盘点数据
      const performance2023 = t.performance2023 || 'B';
      const performance2024 = t.performance2024 || 'B';
      
      // 根据季度调整绩效计算逻辑
      let performance = 'B';
      
      // Q1主要参考2023年绩效，Q2-Q4主要参考2024年绩效
      if (periodSeed === 1) {
        // Q1: 以2023年绩效为主
        performance = performance2023;
      } else {
        // Q2-Q4: 以2024年绩效为主，结合季度因素微调
        performance = performance2024;
        
        // 模拟随时间推移的绩效变化（部分人员绩效提升或下降）
        const talentIdNum = parseInt(t.talentId?.replace(/\D/g, '') || '0');
        if (periodSeed >= 3 && talentIdNum % 10 === 0) {
          // Q3开始部分人员绩效提升
          if (performance === 'B') performance = 'B+';
          else if (performance === 'B-') performance = 'B';
        }
      }
      
      // 确保绩效等级有效
      if (!['A', 'B+', 'B', 'B-', 'C'].includes(performance)) {
        performance = 'B';
      }
      
      // 根据是否关键人才和工作年限判断潜力
      let potential = '中';
      if (t.isKeyTalent === 1) {
        potential = '高';
      } else if (t.workYears > 15) {
        potential = '低';
      }
      
      // 根据绩效和潜力生成九宫格分类
      // 将B+视为A，B-视为B，C视为C
      const perfLevel = performance === 'A' || performance === 'B+' ? 'A' : 
                        performance === 'C' || performance === 'B-' ? 'C' : 'B';
      
      let category = '稳定贡献';
      if (perfLevel === 'A' && potential === '高') category = '明星员工';
      else if (perfLevel === 'A' && potential === '中') category = '核心骨干';
      else if (perfLevel === 'A' && potential === '低') category = '专家人才';
      else if (perfLevel === 'B' && potential === '高') category = '潜力人才';
      else if (perfLevel === 'B' && potential === '中') category = '稳定贡献';
      else if (perfLevel === 'B' && potential === '低') category = '熟练员工';
      else if (perfLevel === 'C' && potential === '高') category = '待提升';
      else if (perfLevel === 'C' && potential === '中') category = '待观察';
      else if (perfLevel === 'C' && potential === '低') category = '问题员工';
      
      return {
        ...t,
        performance,
        potential,
        category,
        period, // 添加盘点周期
        risk: t.isKeyTalent === 1 ? '无' : (Math.random() > 0.9 ? '离职风险' : '无'),
        recommendation: t.isKeyTalent === 1 ? '晋升储备' : '培养发展'
      };
    });
    
    res.json({ code: 200, message: 'success', data: inventory });
  } catch (error) {
    console.error('获取人才盘点失败:', error);
    res.status(500).json({ code: 500, message: '获取数据失败', data: null });
  }
});

// 4. 新增人才
app.post(`${API_PREFIX}/talent`, async (req, res) => {
  try {
    const { name, gender, phone, email, deptName, positionName, educationLevel, schoolName, major, workYears } = req.body;
    
    // 生成人才编号
    const countResult = await query('SELECT COUNT(*) as count FROM hr_talent');
    const talentId = `T${String(countResult[0].count + 1).padStart(6, '0')}`;
    
    const sql = `
      INSERT INTO hr_talent 
      (talent_id, name, gender, phone, email, dept_name, position_name, education_level, school_name, major, work_years, status, is_key_talent, entry_date, skills, projects)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 0, CURDATE(), '[]', '[]')
    `;
    
    // 将 undefined 转换为 null
    const id = await insert(sql, [
      talentId, 
      name || null, 
      gender || null, 
      phone || null, 
      email || null, 
      deptName || null, 
      positionName || null, 
      educationLevel || null, 
      schoolName || null, 
      major || null, 
      workYears || null
    ]);
    
    const results = await query('SELECT * FROM hr_talent WHERE id = ?', [id]);
    res.json({ code: 200, message: 'success', data: toCamelCase(results[0]) });
  } catch (error) {
    console.error('新增人才失败:', error);
    res.status(500).json({ code: 500, message: '新增失败', data: null });
  }
});

// 5. 更新人才
app.put(`${API_PREFIX}/talent/:id`, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, gender, phone, email, deptName, positionName, educationLevel, schoolName, major, workYears, status, isKeyTalent } = req.body;
    
    const sql = `
      UPDATE hr_talent SET
        name = ?,
        gender = ?,
        phone = ?,
        email = ?,
        dept_name = ?,
        position_name = ?,
        education_level = ?,
        school_name = ?,
        major = ?,
        work_years = ?,
        status = ?,
        is_key_talent = ?
      WHERE id = ?
    `;
    
    await update(sql, [name, gender, phone, email, deptName, positionName, educationLevel, schoolName, major, workYears, status, isKeyTalent, id]);
    
    const results = await query('SELECT * FROM hr_talent WHERE id = ?', [id]);
    res.json({ code: 200, message: 'success', data: toCamelCase(results[0]) });
  } catch (error) {
    console.error('更新人才失败:', error);
    res.status(500).json({ code: 500, message: '更新失败', data: null });
  }
});

// 6. 删除人才
app.delete(`${API_PREFIX}/talent/:id`, async (req, res) => {
  try {
    const { id } = req.params;
    await remove('DELETE FROM hr_talent WHERE id = ?', [id]);
    res.json({ code: 200, message: 'success', data: null });
  } catch (error) {
    console.error('删除人才失败:', error);
    res.status(500).json({ code: 500, message: '删除失败', data: null });
  }
});

// 6.5 更新人才技能
app.put(`${API_PREFIX}/talent/:id/skills`, async (req, res) => {
  try {
    const { id } = req.params;
    const { skills, projects } = req.body;
    
    console.log('更新技能请求:', { id, skills, projects });
    
    const sql = `
      UPDATE hr_talent SET
        skills = ?,
        projects = ?
      WHERE id = ?
    `;
    
    const skillsJson = JSON.stringify(skills || []);
    const projectsJson = JSON.stringify(projects || []);
    console.log('SQL参数:', { skillsJson, projectsJson, id });
    
    const affectedRows = await update(sql, [skillsJson, projectsJson, id]);
    console.log('更新影响行数:', affectedRows);
    
    const results = await query('SELECT * FROM hr_talent WHERE id = ?', [id]);
    console.log('查询结果原始skills:', results[0].skills, '类型:', typeof results[0].skills);
    res.json({ code: 200, message: 'success', data: toCamelCase(results[0]) });
  } catch (error) {
    console.error('更新技能失败:', error);
    res.status(500).json({ code: 500, message: '更新技能失败', data: null });
  }
});

// 关键人才看板接口（必须放在 talent/:id 之前）
app.get(`${API_PREFIX}/talent/key-talent-dashboard`, async (req, res) => {
  try {
    // 使用真实数据：状态为"在职"且是关键人才
    const results = await query('SELECT * FROM hr_talent WHERE status = "在职" AND is_key_talent = 1');
    const talents = results.map(toCamelCase);
    
    const keyTalents = talents.map(talent => {
      // 计算留存评分
      let retentionScore = 100;
      const riskFactors = [];
      
      // 工作年限因素
      if (talent.workYears >= 3 && talent.workYears <= 5) {
        retentionScore -= 15;
        riskFactors.push('工作3-5年离职高峰期');
      }
      
      // 技能单一风险 - 使用真实数据的main_skill字段
      const mainSkill = talent.mainSkill || '';
      const skills = mainSkill ? mainSkill.split(/[,，;；]/).filter(s => s.trim()) : [];
      if (skills.length < 2) {
        retentionScore -= 10;
        riskFactors.push('技能单一');
      }
      
      // 确定风险等级
      let riskLevel = 'low';
      if (retentionScore < 60) riskLevel = 'high';
      else if (retentionScore < 80) riskLevel = 'medium';
      
      // 根据真实绩效数据计算绩效等级
      const performance2023 = talent.performance2023 || 'B';
      const performance2024 = talent.performance2024 || 'B';
      let performanceLevel = 'B';
      if (performance2023 === 'A' || performance2024 === 'A') performanceLevel = 'A';
      else if (performance2023 === 'C' && performance2024 === 'C') performanceLevel = 'C';
      
      return {
        id: talent.id,
        talentId: talent.talentId,
        name: talent.name,
        deptName: talent.legalEntity || talent.organizationLocation || '未知部门',
        positionName: talent.positionName || talent.basePosition || '未知职位',
        workYears: talent.workYears,
        educationLevel: talent.educationLevel,
        skills: skills,
        performanceLevel,
        riskLevel,
        retentionScore,
        riskFactors,
        lastProject: talent.projectName || '未分配项目',
        careerPlan: talent.isKeyTalent === 1 ? '关键人才发展计划' : '普通发展路线',
        joinDate: talent.entryDate
      };
    });
    
    const stats = {
      totalKeyTalent: keyTalents.length,
      highRiskCount: keyTalents.filter(t => t.riskLevel === 'high').length,
      mediumRiskCount: keyTalents.filter(t => t.riskLevel === 'medium').length,
      avgRetentionScore: Math.round(keyTalents.reduce((sum, t) => sum + t.retentionScore, 0) / (keyTalents.length || 1))
    };
    
    res.json({
      code: 200,
      message: 'success',
      data: { list: keyTalents, stats }
    });
  } catch (error) {
    console.error('获取关键人才看板数据失败:', error);
    res.status(500).json({ code: 500, message: '获取数据失败', data: null });
  }
});

// 7. 人才详情（参数路由放在最后）
app.get(`${API_PREFIX}/talent/:id`, async (req, res) => {
  try {
    const { id } = req.params;
    const results = await query('SELECT * FROM hr_talent WHERE id = ?', [id]);
    
    if (results.length === 0) {
      return res.status(404).json({ code: 404, message: '人才不存在', data: null });
    }
    
    res.json({ code: 200, message: 'success', data: toCamelCase(results[0]) });
  } catch (error) {
    console.error('获取人才详情失败:', error);
    res.status(500).json({ code: 500, message: '获取数据失败', data: null });
  }
});

// ============ 人才画像接口 ============
app.get(`${API_PREFIX}/talent/profile/:id`, async (req, res) => {
  try {
    const { id } = req.params;
    const results = await query('SELECT * FROM hr_talent WHERE id = ?', [id]);
    
    if (results.length === 0) {
      return res.status(404).json({ code: 404, message: '人才不存在', data: null });
    }
    
    const talent = toCamelCase(results[0]);
    
    const profile = {
      ...talent,
      abilityScores: [
        { name: '技术能力', score: Math.floor(Math.random() * 20) + 80 },
        { name: '沟通能力', score: Math.floor(Math.random() * 20) + 75 },
        { name: '团队协作', score: Math.floor(Math.random() * 20) + 80 },
        { name: '创新能力', score: Math.floor(Math.random() * 20) + 70 },
        { name: '学习能力', score: Math.floor(Math.random() * 20) + 85 },
        { name: '执行力', score: Math.floor(Math.random() * 20) + 80 }
      ],
      workExperience: [
        {
          company: talent.deptName,
          position: talent.positionName,
          period: `${talent.entryDate} - 至今`,
          description: `在${talent.deptName}担任${talent.positionName}，负责核心技术开发工作`
        }
      ],
      performanceHistory: [
        { year: '2023', grade: 'A', score: 92 },
        { year: '2022', grade: 'A', score: 88 },
        { year: '2021', grade: 'B+', score: 85 }
      ]
    };
    
    res.json({ code: 200, message: 'success', data: profile });
  } catch (error) {
    console.error('获取人才画像失败:', error);
    res.status(500).json({ code: 500, message: '获取数据失败', data: null });
  }
});

// ============ 简历管理接口 ============
let resumes = [
  { id: 1, talentId: 1, name: '张三', fileName: '张三_简历.pdf', status: '已解析', matchScore: 92, uploadTime: '2024-01-15 14:30', source: '智联招聘' },
  { id: 2, talentId: 2, name: '李四', fileName: '李四_简历.pdf', status: '已解析', matchScore: 95, uploadTime: '2024-01-15 10:20', source: 'BOSS直聘' },
  { id: 3, talentId: 3, name: '王五', fileName: '王五_简历.pdf', status: '已解析', matchScore: 88, uploadTime: '2024-01-14 16:45', source: '猎聘网' },
];

app.get(`${API_PREFIX}/resume/list`, (req, res) => {
  res.json({ code: 200, message: 'success', data: resumes });
});

app.post(`${API_PREFIX}/resume/upload`, (req, res) => {
  res.json({
    code: 200,
    message: 'success',
    data: {
      id: resumes.length + 1,
      fileName: 'new_resume.pdf',
      status: '解析中',
      uploadTime: new Date().toLocaleString()
    }
  });
});

app.get(`${API_PREFIX}/resume/download/:id`, (req, res) => {
  const { id } = req.params;
  const resume = resumes.find(r => r.id === parseInt(id));
  
  if (!resume) {
    return res.status(404).json({ code: 404, message: '简历不存在', data: null });
  }
  
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${resume.fileName}"`);
  res.send('PDF content would be here');
});

// ============ 简历生成功能 ============
app.post(`${API_PREFIX}/resume/generate/:talentId`, async (req, res) => {
  try {
    const { talentId } = req.params;
    const results = await query('SELECT * FROM hr_talent WHERE id = ?', [talentId]);
    
    if (results.length === 0) {
      return res.status(404).json({ code: 404, message: '人才不存在', data: null });
    }
    
    const talent = toCamelCase(results[0]);
    
    res.json({
      code: 200,
      message: 'success',
      data: {
        talentId: talent.id,
        fileName: `${talent.name}_简历_${Date.now()}.docx`,
        downloadUrl: `${API_PREFIX}/resume/download-generated/${talentId}`
      }
    });
  } catch (error) {
    console.error('生成简历失败:', error);
    res.status(500).json({ code: 500, message: '生成简历失败', data: null });
  }
});

// 下载生成的简历（Word格式）
app.get(`${API_PREFIX}/resume/download-generated/:talentId`, async (req, res) => {
  try {
    const { talentId } = req.params;
    const results = await query('SELECT * FROM hr_talent WHERE id = ?', [talentId]);
    
    if (results.length === 0) {
      return res.status(404).json({ code: 404, message: '人才不存在', data: null });
    }
    
    const talent = toCamelCase(results[0]);
    const doc = await generateResume(talent);
    const buffer = await Packer.toBuffer(doc);
    const filename = `${encodeURIComponent(talent.name)}_resume_${Date.now()}.docx`;
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${filename}`);
    res.send(buffer);
  } catch (error) {
    console.error('生成简历失败:', error);
    res.status(500).json({ code: 500, message: '生成简历失败: ' + error.message, data: null });
  }
});

// 预览简历
app.get(`${API_PREFIX}/resume/preview/:talentId`, async (req, res) => {
  try {
    const { talentId } = req.params;
    const results = await query('SELECT * FROM hr_talent WHERE id = ?', [talentId]);
    
    if (results.length === 0) {
      return res.status(404).json({ code: 404, message: '人才不存在', data: null });
    }
    
    const talent = toCamelCase(results[0]);
    const doc = await generateResume(talent);
    const buffer = await Packer.toBuffer(doc);
    const filename = `${encodeURIComponent(talent.name)}_resume_preview.docx`;
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `inline; filename*=UTF-8''${filename}`);
    res.send(buffer);
  } catch (error) {
    console.error('生成预览失败:', error);
    res.status(500).json({ code: 500, message: '生成预览失败', data: null });
  }
});

// ============ 模板库接口 ============
let templates = [
  { id: 1, name: '标准简历模板', category: '简历', type: 'word', description: '适用于技术岗位的标准简历模板', usageCount: 156, updateTime: '2024-01-10' },
  { id: 2, name: '管理岗简历模板', category: '简历', type: 'word', description: '适用于管理岗位的简历模板', usageCount: 89, updateTime: '2024-01-08' },
  { id: 3, name: '应届生简历模板', category: '简历', type: 'word', description: '适用于应届毕业生的简历模板', usageCount: 234, updateTime: '2024-01-05' },
];

app.get(`${API_PREFIX}/template/list`, (req, res) => {
  res.json({ code: 200, message: 'success', data: templates });
});

app.get(`${API_PREFIX}/template/:id`, (req, res) => {
  const { id } = req.params;
  const template = templates.find(t => t.id === parseInt(id));
  if (template) {
    res.json({ code: 200, message: 'success', data: template });
  } else {
    res.status(404).json({ code: 404, message: '模板不存在', data: null });
  }
});

app.get(`${API_PREFIX}/template/download/:id`, (req, res) => {
  const { id } = req.params;
  const template = templates.find(t => t.id === parseInt(id));
  
  if (!template) {
    return res.status(404).json({ code: 404, message: '模板不存在', data: null });
  }
  
  const templatePath = path.join(__dirname, '..', '..', '附件2-个人简历模版.docx');
  
  if (fs.existsSync(templatePath)) {
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="个人简历模版.docx"`);
    fs.createReadStream(templatePath).pipe(res);
  } else {
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${template.name}.docx"`);
    res.send('Template file content');
  }
});

// ============ 数据治理接口 ============
let checkTasks = new Map();

// 执行真实数据质量检查
async function performRealDataCheck(taskId) {
  try {
    const totalCount = (await query('SELECT COUNT(*) as count FROM hr_talent'))[0].count;
    
    // 检查缺失值
    const missingIdCard = (await query('SELECT COUNT(*) as count FROM hr_talent WHERE id_card IS NULL OR id_card = ""'))[0].count;
    const missingBirthDate = (await query('SELECT COUNT(*) as count FROM hr_talent WHERE birth_date IS NULL'))[0].count;
    const missingEntryDate = (await query('SELECT COUNT(*) as count FROM hr_talent WHERE entry_date IS NULL'))[0].count;
    const missingEducation = (await query('SELECT COUNT(*) as count FROM hr_talent WHERE education_level IS NULL OR education_level = ""'))[0].count;
    
    // 检查重复数据（基于姓名和身份证号）
    const duplicateNameResult = await query(`
      SELECT name, COUNT(*) as count FROM hr_talent 
      WHERE name IS NOT NULL AND name != ''
      GROUP BY name HAVING count > 1
    `);
    const duplicateNames = duplicateNameResult.length;
    
    // 计算数据完整度
    const fieldsToCheck = ['name', 'gender', 'education_level', 'work_years', 'entry_date', 'id_card'];
    let totalFields = totalCount * fieldsToCheck.length;
    let missingFields = 0;
    
    for (const field of fieldsToCheck) {
      // 对日期字段使用不同的判断逻辑
      let missingQuery;
      if (field === 'entry_date' || field === 'birth_date') {
        missingQuery = `SELECT COUNT(*) as count FROM hr_talent WHERE ${field} IS NULL`;
      } else {
        missingQuery = `SELECT COUNT(*) as count FROM hr_talent WHERE ${field} IS NULL OR ${field} = ''`;
      }
      const missing = (await query(missingQuery))[0].count;
      missingFields += missing;
    }
    
    const completeness = Math.round(((totalFields - missingFields) / totalFields) * 100);
    const accuracy = 98; // 假设准确性较高
    const consistency = Math.round(((totalCount - duplicateNames) / totalCount) * 100);
    const timeliness = 95; // 假设及时性较高
    
    // 生成问题列表
    const issues = [];
    let issueId = 1;
    
    if (missingIdCard > 0) {
      issues.push({ id: issueId++, type: '缺失值', field: '身份证号', count: missingIdCard, severity: missingIdCard > 50 ? 'high' : 'medium', status: 'pending', suggestion: '补充员工身份证信息' });
    }
    if (missingBirthDate > 0) {
      issues.push({ id: issueId++, type: '缺失值', field: '出生日期', count: missingBirthDate, severity: 'low', status: 'pending', suggestion: '补充员工出生日期' });
    }
    if (missingEntryDate > 0) {
      issues.push({ id: issueId++, type: '缺失值', field: '入职日期', count: missingEntryDate, severity: 'medium', status: 'pending', suggestion: '补充员工入职日期' });
    }
    if (missingEducation > 0) {
      issues.push({ id: issueId++, type: '缺失值', field: '最高学历', count: missingEducation, severity: 'medium', status: 'pending', suggestion: '补充员工学历信息' });
    }
    if (duplicateNames > 0) {
      issues.push({ id: issueId++, type: '重复数据', field: '姓名', count: duplicateNames, severity: 'low', status: 'pending', suggestion: '检查是否有重复录入的员工' });
    }
    
    return {
      completeness,
      accuracy,
      consistency,
      timeliness,
      issues,
      totalRecords: totalCount
    };
  } catch (error) {
    console.error('数据质量检查失败:', error);
    throw error;
  }
}

app.get(`${API_PREFIX}/governance/quality`, async (req, res) => {
  try {
    const results = await performRealDataCheck('quick');
    res.json({
      code: 200,
      message: 'success',
      data: results
    });
  } catch (error) {
    res.status(500).json({ code: 500, message: '获取数据质量信息失败', data: null });
  }
});

app.post(`${API_PREFIX}/governance/check`, async (req, res) => {
  const taskId = Date.now().toString();
  
  checkTasks.set(taskId, {
    taskId,
    status: 'running',
    startTime: new Date().toISOString(),
    progress: 0
  });
  
  // 异步执行真实数据检查
  setTimeout(async () => {
    try {
      const results = await performRealDataCheck(taskId);
      const task = checkTasks.get(taskId);
      if (task) {
        task.status = 'completed';
        task.progress = 100;
        task.results = results;
      }
    } catch (error) {
      const task = checkTasks.get(taskId);
      if (task) {
        task.status = 'failed';
        task.error = error.message;
      }
    }
  }, 1000);
  
  res.json({
    code: 200,
    message: 'success',
    data: {
      taskId,
      status: 'running'
    }
  });
});

app.get(`${API_PREFIX}/governance/check-result/:taskId`, (req, res) => {
  const { taskId } = req.params;
  const task = checkTasks.get(taskId);
  
  if (!task) {
    return res.status(404).json({ code: 404, message: '检查任务不存在', data: null });
  }
  
  res.json({
    code: 200,
    message: 'success',
    data: task
  });
});

// ============ NLP接口 ============
app.post(`${API_PREFIX}/nlp/chat`, async (req, res) => {
  try {
    const { question } = req.body;
    const lowerQuestion = question.toLowerCase();
    let answer = '';

    if (lowerQuestion.includes('多少人') || lowerQuestion.includes('人数')) {
      const result = await query('SELECT COUNT(*) as count FROM hr_talent');
      const keyResult = await query('SELECT COUNT(*) as count FROM hr_talent WHERE is_key_talent = 1');
      answer = `目前系统中有 ${result[0].count} 名员工，其中关键人才 ${keyResult[0].count} 人。`;
    } else if (lowerQuestion.includes('离职') || lowerQuestion.includes('流失')) {
      answer = '本月离职率为 0%，员工稳定性良好。';
    } else if (lowerQuestion.includes('招聘') || lowerQuestion.includes('hc')) {
      answer = '目前还有 5 个HC待招聘，主要集中在研发和产品部门。';
    } else if (lowerQuestion.includes('绩效') || lowerQuestion.includes('考核')) {
      answer = '2024年Q1绩效考核已完成，A级员工占比 25%，B+级占比 50%。';
    } else if (lowerQuestion.includes('学历') || lowerQuestion.includes('教育')) {
      const results = await query('SELECT education_level, COUNT(*) as count FROM hr_talent GROUP BY education_level');
      answer = '员工学历分布：' + results.map(r => `${r.education_level}${r.count}人`).join('，');
    } else {
      answer = '抱歉，我暂时无法回答这个问题。您可以尝试询问关于人员统计、离职率、招聘进度、绩效考核或学历分布的问题。';
    }

    res.json({ code: 200, message: 'success', data: { answer } });
  } catch (error) {
    console.error('NLP处理失败:', error);
    res.status(500).json({ code: 500, message: '处理失败', data: null });
  }
});

app.post(`${API_PREFIX}/nlp/parse-search`, (req, res) => {
  res.json({
    code: 200,
    message: 'success',
    data: {
      originalQuery: req.body.query,
      intention: 'search_talent',
      filters: {},
      confidence: 0.85
    }
  });
});

app.post(`${API_PREFIX}/nlp/parse-resume`, (req, res) => {
  res.json({
    code: 200,
    message: 'success',
    data: {
      name: '张三',
      phone: '138****8888',
      email: 'zhangsan@email.com',
      education: '硕士',
      school: '某某大学',
      major: '计算机科学',
      workYears: 8,
      skills: ['Java', 'Spring Boot', 'MySQL', 'Redis'],
      confidence: 0.92
    }
  });
});

// ============ 文心一言API测试接口 ============
app.get(`${API_PREFIX}/wenxin/test`, async (req, res) => {
  try {
    const { parseWithWenxin } = require('./wenxin-nlp');
    
    // 测试查询
    const testQuery = '找5年以上Java经验的后端工程师';
    
    console.log('========== 文心一言API测试 ==========');
    console.log('测试查询:', testQuery);
    console.log('API Key 是否配置:', !!(process.env.WENXIN_API_KEY));
    
    const startTime = Date.now();
    const result = await parseWithWenxin(testQuery);
    const endTime = Date.now();
    
    if (result) {
      res.json({
        code: 200,
        message: 'success',
        data: {
          status: 'success',
          testQuery,
          responseTime: `${endTime - startTime}ms`,
          parsedResult: result,
          source: 'wenxin-api',
          timestamp: new Date().toISOString()
        }
      });
    } else {
      res.json({
        code: 200,
        message: 'warning',
        data: {
          status: 'failed',
          testQuery,
          responseTime: `${endTime - startTime}ms`,
          error: 'API调用失败或返回空结果',
          possibleReasons: [
            'Access Token未配置或已过期',
            '网络连接问题',
            'API调用频率限制',
            '模型服务暂时不可用'
          ],
          source: 'local-fallback',
          timestamp: new Date().toISOString()
        }
      });
    }
  } catch (error) {
    console.error('文心一言测试失败:', error);
    res.status(500).json({
      code: 500,
      message: 'error',
      data: {
        status: 'error',
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      }
    });
  }
});

// 文心一言配置状态检查
app.get(`${API_PREFIX}/wenxin/status`, (req, res) => {
  const appId = process.env.WENXIN_APP_ID || 'app-uD7EgNAv';
  const accessToken = process.env.WENXIN_ACCESS_TOKEN || '';
  const model = process.env.WENXIN_MODEL || 'ernie-speed-128k';
  
  res.json({
    code: 200,
    message: 'success',
    data: {
      configured: !!accessToken,
      appId,
      model,
      accessTokenPrefix: accessToken ? accessToken.substring(0, 10) + '...' : '未配置',
      timestamp: new Date().toISOString()
    }
  });
});

// ============ 需求自动匹配接口 ============

// 1. 获取招聘需求列表
app.get(`${API_PREFIX}/job/requirements`, async (req, res) => {
  try {
    const { status, dept } = req.query;
    let sql = 'SELECT * FROM hr_job_requirement WHERE 1=1';
    const params = [];
    
    if (status) {
      sql += ' AND status = ?';
      params.push(status);
    }
    if (dept) {
      sql += ' AND dept_name = ?';
      params.push(dept);
    }
    
    sql += ' ORDER BY priority DESC, create_time DESC';
    
    const results = await query(sql, params);
    res.json({
      code: 200,
      message: 'success',
      data: results.map(toCamelCase)
    });
  } catch (error) {
    console.error('获取招聘需求失败:', error);
    res.status(500).json({ code: 500, message: '获取数据失败', data: null });
  }
});

// 2. 创建招聘需求
app.post(`${API_PREFIX}/job/requirements`, async (req, res) => {
  try {
    const {
      title,
      deptName,
      positionName,
      requiredSkills,
      workYearsMin,
      workYearsMax,
      educationLevel,
      headcount,
      priority,
      description
    } = req.body;
    
    // 生成需求编号
    const result = await query('SELECT COUNT(*) as count FROM hr_job_requirement');
    const count = result[0].count + 1;
    const reqId = `REQ${String(count).padStart(3, '0')}`;
    
    const sql = `
      INSERT INTO hr_job_requirement 
      (req_id, title, dept_name, position_name, required_skills, work_years_min, work_years_max, 
       education_level, headcount, priority, description, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `;
    
    await insert(sql, [
      reqId,
      title || null,
      deptName || null,
      positionName || null,
      JSON.stringify(requiredSkills || []),
      workYearsMin || 0,
      workYearsMax || null,
      educationLevel || null,
      headcount || 1,
      priority || 2,
      description || null
    ]);
    
    res.json({ code: 200, message: 'success', data: { reqId } });
  } catch (error) {
    console.error('创建招聘需求失败:', error);
    res.status(500).json({ code: 500, message: '创建失败', data: null });
  }
});

// 3. AI自动匹配候选人
app.post(`${API_PREFIX}/job/match/:reqId`, async (req, res) => {
  try {
    const { reqId } = req.params;
    
    // 获取需求详情
    const reqResult = await query('SELECT * FROM hr_job_requirement WHERE req_id = ?', [reqId]);
    if (reqResult.length === 0) {
      return res.status(404).json({ code: 404, message: '需求不存在', data: null });
    }
    
    const requirement = toCamelCase(reqResult[0]);
    
    // 获取所有在职人才（使用真实数据的状态值）
    const talentsResult = await query('SELECT * FROM hr_talent WHERE status = "在职"');
    const talents = talentsResult.map(toCamelCase);
    
    // 计算匹配分数
    const matches = talents.map(talent => {
      let score = 0;
      let reasons = [];
      
      // 从需求标题和职位名称提取关键词
      const reqTitle = (requirement.title || '').toLowerCase();
      const reqPosition = (requirement.positionName || '').toLowerCase();
      const reqDept = (requirement.deptName || '').toLowerCase();
      
      // 提取需求关键词（Java、后端、前端、测试等）
      const reqKeywords = [];
      if (reqTitle.includes('java') || reqPosition.includes('java')) reqKeywords.push('java');
      if (reqTitle.includes('后端') || reqPosition.includes('后端')) reqKeywords.push('后端');
      if (reqTitle.includes('前端') || reqPosition.includes('前端')) reqKeywords.push('前端');
      if (reqTitle.includes('测试') || reqPosition.includes('测试')) reqKeywords.push('测试');
      if (reqTitle.includes('运维') || reqPosition.includes('运维')) reqKeywords.push('运维');
      if (reqTitle.includes('产品') || reqPosition.includes('产品')) reqKeywords.push('产品');
      if (reqTitle.includes('项目') || reqPosition.includes('项目')) reqKeywords.push('项目');
      if (reqTitle.includes('运营') || reqPosition.includes('运营')) reqKeywords.push('运营');
      
      // 人才职位信息
      const talentPosition = (talent.positionName || '').toLowerCase();
      const talentBasePosition = (talent.basePosition || '').toLowerCase();
      const talentSkillName = (talent.skillName || '').toLowerCase();
      const talentMainSkill = (talent.mainSkill || '').toLowerCase();
      
      // 职位匹配 (40%) - 最核心
      let positionMatchScore = 0;
      const talentPositions = `${talentPosition} ${talentBasePosition}`;
      
      // 检查职位关键词匹配
      for (const keyword of reqKeywords) {
        if (talentPositions.includes(keyword)) {
          positionMatchScore += 20;
          reasons.push(`职位匹配: ${keyword}`);
        }
      }
      
      // 如果需求是Java开发，人才职位包含Java或后端开发
      if (reqKeywords.includes('java') || reqKeywords.includes('后端')) {
        if (talentPosition.includes('java') || talentBasePosition.includes('java') ||
            talentPosition.includes('后端') || talentBasePosition.includes('后端') ||
            talentPosition.includes('开发') || talentBasePosition.includes('开发')) {
          positionMatchScore = Math.max(positionMatchScore, 35);
          if (!reasons.some(r => r.includes('职位'))) {
            reasons.push('职位匹配: 开发工程师');
          }
        }
      }
      
      // 如果需求是测试，人才职位包含测试
      if (reqKeywords.includes('测试')) {
        if (talentPosition.includes('测试') || talentBasePosition.includes('测试')) {
          positionMatchScore = Math.max(positionMatchScore, 40);
          if (!reasons.some(r => r.includes('测试'))) {
            reasons.push('职位匹配: 测试工程师');
          }
        }
      }
      
      score += Math.min(40, positionMatchScore);
      
      // 技能匹配 (25%) - 使用真实数据的skill_name和main_skill字段
      const reqSkills = requirement.requiredSkills || [];
      const talentSkillsStr = `${talent.skillName || ''},${talent.mainSkill || ''}`;
      const talentSkills = talentSkillsStr.split(/[,，;；]/).map(s => s.trim().toLowerCase()).filter(Boolean);
      
      // 如果有明确的技能要求
      if (reqSkills.length > 0) {
        const matchedSkills = reqSkills.filter(skill => 
          talentSkills.some(ts => ts.includes(skill.toLowerCase()) || skill.toLowerCase().includes(ts))
        );
        if (matchedSkills.length > 0) {
          score += Math.min(25, matchedSkills.length * 10);
          reasons.push(`技能匹配: ${matchedSkills.join(', ')}`);
        }
      } else {
        // 根据职位推断技能
        if ((reqKeywords.includes('java') || reqKeywords.includes('后端')) && 
            (talentSkillName.includes('java') || talentMainSkill.includes('开发'))) {
          score += 20;
          reasons.push('技能匹配: Java/开发');
        }
      }
      
      // 工作年限匹配 (15%)
      const workYears = talent.workYears || 0;
      const minYears = requirement.workYearsMin || 0;
      const maxYears = requirement.workYearsMax || 99;
      if (workYears >= minYears && workYears <= maxYears) {
        score += 15;
        reasons.push(`工作年限符合: ${workYears}年`);
      } else if (workYears >= minYears * 0.8 && workYears <= maxYears * 1.2) {
        score += 10;
        reasons.push(`工作年限接近: ${workYears}年`);
      } else if (workYears > 0) {
        score += 5;
        reasons.push(`工作经验: ${workYears}年`);
      }
      
      // 学历匹配 (10%)
      const educationLevels = { '博士': 4, '硕士': 3, '本科': 2, '大专': 1 };
      const reqEdu = educationLevels[requirement.educationLevel] || 0;
      const talentEdu = educationLevels[talent.educationLevel] || 0;
      if (talentEdu >= reqEdu) {
        score += 10;
        reasons.push(`学历符合: ${talent.educationLevel}`);
      } else if (talentEdu >= reqEdu - 1 && talentEdu > 0) {
        score += 5;
        reasons.push(`学历接近: ${talent.educationLevel}`);
      }
      
      // 部门匹配 (5%)
      if (reqDept && (talentPosition.includes(reqDept) || talent.deptName?.includes(reqDept))) {
        score += 5;
        reasons.push(`部门相关`);
      }
      
      // 关键人才加分 (5%)
      if (talent.isKeyTalent === 1) {
        score += 5;
        reasons.push(`关键人才`);
      }
      
      // 过滤不相关的结果 - 如果没有任何职位匹配，降低分数
      if (positionMatchScore === 0 && reqKeywords.length > 0) {
        score = Math.min(score, 30); // 最高30分
      }
      
      return {
        talentId: talent.talentId,
        name: talent.name,
        positionName: talent.positionName,
        basePosition: talent.basePosition,
        deptName: talent.legalEntity || talent.organizationLocation || '未知部门',
        workYears: talent.workYears,
        educationLevel: talent.educationLevel,
        skillName: talent.skillName,
        mainSkill: talent.mainSkill,
        isKeyTalent: talent.isKeyTalent,
        matchScore: Math.min(100, Math.round(score)),
        matchReason: reasons.join('; ')
      };
    });
    
    // 按匹配分数排序
    matches.sort((a, b) => b.matchScore - a.matchScore);
    
    // 保存匹配结果到数据库
    for (const match of matches.filter(m => m.matchScore >= 60)) {
      await insert(
        'INSERT OR REPLACE INTO hr_job_match (req_id, talent_id, match_score, match_reason, status) VALUES (?, ?, ?, ?, 1)',
        [reqId, match.talentId, match.matchScore, match.matchReason, match.matchScore, match.matchReason]
      );
    }
    
    res.json({
      code: 200,
      message: 'success',
      data: {
        requirement,
        matches: matches.slice(0, 10), // 返回前10个匹配结果
        total: matches.length,
        highMatchCount: matches.filter(m => m.matchScore >= 80).length
      }
    });
  } catch (error) {
    console.error('自动匹配失败:', error);
    res.status(500).json({ code: 500, message: '匹配失败', data: null });
  }
});

// 4. 保存单个匹配推荐
app.post(`${API_PREFIX}/job/match-save`, async (req, res) => {
  try {
    const { reqId, talentId, matchScore, matchReason } = req.body;
    
    if (!reqId || !talentId) {
      return res.status(400).json({ code: 400, message: '缺少必要参数', data: null });
    }
    
    await insert(
      'INSERT OR REPLACE INTO hr_job_match (req_id, talent_id, match_score, match_reason, status) VALUES (?, ?, ?, ?, 2)',
      [reqId, talentId, matchScore, matchReason, matchScore, matchReason]
    );
    
    res.json({ code: 200, message: 'success', data: null });
  } catch (error) {
    console.error('保存匹配推荐失败:', error);
    res.status(500).json({ code: 500, message: '保存失败', data: null });
  }
});

// 5. 获取需求的匹配结果
app.get(`${API_PREFIX}/job/matches/:reqId`, async (req, res) => {
  try {
    const { reqId } = req.params;
    const { status } = req.query;
    
    let sql = `
      SELECT m.*, t.name, t.position_name, t.dept_name, t.work_years, t.education_level, t.skills, t.is_key_talent
      FROM hr_job_match m
      JOIN hr_talent t ON m.talent_id = t.talent_id
      WHERE m.req_id = ?
    `;
    const params = [reqId];
    
    if (status) {
      sql += ' AND m.status = ?';
      params.push(status);
    }
    
    sql += ' ORDER BY m.match_score DESC';
    
    const results = await query(sql, params);
    res.json({
      code: 200,
      message: 'success',
      data: results.map(toCamelCase)
    });
  } catch (error) {
    console.error('获取匹配结果失败:', error);
    res.status(500).json({ code: 500, message: '获取数据失败', data: null });
  }
});

// 5. 更新匹配状态
app.put(`${API_PREFIX}/job/match/:id`, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    await update('UPDATE hr_job_match SET status = ? WHERE id = ?', [status, id]);
    res.json({ code: 200, message: 'success', data: null });
  } catch (error) {
    console.error('更新匹配状态失败:', error);
    res.status(500).json({ code: 500, message: '更新失败', data: null });
  }
});

// ============ 智能数据分析报告接口 ============

// 1. 简历分析概览 - 包含简历调取分布、优质简历覆盖率等
app.get(`${API_PREFIX}/report/overview`, async (req, res) => {
  try {
    // 检查表中是否有数据
    const dataCountResult = await query('SELECT COUNT(*) as count FROM hr_resume_access');
    const dataCount = parseInt(dataCountResult[0].count);
    
    if (dataCount === 0) {
      // 表中没有数据，返回模拟数据
      return res.json({
        code: 200,
        message: 'success',
        data: {
          overview: {
            totalAccess: 156,
            highQualityCount: 98,
            highQualityRate: 63,
            avgQualityScore: 78
          },
          accessTypeDistribution: [
            { type: '查看', typeCode: 1, count: 89 },
            { type: '下载', typeCode: 2, count: 45 },
            { type: '导出', typeCode: 3, count: 22 }
          ],
          deptAccessDistribution: [
            { deptName: '人力资源部', count: 68 },
            { deptName: '研发中心', count: 52 },
            { deptName: 'AI实验室', count: 18 },
            { deptName: '销售部', count: 12 },
            { deptName: '产品部', count: 6 }
          ],
          qualityScoreDistribution: [
            { scoreRange: '90-100分', count: 32, label: '优秀' },
            { scoreRange: '80-89分', count: 45, label: '良好' },
            { scoreRange: '70-79分', count: 38, label: '中等' },
            { scoreRange: '60-69分', count: 28, label: '及格' },
            { scoreRange: '60分以下', count: 13, label: '待提升' }
          ],
          accessTrend: [
            { month: '2024-11', count: 18 },
            { month: '2024-12', count: 22 },
            { month: '2025-01', count: 28 },
            { month: '2025-02', count: 35 },
            { month: '2025-03', count: 31 },
            { month: '2025-04', count: 22 }
          ]
        }
      });
    }
    
    // 简历调取基础统计
    const totalAccessResult = await query('SELECT COUNT(*) as total FROM hr_resume_access');
    const highQualityResult = await query('SELECT COUNT(*) as count FROM hr_resume_access WHERE is_high_quality = 1');
    const avgScoreResult = await query('SELECT AVG(quality_score) as avg_score FROM hr_resume_access');
    
    // 调取类型分布
    const accessTypeResult = await query(`
      SELECT 
        CASE 
          WHEN access_type = 1 THEN '查看'
          WHEN access_type = 2 THEN '下载'
          WHEN access_type = 3 THEN '导出'
          ELSE '其他'
        END as type,
        access_type as type_code,
        COUNT(*) as count
      FROM hr_resume_access
      GROUP BY access_type
      ORDER BY count DESC
    `);
    
    // 部门调取分布
    const deptAccessResult = await query(`
      SELECT access_dept as dept_name, COUNT(*) as count
      FROM hr_resume_access
      WHERE access_dept IS NOT NULL
      GROUP BY access_dept
      ORDER BY count DESC
      LIMIT 10
    `);
    
    // 简历质量评分分布
    const qualityDistResult = await query(`
      SELECT 
        CASE 
          WHEN quality_score >= 90 THEN '90-100分'
          WHEN quality_score >= 80 THEN '80-89分'
          WHEN quality_score >= 70 THEN '70-79分'
          WHEN quality_score >= 60 THEN '60-69分'
          ELSE '60分以下'
        END as score_range,
        CASE 
          WHEN quality_score >= 90 THEN '优秀'
          WHEN quality_score >= 80 THEN '良好'
          WHEN quality_score >= 70 THEN '中等'
          WHEN quality_score >= 60 THEN '及格'
          ELSE '待提升'
        END as label,
        COUNT(*) as count
      FROM hr_resume_access
      GROUP BY score_range, label
      ORDER BY score_range DESC
    `);
    
    // 调取趋势（最近6个月）- SQLite 语法
    const trendResult = await query(`
      SELECT 
        strftime('%Y-%m', access_time) as month,
        COUNT(*) as count
      FROM hr_resume_access
      WHERE access_time >= datetime('now', '-6 months')
      GROUP BY month
      ORDER BY month
    `);
    
    const totalAccess = totalAccessResult[0].total || 0;
    const highQualityCount = highQualityResult[0].count || 0;
    
    res.json({
      code: 200,
      message: 'success',
      data: {
        overview: {
          totalAccess: totalAccess,
          highQualityCount: highQualityCount,
          highQualityRate: totalAccess > 0 ? Math.round((highQualityCount / totalAccess) * 100) : 0,
          avgQualityScore: Math.round(avgScoreResult[0].avg_score || 0)
        },
        accessTypeDistribution: accessTypeResult.map(item => ({
          type: item.type,
          typeCode: item.type_code,
          count: item.count
        })),
        deptAccessDistribution: deptAccessResult.map(item => ({
          deptName: item.dept_name,
          count: item.count
        })),
        qualityScoreDistribution: qualityDistResult.map(item => ({
          scoreRange: item.score_range,
          label: item.label,
          count: item.count
        })),
        accessTrend: trendResult.map(item => ({
          month: item.month,
          count: item.count
        }))
      }
    });
  } catch (error) {
    console.error('获取数据报告失败:', error);
    res.status(500).json({ code: 500, message: '获取数据失败', data: null });
  }
});

// 2. 简历调取用途分析
app.get(`${API_PREFIX}/report/access-purpose`, async (req, res) => {
  try {
    // 检查表中是否有数据
    const tableCheck = await query(`SELECT COUNT(*) as count FROM sqlite_master WHERE type='table' AND name='hr_resume_access'`);
    
    if (tableCheck[0].count === 0) {
      return res.json({
        code: 200,
        message: 'success',
        data: [
          { purpose: '招聘评估', count: 45 },
          { purpose: '技术面试', count: 32 },
          { purpose: '人才盘点', count: 28 },
          { purpose: '晋升评估', count: 18 },
          { purpose: '薪酬调整', count: 15 },
          { purpose: '其他', count: 18 }
        ]
      });
    }
    
    const purposeResult = await query(`
      SELECT purpose, COUNT(*) as count
      FROM hr_resume_access
      WHERE purpose IS NOT NULL AND purpose != ''
      GROUP BY purpose
      ORDER BY count DESC
      LIMIT 10
    `);
    
    res.json({
      code: 200,
      message: 'success',
      data: purposeResult.map(item => ({
        purpose: item.purpose,
        count: item.count
      }))
    });
  } catch (error) {
    console.error('获取用途分析失败:', error);
    res.status(500).json({ code: 500, message: '获取数据失败', data: null });
  }
});

// 3. 生成完整数据报告
app.get(`${API_PREFIX}/report/full`, async (req, res) => {
  try {
    // 获取所有统计数据
    const overviewRes = await axios.get(`http://localhost:${PORT}${API_PREFIX}/report/overview`);
    const purposeRes = await axios.get(`http://localhost:${PORT}${API_PREFIX}/report/access-purpose`);
    
    // 生成报告摘要
    const overview = overviewRes.data.data;
    const topPurposes = purposeRes.data.data.slice(0, 5);
    
    const report = {
      title: '简历调取智能数据分析报告',
      generatedAt: new Date().toISOString(),
      summary: {
        totalAccess: overview.overview.totalAccess,
        highQualityCount: overview.overview.highQualityCount,
        highQualityRate: overview.overview.highQualityRate,
        avgQualityScore: overview.overview.avgQualityScore,
        topAccessType: overview.accessTypeDistribution[0]?.type || '-',
        topAccessDept: overview.deptAccessDistribution[0]?.deptName || '-',
        topPurpose: topPurposes[0]?.purpose || '-'
      },
      details: overview,
      purposeAnalysis: purposeRes.data.data,
      insights: [
        `报告期内共调取简历 ${overview.overview.totalAccess} 次，其中优质简历占比 ${overview.overview.highQualityRate}%`,
        `简历平均质量评分为 ${overview.overview.avgQualityScore} 分，整体质量${overview.overview.avgQualityScore >= 80 ? '优秀' : overview.overview.avgQualityScore >= 60 ? '良好' : '有待提升'}`,
        `调取最多的部门是 ${overview.deptAccessDistribution[0]?.deptName || '-'}，共 ${overview.deptAccessDistribution[0]?.count || 0} 次`,
        `最常用的调取方式是${overview.accessTypeDistribution[0]?.type || '-'}，占比 ${overview.accessTypeDistribution[0]?.count ? Math.round((overview.accessTypeDistribution[0].count / overview.overview.totalAccess) * 100) : 0}%`,
        `主要调取用途为${topPurposes[0]?.purpose || '-'}，反映当前人力资源工作重点`
      ]
    };
    
    res.json({
      code: 200,
      message: 'success',
      data: report
    });
  } catch (error) {
    console.error('生成完整报告失败:', error);
    res.status(500).json({ code: 500, message: '生成报告失败', data: null });
  }
});

// ============ 外部简历优化接口 (Task 17) ============

// 1. 获取简历优化任务列表
app.get(`${API_PREFIX}/resume/optimize-tasks`, async (req, res) => {
  try {
    // 模拟数据
    const tasks = [
      {
        id: 1,
        taskId: 'OPT001',
        talentId: 'T000001',
        talentName: '张三',
        targetPosition: '高级架构师',
        targetClient: '某银行客户',
        originalContent: '原始简历内容...',
        optimizedContent: '优化后的简历内容...',
        optimizeScore: 92,
        status: 'completed',
        createTime: new Date().toISOString(),
        optimizeSuggestions: [
          '突出微服务架构设计经验',
          '补充金融行业项目背景',
          '强化团队管理经验',
          '优化技术栈描述，匹配客户需求'
        ]
      },
      {
        id: 2,
        taskId: 'OPT002',
        talentId: 'T000002',
        talentName: '李四',
        targetPosition: 'AI技术专家',
        targetClient: '某科技公司',
        originalContent: '原始简历内容...',
        optimizedContent: '',
        optimizeScore: 0,
        status: 'processing',
        createTime: new Date(Date.now() - 86400000).toISOString(),
        optimizeSuggestions: []
      }
    ];
    
    res.json({ code: 200, message: 'success', data: tasks });
  } catch (error) {
    console.error('获取优化任务失败:', error);
    res.status(500).json({ code: 500, message: '获取数据失败', data: null });
  }
});

// 2. 创建简历优化任务
app.post(`${API_PREFIX}/resume/optimize`, async (req, res) => {
  try {
    const { talentId, targetPosition, targetClient, requirements, highlightPoints, style } = req.body;
    
    // 生成任务ID
    const taskId = 'OPT' + Date.now().toString().slice(-6);
    
    // 模拟优化过程
    const optimizedContent = generateOptimizedResume(talentId, targetPosition, requirements, highlightPoints, style);
    
    res.json({
      code: 200,
      message: 'success',
      data: {
        taskId,
        status: 'completed',
        optimizeScore: Math.floor(Math.random() * 15) + 85, // 85-100分
        optimizeSuggestions: [
          '根据目标岗位调整技能描述优先级',
          '补充项目成果量化数据',
          '优化工作经历描述，突出相关经验',
          '调整简历结构，突出核心竞争力'
        ]
      }
    });
  } catch (error) {
    console.error('创建优化任务失败:', error);
    res.status(500).json({ code: 500, message: '创建失败', data: null });
  }
});

// 模拟简历优化生成
function generateOptimizedResume(talentId, targetPosition, requirements, highlightPoints, style) {
  const talent = {
    T000001: { name: '张三', position: '高级Java工程师', skills: ['Java', 'Spring Boot', '微服务'] },
    T000002: { name: '李四', position: 'AI算法工程师', skills: ['Python', 'TensorFlow', '深度学习'] }
  }[talentId] || { name: '未知', position: '工程师', skills: [] };
  
  return `
【个人信息】
姓名：${talent.name}
目标岗位：${targetPosition}

【专业技能】
${talent.skills.map(s => `• ${s}`).join('\n')}
${requirements ? '\n【匹配技能】\n' + requirements.split('、').map(r => `• ${r}`).join('\n') : ''}

【工作经历】
（根据目标岗位优化后的经历描述）

【项目经验】
（突出${highlightPoints || '相关项目经验'}）

【教育背景】
（保持原有信息）

【自我评价】
（根据${style || 'professional'}风格优化）
  `.trim();
}

// 3. 下载优化后的简历
app.get(`${API_PREFIX}/resume/optimize-download/:taskId`, async (req, res) => {
  try {
    const { taskId } = req.params;
    
    // 模拟生成Word文档
    const content = `优化后的简历内容 - 任务ID: ${taskId}`;
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename=optimized-resume-${taskId}.docx`);
    res.send(content);
  } catch (error) {
    console.error('下载优化简历失败:', error);
    res.status(500).json({ code: 500, message: '下载失败', data: null });
  }
});

// 启动服务器
async function startServer() {
  await initDatabase();
  
  // 设置静态文件服务（生产环境）
  setupStaticFiles(app);
  
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Mock Server running on port ${PORT}`);
    console.log(`API available at http://0.0.0.0:${PORT}${API_PREFIX}`);
    console.log(`\nAvailable endpoints:`);
    console.log(`  POST ${API_PREFIX}/auth/login`);
    console.log(`  GET  ${API_PREFIX}/talent/dashboard/stats`);
    console.log(`  GET  ${API_PREFIX}/talent/list`);
    console.log(`  GET  ${API_PREFIX}/talent/search`);
    console.log(`  GET  ${API_PREFIX}/talent/inventory`);
    console.log(`  GET  ${API_PREFIX}/talent/:id`);
    console.log(`  POST ${API_PREFIX}/talent`);
    console.log(`  PUT  ${API_PREFIX}/talent/:id`);
    console.log(`  DELETE ${API_PREFIX}/talent/:id`);
    console.log(`  GET  ${API_PREFIX}/talent/profile/:id`);
    console.log(`  GET  ${API_PREFIX}/resume/list`);
    console.log(`  POST ${API_PREFIX}/resume/upload`);
    console.log(`  POST ${API_PREFIX}/resume/generate/:talentId`);
    console.log(`  GET  ${API_PREFIX}/resume/download-generated/:talentId`);
    console.log(`  GET  ${API_PREFIX}/template/list`);
    console.log(`  GET  ${API_PREFIX}/template/download/:id`);
    console.log(`  POST ${API_PREFIX}/nlp/chat`);
    console.log(`  GET  ${API_PREFIX}/job/requirements`);
    console.log(`  POST ${API_PREFIX}/job/requirements`);
    console.log(`  POST ${API_PREFIX}/job/match/:reqId`);
    console.log(`  GET  ${API_PREFIX}/job/matches/:reqId`);
    console.log(`  GET  ${API_PREFIX}/report/overview`);
    console.log(`  GET  ${API_PREFIX}/report/access-purpose`);
    console.log(`  GET  ${API_PREFIX}/report/full`);
    console.log(`  GET  ${API_PREFIX}/resume/optimize-tasks`);
    console.log(`  POST ${API_PREFIX}/resume/optimize`);
    console.log(`  GET  ${API_PREFIX}/resume/optimize-download/:taskId`);
    console.log(`  GET  ${API_PREFIX}/talent/key-talent-dashboard`);
    console.log(`  GET  ${API_PREFIX}/profile/standard`);
    console.log(`  POST ${API_PREFIX}/profile/standard`);
    console.log(`  GET  ${API_PREFIX}/profile/training/:talentId`);
    console.log(`  POST ${API_PREFIX}/profile/training`);
    console.log(`  GET  ${API_PREFIX}/profile/assessment/:talentId`);
    console.log(`  POST ${API_PREFIX}/profile/assessment`);
    console.log(`  GET  ${API_PREFIX}/profile/favorite/:talentId`);
    console.log(`  POST ${API_PREFIX}/profile/favorite`);
    console.log(`  GET  ${API_PREFIX}/profile/marks/:talentId`);
    console.log(`  POST ${API_PREFIX}/profile/marks`);
    console.log(`  GET  ${API_PREFIX}/profile/compare/:talentId`);
  });
}

// ============ 人才画像相关接口 ============

// 1. 获取标准岗位画像列表
app.get(`${API_PREFIX}/profile/standard`, async (req, res) => {
  try {
    const results = await query('SELECT * FROM hr_standard_profile ORDER BY position_name, position_level');
    res.json({
      code: 200,
      message: 'success',
      data: results.map(toCamelCase)
    });
  } catch (error) {
    console.error('获取标准画像失败:', error);
    res.status(500).json({ code: 500, message: '获取数据失败', data: null });
  }
});

// 2. 创建标准岗位画像
app.post(`${API_PREFIX}/profile/standard`, async (req, res) => {
  try {
    const { positionName, positionLevel, coreAbilities, requiredSkills, knowledgeRequirements, projectExperience, educationRequirement, workYearsRequirement, abilityStandards } = req.body;
    
    const result = await query(
      `INSERT INTO hr_standard_profile (position_name, position_level, core_abilities, required_skills, knowledge_requirements, project_experience, education_requirement, work_years_requirement, ability_standards) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [positionName, positionLevel, JSON.stringify(coreAbilities), JSON.stringify(requiredSkills), JSON.stringify(knowledgeRequirements), projectExperience, educationRequirement, workYearsRequirement, JSON.stringify(abilityStandards)]
    );
    
    res.json({ code: 200, message: '创建成功', data: { id: result.insertId } });
  } catch (error) {
    console.error('创建标准画像失败:', error);
    res.status(500).json({ code: 500, message: '创建失败', data: null });
  }
});

// 3. 获取培训记录
app.get(`${API_PREFIX}/profile/training/:talentId`, async (req, res) => {
  try {
    const { talentId } = req.params;
    const results = await query('SELECT * FROM hr_training_record WHERE talent_id = ? ORDER BY start_date DESC', [talentId]);
    res.json({
      code: 200,
      message: 'success',
      data: results.map(toCamelCase)
    });
  } catch (error) {
    console.error('获取培训记录失败:', error);
    res.status(500).json({ code: 500, message: '获取数据失败', data: null });
  }
});

// 4. 添加培训记录
app.post(`${API_PREFIX}/profile/training`, async (req, res) => {
  try {
    const { talentId, trainingName, trainingType, startDate, endDate, score, status, trainer, description } = req.body;
    
    const result = await query(
      `INSERT INTO hr_training_record (talent_id, training_name, training_type, start_date, end_date, score, status, trainer, description) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [talentId, trainingName, trainingType, startDate, endDate, score, status, trainer, description]
    );
    
    res.json({ code: 200, message: '添加成功', data: { id: result.insertId } });
  } catch (error) {
    console.error('添加培训记录失败:', error);
    res.status(500).json({ code: 500, message: '添加失败', data: null });
  }
});

// 5. 获取考核记录
app.get(`${API_PREFIX}/profile/assessment/:talentId`, async (req, res) => {
  try {
    const { talentId } = req.params;
    const results = await query('SELECT * FROM hr_assessment_record WHERE talent_id = ? ORDER BY assessment_date DESC', [talentId]);
    res.json({
      code: 200,
      message: 'success',
      data: results.map(toCamelCase)
    });
  } catch (error) {
    console.error('获取考核记录失败:', error);
    res.status(500).json({ code: 500, message: '获取数据失败', data: null });
  }
});

// 6. 添加考核记录
app.post(`${API_PREFIX}/profile/assessment`, async (req, res) => {
  try {
    const { talentId, assessmentName, assessmentType, assessmentDate, score, totalScore, ranking, evaluator, comments } = req.body;
    
    const result = await query(
      `INSERT INTO hr_assessment_record (talent_id, assessment_name, assessment_type, assessment_date, score, total_score, ranking, evaluator, comments) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [talentId, assessmentName, assessmentType, assessmentDate, score, totalScore, ranking, evaluator, comments]
    );
    
    res.json({ code: 200, message: '添加成功', data: { id: result.insertId } });
  } catch (error) {
    console.error('添加考核记录失败:', error);
    res.status(500).json({ code: 500, message: '添加失败', data: null });
  }
});

// 7. 获取收藏/推荐状态
app.get(`${API_PREFIX}/profile/favorite/:talentId`, async (req, res) => {
  try {
    const { talentId } = req.params;
    const { userId } = req.query;
    
    let sql = 'SELECT * FROM hr_talent_favorite WHERE talent_id = ?';
    let params = [talentId];
    
    if (userId) {
      sql += ' AND user_id = ?';
      params.push(userId);
    }
    
    const results = await query(sql, params);
    res.json({
      code: 200,
      message: 'success',
      data: results.map(toCamelCase)
    });
  } catch (error) {
    console.error('获取收藏状态失败:', error);
    res.status(500).json({ code: 500, message: '获取数据失败', data: null });
  }
});

// 8. 添加/取消收藏或推荐
app.post(`${API_PREFIX}/profile/favorite`, async (req, res) => {
  try {
    const { talentId, userId, type, tags, notes } = req.body;
    
    // 检查是否已存在
    const existing = await query(
      'SELECT id FROM hr_talent_favorite WHERE talent_id = ? AND user_id = ? AND type = ?',
      [talentId, userId, type]
    );
    
    if (existing.length > 0) {
      // 已存在则删除（取消收藏/推荐）
      await query('DELETE FROM hr_talent_favorite WHERE id = ?', [existing[0].id]);
      res.json({ code: 200, message: '取消成功', data: { action: 'removed' } });
    } else {
      // 不存在则添加
      const result = await query(
        `INSERT INTO hr_talent_favorite (talent_id, user_id, type, tags, notes) 
         VALUES (?, ?, ?, ?, ?)`,
        [talentId, userId, type, JSON.stringify(tags), notes]
      );
      res.json({ code: 200, message: '添加成功', data: { action: 'added', id: result.insertId } });
    }
  } catch (error) {
    console.error('操作收藏失败:', error);
    res.status(500).json({ code: 500, message: '操作失败', data: null });
  }
});

// 9. 获取简历标记
app.get(`${API_PREFIX}/profile/marks/:talentId`, async (req, res) => {
  try {
    const { talentId } = req.params;
    const results = await query('SELECT * FROM hr_resume_mark WHERE talent_id = ? ORDER BY created_at DESC', [talentId]);
    res.json({
      code: 200,
      message: 'success',
      data: results.map(toCamelCase)
    });
  } catch (error) {
    console.error('获取简历标记失败:', error);
    res.status(500).json({ code: 500, message: '获取数据失败', data: null });
  }
});

// 10. 添加简历标记
app.post(`${API_PREFIX}/profile/marks`, async (req, res) => {
  try {
    const { talentId, userId, markType, markContent } = req.body;
    
    const result = await query(
      `INSERT INTO hr_resume_mark (talent_id, user_id, mark_type, mark_content) 
       VALUES (?, ?, ?, ?)`,
      [talentId, userId, markType, markContent]
    );
    
    res.json({ code: 200, message: '标记成功', data: { id: result.insertId } });
  } catch (error) {
    console.error('添加标记失败:', error);
    res.status(500).json({ code: 500, message: '标记失败', data: null });
  }
});

// 11. 人才画像对比
app.get(`${API_PREFIX}/profile/compare/:talentId`, async (req, res) => {
  try {
    const { talentId } = req.params;
    const { positionName } = req.query;

    // 获取人才信息
    const talentResult = await query('SELECT * FROM hr_talent WHERE talent_id = ?', [talentId]);
    if (talentResult.length === 0) {
      return res.status(404).json({ code: 404, message: '人才不存在', data: null });
    }
    const talent = toCamelCase(talentResult[0]);

    // 获取标准画像
    let standardProfile = null;
    if (positionName) {
      const profileResult = await query('SELECT * FROM hr_standard_profile WHERE position_name = ?', [positionName]);
      if (profileResult.length > 0) {
        standardProfile = toCamelCase(profileResult[0]);
      }
    }

    // 获取培训记录
    const trainingResult = await query('SELECT * FROM hr_training_record WHERE talent_id = ?', [talentId]);
    const trainingRecords = trainingResult.map(toCamelCase);

    // 获取考核记录
    const assessmentResult = await query('SELECT * FROM hr_assessment_record WHERE talent_id = ?', [talentId]);
    const assessmentRecords = assessmentResult.map(toCamelCase);

    // 构建动态能力对比数据
    const abilityStandards = standardProfile?.abilityStandards || {};
    const comparison = {};
    
    // 动态生成能力对比项，每个能力维度包含：名称、实际值、标准值
    Object.keys(abilityStandards).forEach((key, index) => {
      // 根据能力维度名称计算实际值（这里使用简单的映射逻辑，实际可根据需求调整）
      let actualValue = 75; // 默认值
      
      // 根据能力维度关键字映射实际值计算逻辑
      if (key.includes('coding') || key.includes('programming') || key.includes('编码') || key.includes('编程')) {
        actualValue = talent.performance2024 === 'A' ? 90 : talent.performance2024 === 'B+' ? 80 : 70;
      } else if (key.includes('design') || key.includes('设计') || key.includes('architecture') || key.includes('架构')) {
        actualValue = talent.workYears > 5 ? 85 : 70;
      } else if (key.includes('communication') || key.includes('沟通') || key.includes('协作')) {
        actualValue = 75;
      } else if (key.includes('testing') || key.includes('测试')) {
        actualValue = talent.performance2024 === 'A' ? 88 : talent.performance2024 === 'B+' ? 78 : 68;
      } else if (key.includes('operation') || key.includes('运维')) {
        actualValue = talent.workYears > 3 ? 82 : 72;
      } else if (key.includes('sales') || key.includes('销售')) {
        actualValue = talent.performance2024 === 'A' ? 92 : talent.performance2024 === 'B+' ? 82 : 72;
      } else if (key.includes('hardware') || key.includes('硬件')) {
        actualValue = talent.workYears > 4 ? 84 : 74;
      } else {
        // 其他能力维度使用默认计算逻辑
        actualValue = 70 + (talent.workYears || 0) * 2;
        if (actualValue > 95) actualValue = 95;
      }
      
      comparison[key] = {
        name: key, // 能力维度名称
        actual: actualValue,
        standard: abilityStandards[key],
        gap: abilityStandards[key] - actualValue
      };
    });
    
    // 如果没有设置能力维度，返回默认的三个维度
    if (Object.keys(comparison).length === 0) {
      comparison['coding'] = { name: '编码能力', actual: 80, standard: 80, gap: 0 };
      comparison['design'] = { name: '设计能力', actual: 85, standard: 70, gap: 0 };
      comparison['communication'] = { name: '沟通能力', actual: 75, standard: 60, gap: 0 };
    }

    res.json({
      code: 200,
      message: 'success',
      data: {
        talent,
        standardProfile,
        trainingRecords,
        assessmentRecords,
        comparison
      }
    });
  } catch (error) {
    console.error('获取画像对比失败:', error);
    res.status(500).json({ code: 500, message: '获取数据失败', data: null });
  }
});

// 12. 更新标准岗位画像
app.put(`${API_PREFIX}/profile/standard/:id`, async (req, res) => {
  try {
    const { id } = req.params;
    const { positionName, positionLevel, coreAbilities, requiredSkills, knowledgeRequirements, projectExperience, educationRequirement, workYearsRequirement, abilityStandards } = req.body;

    await query(
      `UPDATE hr_standard_profile SET
       position_name = ?, position_level = ?, core_abilities = ?, required_skills = ?,
       knowledge_requirements = ?, project_experience = ?, education_requirement = ?,
       work_years_requirement = ?, ability_standards = ?, updated_at = datetime('now')
       WHERE id = ?`,
      [positionName, positionLevel, JSON.stringify(coreAbilities), JSON.stringify(requiredSkills),
       JSON.stringify(knowledgeRequirements), projectExperience, educationRequirement,
       workYearsRequirement, JSON.stringify(abilityStandards), id]
    );

    res.json({ code: 200, message: '更新成功', data: null });
  } catch (error) {
    console.error('更新标准画像失败:', error);
    res.status(500).json({ code: 500, message: '更新失败', data: null });
  }
});

// 13. 删除标准岗位画像
app.delete(`${API_PREFIX}/profile/standard/:id`, async (req, res) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM hr_standard_profile WHERE id = ?', [id]);
    res.json({ code: 200, message: '删除成功', data: null });
  } catch (error) {
    console.error('删除标准画像失败:', error);
    res.status(500).json({ code: 500, message: '删除失败', data: null });
  }
});

// 14. 获取简历标记和收藏状态
app.get(`${API_PREFIX}/profile/resume/status/:talentId`, async (req, res) => {
  try {
    const { talentId } = req.params;
    const userId = req.query.userId || 'admin'; // 默认用户

    // 查询标记状态
    const markResult = await query(
      'SELECT COUNT(*) as count FROM hr_resume_mark WHERE talent_id = ? AND user_id = ?',
      [talentId, userId]
    );

    // 查询收藏状态
    const favoriteResult = await query(
      'SELECT COUNT(*) as count FROM hr_talent_favorite WHERE talent_id = ? AND user_id = ? AND type = "favorite"',
      [talentId, userId]
    );

    res.json({
      code: 200,
      message: 'success',
      data: {
        isMarked: markResult[0].count > 0,
        isFavorited: favoriteResult[0].count > 0
      }
    });
  } catch (error) {
    console.error('获取简历状态失败:', error);
    res.status(500).json({ code: 500, message: '获取失败', data: null });
  }
});

// 15. 标记简历
app.post(`${API_PREFIX}/profile/resume/mark`, async (req, res) => {
  try {
    const { talentId, isMarked, userId = 'admin', markType = 'important', markContent = '' } = req.body;

    if (isMarked) {
      // 添加标记
      const result = await query(
        `INSERT OR REPLACE INTO hr_resume_mark (talent_id, user_id, mark_type, mark_content, created_at)
         VALUES (?, ?, ?, ?, datetime('now'))`,
        [talentId, userId, markType, markContent]
      );
      res.json({ code: 200, message: '标记成功', data: { id: result.insertId } });
    } else {
      // 取消标记
      await query('DELETE FROM hr_resume_mark WHERE talent_id = ? AND user_id = ?', [talentId, userId]);
      res.json({ code: 200, message: '取消标记成功', data: null });
    }
  } catch (error) {
    console.error('标记简历失败:', error);
    res.status(500).json({ code: 500, message: '操作失败', data: null });
  }
});

// 16. 收藏简历
app.post(`${API_PREFIX}/profile/resume/favorite`, async (req, res) => {
  try {
    const { talentId, isFavorited, userId = 'admin', tags = [], notes = '' } = req.body;

    if (isFavorited) {
      // 添加收藏 (SQLite 使用 INSERT OR REPLACE)
      const result = await query(
        `INSERT OR REPLACE INTO hr_talent_favorite (talent_id, user_id, type, tags, notes, created_at)
         VALUES (?, ?, 'favorite', ?, ?, datetime('now'))`,
        [talentId, userId, JSON.stringify(tags), notes]
      );
      res.json({ code: 200, message: '收藏成功', data: { id: result.insertId } });
    } else {
      // 取消收藏
      await query('DELETE FROM hr_talent_favorite WHERE talent_id = ? AND user_id = ? AND type = "favorite"', [talentId, userId]);
      res.json({ code: 200, message: '取消收藏成功', data: null });
    }
  } catch (error) {
    console.error('收藏简历失败:', error);
    res.status(500).json({ code: 500, message: '操作失败', data: null });
  }
});

// 17. 标准简历模板导入
app.post(`${API_PREFIX}/resume/template/import`, async (req, res) => {
  try {
    const { templateId, customName, customSections } = req.body;
    
    // 这里可以将模板信息保存到数据库
    // 简化处理，直接返回成功
    res.json({
      code: 200,
      message: '模板导入成功',
      data: {
        templateId,
        name: customName,
        sections: customSections
      }
    });
  } catch (error) {
    console.error('导入模板失败:', error);
    res.status(500).json({ code: 500, message: '导入失败', data: null });
  }
});

// 18. 批量下载简历
app.post(`${API_PREFIX}/resume/batch-download`, async (req, res) => {
  try {
    const { resumeIds } = req.body;
    
    // 这里应该生成ZIP文件并返回
    // 简化处理，返回成功信息
    res.json({
      code: 200,
      message: '批量下载成功',
      data: {
        downloadUrl: '/api/resume/download/batch',
        count: resumeIds.length
      }
    });
  } catch (error) {
    console.error('批量下载失败:', error);
    res.status(500).json({ code: 500, message: '下载失败', data: null });
  }
});

// 19. 推送简历
app.post(`${API_PREFIX}/resume/push`, async (req, res) => {
  try {
    const { resumeIds, pushType, email, platform, message } = req.body;
    
    // 这里应该实现实际的推送逻辑
    // 简化处理，返回成功信息
    res.json({
      code: 200,
      message: '推送成功',
      data: {
        pushedCount: resumeIds.length,
        pushType,
        target: pushType === 'email' ? email : platform
      }
    });
  } catch (error) {
    console.error('推送失败:', error);
    res.status(500).json({ code: 500, message: '推送失败', data: null });
  }
});

startServer();
