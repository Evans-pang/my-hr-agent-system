const { db, query } = require('./db-sqlite');

// 初始化 SQLite 数据库表结构
function initSQLiteTables() {
  console.log('========== 开始初始化 SQLite 数据库 ==========');

  // 1. 人才主表
  db.exec(`
    CREATE TABLE IF NOT EXISTS hr_talent (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      talent_id VARCHAR(32) NOT NULL UNIQUE,
      e_code VARCHAR(32),
      employee_no VARCHAR(32),
      name VARCHAR(64) NOT NULL,
      gender INTEGER,
      birth_date DATE,
      phone VARCHAR(256),
      email VARCHAR(128),
      id_card VARCHAR(256),
      status INTEGER DEFAULT 1,
      dept_id INTEGER,
      dept_name VARCHAR(64),
      position_id INTEGER,
      position_name VARCHAR(64),
      entry_date DATE,
      leave_date DATE,
      work_years DECIMAL(4,1),
      education_level VARCHAR(32),
      school_name VARCHAR(128),
      major VARCHAR(64),
      is_985_211 INTEGER DEFAULT 0,
      is_key_talent INTEGER DEFAULT 0,
      talent_type VARCHAR(32),
      resume_url VARCHAR(256),
      avatar_url VARCHAR(256),
      skills TEXT,
      projects TEXT,
      create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
      update_time DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_talent_dept ON hr_talent(dept_id);
    CREATE INDEX IF NOT EXISTS idx_talent_position ON hr_talent(position_id);
    CREATE INDEX IF NOT EXISTS idx_talent_status ON hr_talent(status);
    CREATE INDEX IF NOT EXISTS idx_talent_key ON hr_talent(is_key_talent);
  `);
  console.log('✅ hr_talent 表创建完成');

  // 2. 教育背景表
  db.exec(`
    CREATE TABLE IF NOT EXISTS hr_education (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      talent_id VARCHAR(32) NOT NULL,
      school_name VARCHAR(128) NOT NULL,
      major VARCHAR(64),
      education_level VARCHAR(32),
      education_type VARCHAR(32),
      is_985_211 INTEGER DEFAULT 0,
      start_date DATE,
      end_date DATE,
      is_graduated INTEGER DEFAULT 1,
      sort_order INTEGER DEFAULT 0,
      create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
      update_time DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_edu_talent ON hr_education(talent_id);
  `);
  console.log('✅ hr_education 表创建完成');

  // 3. 工作履历表
  db.exec(`
    CREATE TABLE IF NOT EXISTS hr_work_experience (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      talent_id VARCHAR(32) NOT NULL,
      company_name VARCHAR(128) NOT NULL,
      position_name VARCHAR(64),
      department VARCHAR(64),
      job_description TEXT,
      start_date DATE,
      end_date DATE,
      is_current INTEGER DEFAULT 0,
      industry VARCHAR(64),
      sort_order INTEGER DEFAULT 0,
      create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
      update_time DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_work_talent ON hr_work_experience(talent_id);
  `);
  console.log('✅ hr_work_experience 表创建完成');

  // 4. 项目经历表
  db.exec(`
    CREATE TABLE IF NOT EXISTS hr_project_experience (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      talent_id VARCHAR(32) NOT NULL,
      project_name VARCHAR(128) NOT NULL,
      project_type VARCHAR(64),
      project_role VARCHAR(64),
      project_description TEXT,
      project_achievement TEXT,
      start_date DATE,
      end_date DATE,
      team_size INTEGER,
      skill_tags VARCHAR(512),
      sort_order INTEGER DEFAULT 0,
      create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
      update_time DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_project_talent ON hr_project_experience(talent_id);
  `);
  console.log('✅ hr_project_experience 表创建完成');

  // 5. 技能表
  db.exec(`
    CREATE TABLE IF NOT EXISTS hr_skill (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      talent_id VARCHAR(32) NOT NULL,
      skill_name VARCHAR(64) NOT NULL,
      skill_level VARCHAR(32),
      skill_category VARCHAR(64),
      years_of_experience DECIMAL(3,1),
      is_primary INTEGER DEFAULT 0,
      create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
      update_time DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_skill_talent ON hr_skill(talent_id);
    CREATE INDEX IF NOT EXISTS idx_skill_name ON hr_skill(skill_name);
  `);
  console.log('✅ hr_skill 表创建完成');

  // 6. 证书认证表
  db.exec(`
    CREATE TABLE IF NOT EXISTS hr_certification (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      talent_id VARCHAR(32) NOT NULL,
      cert_name VARCHAR(128) NOT NULL,
      cert_org VARCHAR(128),
      cert_no VARCHAR(64),
      issue_date DATE,
      expire_date DATE,
      cert_url VARCHAR(256),
      status INTEGER DEFAULT 1,
      create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
      update_time DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_cert_talent ON hr_certification(talent_id);
  `);
  console.log('✅ hr_certification 表创建完成');

  // 7. 部门表
  db.exec(`
    CREATE TABLE IF NOT EXISTS sys_department (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      dept_code VARCHAR(32) NOT NULL UNIQUE,
      dept_name VARCHAR(64) NOT NULL,
      parent_id INTEGER DEFAULT 0,
      dept_level INTEGER DEFAULT 1,
      sort_order INTEGER DEFAULT 0,
      status INTEGER DEFAULT 1,
      create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
      update_time DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_dept_parent ON sys_department(parent_id);
  `);
  console.log('✅ sys_department 表创建完成');

  // 8. 岗位表
  db.exec(`
    CREATE TABLE IF NOT EXISTS sys_position (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      position_code VARCHAR(32) NOT NULL UNIQUE,
      position_name VARCHAR(64) NOT NULL,
      position_type VARCHAR(32),
      dept_id INTEGER,
      status INTEGER DEFAULT 1,
      create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
      update_time DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_pos_dept ON sys_position(dept_id);
  `);
  console.log('✅ sys_position 表创建完成');

  // 9. 用户表
  db.exec(`
    CREATE TABLE IF NOT EXISTS sys_user (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username VARCHAR(64) NOT NULL UNIQUE,
      password VARCHAR(128) NOT NULL,
      real_name VARCHAR(64),
      email VARCHAR(128),
      phone VARCHAR(32),
      avatar VARCHAR(256),
      status INTEGER DEFAULT 1,
      create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
      update_time DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log('✅ sys_user 表创建完成');

  // 10. 角色表
  db.exec(`
    CREATE TABLE IF NOT EXISTS sys_role (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      role_code VARCHAR(32) NOT NULL UNIQUE,
      role_name VARCHAR(64) NOT NULL,
      description VARCHAR(256),
      status INTEGER DEFAULT 1,
      create_time DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log('✅ sys_role 表创建完成');

  // 11. 用户角色关联表
  db.exec(`
    CREATE TABLE IF NOT EXISTS sys_user_role (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      role_id INTEGER NOT NULL,
      UNIQUE(user_id, role_id)
    );
  `);
  console.log('✅ sys_user_role 表创建完成');

  // 12. 招聘需求表
  db.exec(`
    CREATE TABLE IF NOT EXISTS hr_job_requirement (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      req_id VARCHAR(32) NOT NULL UNIQUE,
      title VARCHAR(200) NOT NULL,
      dept_name VARCHAR(100),
      position_name VARCHAR(100),
      required_skills TEXT,
      work_years_min INTEGER DEFAULT 0,
      work_years_max INTEGER,
      education_level VARCHAR(20),
      headcount INTEGER DEFAULT 1,
      priority INTEGER DEFAULT 1,
      status INTEGER DEFAULT 1,
      description TEXT,
      create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
      update_time DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log('✅ hr_job_requirement 表创建完成');

  // 13. 需求匹配结果表
  db.exec(`
    CREATE TABLE IF NOT EXISTS hr_job_match (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      req_id VARCHAR(32) NOT NULL,
      talent_id VARCHAR(32) NOT NULL,
      match_score INTEGER DEFAULT 0,
      match_reason TEXT,
      status INTEGER DEFAULT 1,
      create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
      update_time DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(req_id, talent_id)
    );
  `);
  console.log('✅ hr_job_match 表创建完成');

  // 14. 简历调取记录表
  db.exec(`
    CREATE TABLE IF NOT EXISTS hr_resume_access (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      talent_id VARCHAR(32) NOT NULL,
      user_id VARCHAR(50),
      access_purpose VARCHAR(200),
      access_time DATETIME DEFAULT CURRENT_TIMESTAMP,
      ip_address VARCHAR(50)
    );
  `);
  console.log('✅ hr_resume_access 表创建完成');

  // 15. 人才画像表
  db.exec(`
    CREATE TABLE IF NOT EXISTS hr_talent_profile (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      profile_id VARCHAR(32) NOT NULL UNIQUE,
      talent_id VARCHAR(32) NOT NULL,
      profile_type INTEGER DEFAULT 2,
      tech_ability_score INTEGER DEFAULT 0,
      project_exp_score INTEGER DEFAULT 0,
      soft_skill_score INTEGER DEFAULT 0,
      edu_bg_score INTEGER DEFAULT 0,
      overall_score INTEGER DEFAULT 0,
      skill_tags TEXT,
      strength_points TEXT,
      weakness_points TEXT,
      match_score DECIMAL(5,2),
      match_tags VARCHAR(512),
      performance_level VARCHAR(32),
      potential_level VARCHAR(32),
      nine_box_position VARCHAR(32),
      version INTEGER DEFAULT 1,
      is_current INTEGER DEFAULT 1,
      create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
      update_time DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_profile_talent ON hr_talent_profile(talent_id);
  `);
  console.log('✅ hr_talent_profile 表创建完成');

  // 16. 标准岗位画像表
  db.exec(`
    CREATE TABLE IF NOT EXISTS hr_standard_profile (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      position_name VARCHAR(100) NOT NULL,
      position_level VARCHAR(50),
      core_abilities TEXT,
      required_skills TEXT,
      knowledge_requirements TEXT,
      project_experience TEXT,
      education_requirement VARCHAR(50),
      work_years_requirement INTEGER,
      ability_standards TEXT,
      created_by VARCHAR(50),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(position_name, position_level)
    );
  `);
  console.log('✅ hr_standard_profile 表创建完成');

  // 17. 培训记录表
  db.exec(`
    CREATE TABLE IF NOT EXISTS hr_training_record (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      talent_id VARCHAR(50) NOT NULL,
      training_name VARCHAR(200) NOT NULL,
      training_type VARCHAR(50),
      start_date DATE,
      end_date DATE,
      score DECIMAL(5,2),
      status VARCHAR(20),
      trainer VARCHAR(100),
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_training_talent ON hr_training_record(talent_id);
  `);
  console.log('✅ hr_training_record 表创建完成');

  // 18. 考核记录表
  db.exec(`
    CREATE TABLE IF NOT EXISTS hr_assessment_record (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      talent_id VARCHAR(50) NOT NULL,
      assessment_name VARCHAR(200) NOT NULL,
      assessment_type VARCHAR(50),
      assessment_date DATE,
      score DECIMAL(5,2),
      total_score DECIMAL(5,2),
      ranking VARCHAR(20),
      evaluator VARCHAR(100),
      comments TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_assessment_talent ON hr_assessment_record(talent_id);
  `);
  console.log('✅ hr_assessment_record 表创建完成');

  // 19. 人才收藏/推荐表
  db.exec(`
    CREATE TABLE IF NOT EXISTS hr_talent_favorite (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      talent_id VARCHAR(50) NOT NULL,
      user_id VARCHAR(50) NOT NULL,
      type VARCHAR(20),
      tags TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(talent_id, user_id, type)
    );
    CREATE INDEX IF NOT EXISTS idx_fav_user ON hr_talent_favorite(user_id);
  `);
  console.log('✅ hr_talent_favorite 表创建完成');

  // 20. 简历标记表
  db.exec(`
    CREATE TABLE IF NOT EXISTS hr_resume_mark (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      talent_id VARCHAR(50) NOT NULL,
      user_id VARCHAR(50) NOT NULL,
      mark_type VARCHAR(50),
      mark_content TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_mark_talent ON hr_resume_mark(talent_id);
    CREATE INDEX IF NOT EXISTS idx_mark_user ON hr_resume_mark(user_id);
  `);
  console.log('✅ hr_resume_mark 表创建完成');

  // 21. 简历模板表
  db.exec(`
    CREATE TABLE IF NOT EXISTS hr_resume_template (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      template_name VARCHAR(100) NOT NULL,
      template_type VARCHAR(50),
      description TEXT,
      file_url VARCHAR(256),
      preview_url VARCHAR(256),
      is_default INTEGER DEFAULT 0,
      status INTEGER DEFAULT 1,
      create_time DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log('✅ hr_resume_template 表创建完成');

  // 22. 生成简历记录表
  db.exec(`
    CREATE TABLE IF NOT EXISTS hr_generated_resume (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      talent_id VARCHAR(32) NOT NULL,
      template_id INTEGER,
      file_name VARCHAR(200),
      file_url VARCHAR(256),
      file_size INTEGER,
      generated_by VARCHAR(50),
      create_time DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log('✅ hr_generated_resume 表创建完成');

  // 23. 数据质量规则表
  db.exec(`
    CREATE TABLE IF NOT EXISTS hr_data_quality_rule (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      rule_name VARCHAR(100) NOT NULL,
      rule_type VARCHAR(50),
      target_table VARCHAR(64),
      target_field VARCHAR(64),
      rule_config TEXT,
      status INTEGER DEFAULT 1,
      create_time DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log('✅ hr_data_quality_rule 表创建完成');

  // 24. 数据质量问题表
  db.exec(`
    CREATE TABLE IF NOT EXISTS hr_data_quality_issue (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      rule_id INTEGER,
      talent_id VARCHAR(32),
      issue_type VARCHAR(50),
      issue_desc TEXT,
      severity VARCHAR(20),
      status INTEGER DEFAULT 0,
      create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
      resolve_time DATETIME
    );
  `);
  console.log('✅ hr_data_quality_issue 表创建完成');

  // 25. 操作日志表
  db.exec(`
    CREATE TABLE IF NOT EXISTS sys_operation_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id VARCHAR(50),
      username VARCHAR(64),
      operation VARCHAR(200),
      method VARCHAR(20),
      url VARCHAR(500),
      ip_address VARCHAR(50),
      params TEXT,
      result TEXT,
      duration INTEGER,
      create_time DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log('✅ sys_operation_log 表创建完成');

  console.log('========== SQLite 数据库表初始化完成 ==========');
}

// 插入示例数据
function insertSampleData() {
  console.log('========== 开始插入示例数据 ==========');

  // 检查是否已有数据
  const count = db.prepare('SELECT COUNT(*) as count FROM hr_talent').get();
  if (count.count > 0) {
    console.log(`✅ 人才表已有 ${count.count} 条数据，跳过示例数据插入`);
    return;
  }

  // 插入示例人才数据
  const insertTalent = db.prepare(`
    INSERT INTO hr_talent (talent_id, name, gender, phone, email, dept_name, position_name, education_level, school_name, major, work_years, status, is_key_talent, entry_date, skills, projects)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const talents = [
    { talent_id: 'T000001', name: '张三', gender: 1, phone: '13800138001', email: 'zhangsan@company.com', dept_name: '研发中心', position_name: '高级Java工程师', education_level: '硕士', school_name: '清华大学', major: '计算机科学', work_years: 8, status: 1, is_key_talent: 1, entry_date: '2021-03-15', skills: '["Java", "Spring Boot", "MySQL", "Redis", "微服务"]', projects: '[{"name": "电商平台重构", "role": "技术负责人", "period": "2022-2023"}]' },
    { talent_id: 'T000002', name: '李四', gender: 1, phone: '13800138002', email: 'lisi@company.com', dept_name: 'AI实验室', position_name: 'AI算法工程师', education_level: '博士', school_name: '北京大学', major: '人工智能', work_years: 5, status: 1, is_key_talent: 1, entry_date: '2022-06-20', skills: '["Python", "TensorFlow", "PyTorch", "NLP", "计算机视觉"]', projects: '[{"name": "智能推荐系统", "role": "核心开发", "period": "2022-2023"}]' },
    { talent_id: 'T000003', name: '王五', gender: 0, phone: '13800138003', email: 'wangwu@company.com', dept_name: '产品部', position_name: '产品经理', education_level: '本科', school_name: '复旦大学', major: '工商管理', work_years: 6, status: 1, is_key_talent: 0, entry_date: '2020-11-08', skills: '["产品设计", "数据分析", "Axure", "用户研究"]', projects: '[{"name": "移动端APP", "role": "产品经理", "period": "2021-2022"}]' },
    { talent_id: 'T000004', name: '赵六', gender: 1, phone: '13800138004', email: 'zhaoliu@company.com', dept_name: '研发中心', position_name: '前端工程师', education_level: '本科', school_name: '浙江大学', major: '软件工程', work_years: 4, status: 1, is_key_talent: 0, entry_date: '2023-02-14', skills: '["React", "Vue", "TypeScript", "Node.js"]', projects: '[{"name": "企业官网", "role": "前端开发", "period": "2023"}]' },
    { talent_id: 'T000005', name: '钱七', gender: 0, phone: '13800138005', email: 'qianqi@company.com', dept_name: '质量部', position_name: '测试工程师', education_level: '本科', school_name: '南京大学', major: '计算机科学', work_years: 3, status: 1, is_key_talent: 0, entry_date: '2022-09-01', skills: '["功能测试", "自动化测试", "Selenium", "JMeter"]', projects: '[{"name": "自动化测试平台", "role": "测试负责人", "period": "2023"}]' },
    { talent_id: 'T000006', name: '孙八', gender: 1, phone: '13800138006', email: 'sunba@company.com', dept_name: '研发中心', position_name: '架构师', education_level: '硕士', school_name: '上海交通大学', major: '计算机科学', work_years: 10, status: 1, is_key_talent: 1, entry_date: '2019-05-10', skills: '["系统架构", "微服务", "云原生", "Kubernetes", "Docker"]', projects: '[{"name": "微服务架构升级", "role": "架构负责人", "period": "2020-2021"}]' },
    { talent_id: 'T000007', name: '周九', gender: 0, phone: '13800138007', email: 'zhoujiu@company.com', dept_name: '人力资源部', position_name: 'HRBP', education_level: '硕士', school_name: '中国人民大学', major: '人力资源管理', work_years: 5, status: 1, is_key_talent: 0, entry_date: '2021-08-15', skills: '["招聘", "培训", "绩效管理", "员工关系"]', projects: '[{"name": "人才盘点项目", "role": "项目负责人", "period": "2023"}]' },
    { talent_id: 'T000008', name: '吴十', gender: 1, phone: '13800138008', email: 'wushi@company.com', dept_name: '销售部', position_name: '销售经理', education_level: '本科', school_name: '中山大学', major: '市场营销', work_years: 7, status: 1, is_key_talent: 0, entry_date: '2020-03-20', skills: '["销售管理", "客户开发", "商务谈判", "团队管理"]', projects: '[{"name": "大客户拓展", "role": "销售负责人", "period": "2022-2023"}]' }
  ];

  for (const t of talents) {
    try {
      insertTalent.run(t.talent_id, t.name, t.gender, t.phone, t.email, t.dept_name, t.position_name, t.education_level, t.school_name, t.major, t.work_years, t.status, t.is_key_talent, t.entry_date, t.skills, t.projects);
    } catch (e) {
      console.warn(`导入 ${t.name} 失败:`, e.message);
    }
  }
  console.log(`✅ 示例人才数据导入完成 (${talents.length} 条)`);

  // 插入示例招聘需求
  const insertReq = db.prepare(`
    INSERT INTO hr_job_requirement (req_id, title, dept_name, position_name, required_skills, work_years_min, work_years_max, education_level, headcount, priority, status, description)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const reqs = [
    { req_id: 'REQ001', title: '高级Java后端工程师', dept_name: '研发中心', position_name: '高级Java工程师', required_skills: '["Java", "Spring Boot", "MySQL", "Redis", "微服务"]', work_years_min: 5, work_years_max: 10, education_level: '本科', headcount: 2, priority: 3, status: 1, description: '负责公司核心业务系统的后端开发，需要具备丰富的Java开发经验和微服务架构设计能力' },
    { req_id: 'REQ002', title: 'AI算法工程师', dept_name: 'AI实验室', position_name: 'AI算法工程师', required_skills: '["Python", "TensorFlow", "PyTorch", "NLP", "机器学习"]', work_years_min: 3, work_years_max: 8, education_level: '硕士', headcount: 1, priority: 3, status: 1, description: '负责智能推荐系统的算法研发和优化，需要具备深度学习和自然语言处理经验' },
    { req_id: 'REQ003', title: '前端开发工程师', dept_name: '研发中心', position_name: '前端工程师', required_skills: '["React", "Vue", "TypeScript", "Node.js"]', work_years_min: 3, work_years_max: 5, education_level: '本科', headcount: 2, priority: 2, status: 1, description: '负责公司前端产品的开发和维护，需要熟悉主流前端框架' }
  ];

  for (const r of reqs) {
    try {
      insertReq.run(r.req_id, r.title, r.dept_name, r.position_name, r.required_skills, r.work_years_min, r.work_years_max, r.education_level, r.headcount, r.priority, r.status, r.description);
    } catch (e) {
      console.warn(`导入 ${r.req_id} 失败:`, e.message);
    }
  }
  console.log(`✅ 示例招聘需求导入完成 (${reqs.length} 条)`);

  // 插入示例用户
  const insertUser = db.prepare(`
    INSERT INTO sys_user (username, password, real_name, email, phone, status)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  try {
    insertUser.run('admin', 'e10adc3949ba59abbe56e057f20f883e', '管理员', 'admin@company.com', '13800138000', 1);
    console.log('✅ 示例用户插入完成');
  } catch (e) {
    console.warn('插入用户失败:', e.message);
  }

  // 插入示例标准画像
  const insertProfile = db.prepare(`
    INSERT INTO hr_standard_profile (position_name, position_level, core_abilities, required_skills, education_requirement, work_years_requirement, ability_standards)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const profiles = [
    ['Java开发工程师', '中级', '["代码开发", "系统设计", "问题解决"]', '["Java", "Spring", "MySQL"]', '本科', 3, '{"coding": 80, "design": 70, "communication": 60}'],
    ['前端开发工程师', '中级', '["页面开发", "交互设计", "性能优化"]', '["JavaScript", "React", "Vue"]', '本科', 3, '{"coding": 80, "design": 75, "communication": 65}'],
    ['运维工程师', '中级', '["系统运维", "故障处理", "自动化"]', '["Linux", "Docker", "K8s"]', '本科', 3, '{"operation": 85, "troubleshooting": 80, "automation": 70}'],
    ['测试工程师', '中级', '["测试设计", "缺陷管理", "自动化测试"]', '["测试理论", "Selenium", "JMeter"]', '本科', 2, '{"testing": 80, "analysis": 75, "automation": 65}']
  ];

  for (const p of profiles) {
    try {
      insertProfile.run(...p);
    } catch (e) {
      console.warn('插入画像失败:', e.message);
    }
  }
  console.log(`✅ 示例标准画像插入完成 (${profiles.length} 条)`);

  console.log('========== 示例数据插入完成 ==========');
}

module.exports = {
  initSQLiteTables,
  insertSampleData
};
