-- ============================================
-- 人力资源智能体系统 - 数据库初始化脚本
-- 标准规范：先检查表是否存在，不存在则创建，不删除已有数据
-- ============================================

-- 创建人才表（如果不存在）
CREATE TABLE IF NOT EXISTS hr_talent (
  id INT AUTO_INCREMENT PRIMARY KEY,
  talent_id VARCHAR(20) NOT NULL UNIQUE COMMENT '人才编号',
  name VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '姓名',
  gender TINYINT DEFAULT 1 COMMENT '性别：1男，0女',
  phone VARCHAR(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '手机号',
  email VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '邮箱',
  dept_name VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '部门名称',
  position_name VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '职位名称',
  education_level VARCHAR(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '学历',
  school_name VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '毕业院校',
  major VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '专业',
  work_years INT DEFAULT 0 COMMENT '工作年限',
  status TINYINT DEFAULT 1 COMMENT '状态：1在职，0离职',
  is_key_talent TINYINT DEFAULT 0 COMMENT '是否关键人才：1是，0否',
  entry_date DATE COMMENT '入职日期',
  skills JSON COMMENT '技能数组',
  projects JSON COMMENT '项目经历',
  create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='人才信息表';

-- 创建招聘需求表（如果不存在）
CREATE TABLE IF NOT EXISTS hr_job_requirement (
  id INT AUTO_INCREMENT PRIMARY KEY,
  req_id VARCHAR(20) NOT NULL UNIQUE COMMENT '需求编号',
  title VARCHAR(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '需求标题',
  dept_name VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '部门',
  position_name VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '职位',
  required_skills JSON COMMENT '所需技能',
  work_years_min INT DEFAULT 0 COMMENT '最低工作年限',
  work_years_max INT DEFAULT NULL COMMENT '最高工作年限',
  education_level VARCHAR(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '学历要求',
  headcount INT DEFAULT 1 COMMENT '招聘人数',
  priority TINYINT DEFAULT 1 COMMENT '优先级：3高，2中，1低',
  status TINYINT DEFAULT 1 COMMENT '状态：1招聘中，2已暂停，3已完成',
  description TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '需求描述',
  create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='招聘需求表';

-- 创建需求匹配结果表（如果不存在）
CREATE TABLE IF NOT EXISTS hr_job_match (
  id INT AUTO_INCREMENT PRIMARY KEY,
  req_id VARCHAR(20) NOT NULL COMMENT '需求编号',
  talent_id VARCHAR(20) NOT NULL COMMENT '人才编号',
  match_score INT DEFAULT 0 COMMENT '匹配分数',
  match_reason TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '匹配理由',
  status TINYINT DEFAULT 1 COMMENT '状态：1待处理，2已推荐，3已面试，4已录用，5已拒绝',
  create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  UNIQUE KEY uk_req_talent (req_id, talent_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='需求匹配结果表';

-- 创建简历调取记录表（如果不存在）
CREATE TABLE IF NOT EXISTS hr_resume_access (
  id INT AUTO_INCREMENT PRIMARY KEY,
  access_id VARCHAR(20) NOT NULL UNIQUE COMMENT '调取编号',
  talent_id VARCHAR(20) NOT NULL COMMENT '人才编号',
  talent_name VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '人才姓名',
  access_type TINYINT DEFAULT 1 COMMENT '调取类型：1查看，2下载，3导出',
  access_by VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '调取人',
  access_dept VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '调取部门',
  purpose VARCHAR(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '调取用途',
  is_high_quality TINYINT DEFAULT 0 COMMENT '是否优质简历：1是，0否',
  quality_score INT DEFAULT 0 COMMENT '简历质量评分(0-100)',
  access_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '调取时间',
  INDEX idx_access_time (access_time),
  INDEX idx_talent_id (talent_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='简历调取记录表';

-- ============================================
-- 数据导入部分：仅在表为空时插入示例数据
-- ============================================

-- 检查并插入示例人才数据（仅在表为空时）
INSERT INTO hr_talent (talent_id, name, gender, phone, email, dept_name, position_name, education_level, school_name, major, work_years, status, is_key_talent, entry_date, skills, projects)
SELECT * FROM (SELECT 'T000001' as talent_id, '张三' as name, 1 as gender, '13800138001' as phone, 'zhangsan@company.com' as email, '研发中心' as dept_name, '高级Java工程师' as position_name, '硕士' as education_level, '清华大学' as school_name, '计算机科学' as major, 8 as work_years, 1 as status, 1 as is_key_talent, '2021-03-15' as entry_date, '["Java", "Spring Boot", "MySQL", "Redis", "微服务"]' as skills, '[{"name": "电商平台重构", "role": "技术负责人", "period": "2022-2023"}]' as projects) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM hr_talent WHERE talent_id = 'T000001');

INSERT INTO hr_talent (talent_id, name, gender, phone, email, dept_name, position_name, education_level, school_name, major, work_years, status, is_key_talent, entry_date, skills, projects)
SELECT * FROM (SELECT 'T000002' as talent_id, '李四' as name, 1 as gender, '13800138002' as phone, 'lisi@company.com' as email, 'AI实验室' as dept_name, 'AI算法工程师' as position_name, '博士' as education_level, '北京大学' as school_name, '人工智能' as major, 5 as work_years, 1 as status, 1 as is_key_talent, '2022-06-20' as entry_date, '["Python", "TensorFlow", "PyTorch", "NLP", "计算机视觉"]' as skills, '[{"name": "智能推荐系统", "role": "核心开发", "period": "2022-2023"}]' as projects) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM hr_talent WHERE talent_id = 'T000002');

INSERT INTO hr_talent (talent_id, name, gender, phone, email, dept_name, position_name, education_level, school_name, major, work_years, status, is_key_talent, entry_date, skills, projects)
SELECT * FROM (SELECT 'T000003' as talent_id, '王五' as name, 0 as gender, '13800138003' as phone, 'wangwu@company.com' as email, '产品部' as dept_name, '产品经理' as position_name, '本科' as education_level, '复旦大学' as school_name, '工商管理' as major, 6 as work_years, 1 as status, 0 as is_key_talent, '2020-11-08' as entry_date, '["产品设计", "数据分析", "Axure", "用户研究"]' as skills, '[{"name": "移动端APP", "role": "产品经理", "period": "2021-2022"}]' as projects) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM hr_talent WHERE talent_id = 'T000003');

INSERT INTO hr_talent (talent_id, name, gender, phone, email, dept_name, position_name, education_level, school_name, major, work_years, status, is_key_talent, entry_date, skills, projects)
SELECT * FROM (SELECT 'T000004' as talent_id, '赵六' as name, 1 as gender, '13800138004' as phone, 'zhaoliu@company.com' as email, '研发中心' as dept_name, '前端工程师' as position_name, '本科' as education_level, '浙江大学' as school_name, '软件工程' as major, 4 as work_years, 1 as status, 0 as is_key_talent, '2023-02-14' as entry_date, '["React", "Vue", "TypeScript", "Node.js"]' as skills, '[{"name": "企业官网", "role": "前端开发", "period": "2023"}]' as projects) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM hr_talent WHERE talent_id = 'T000004');

INSERT INTO hr_talent (talent_id, name, gender, phone, email, dept_name, position_name, education_level, school_name, major, work_years, status, is_key_talent, entry_date, skills, projects)
SELECT * FROM (SELECT 'T000005' as talent_id, '钱七' as name, 0 as gender, '13800138005' as phone, 'qianqi@company.com' as email, '质量部' as dept_name, '测试工程师' as position_name, '本科' as education_level, '南京大学' as school_name, '计算机科学' as major, 3 as work_years, 1 as status, 0 as is_key_talent, '2022-09-01' as entry_date, '["功能测试", "自动化测试", "Selenium", "JMeter"]' as skills, '[{"name": "自动化测试平台", "role": "测试负责人", "period": "2023"}]' as projects) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM hr_talent WHERE talent_id = 'T000005');

INSERT INTO hr_talent (talent_id, name, gender, phone, email, dept_name, position_name, education_level, school_name, major, work_years, status, is_key_talent, entry_date, skills, projects)
SELECT * FROM (SELECT 'T000006' as talent_id, '孙八' as name, 1 as gender, '13800138006' as phone, 'sunba@company.com' as email, '研发中心' as dept_name, '架构师' as position_name, '硕士' as education_level, '上海交通大学' as school_name, '计算机科学' as major, 10 as work_years, 1 as status, 1 as is_key_talent, '2019-05-10' as entry_date, '["系统架构", "微服务", "云原生", "Kubernetes", "Docker"]' as skills, '[{"name": "微服务架构升级", "role": "架构负责人", "period": "2020-2021"}]' as projects) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM hr_talent WHERE talent_id = 'T000006');

INSERT INTO hr_talent (talent_id, name, gender, phone, email, dept_name, position_name, education_level, school_name, major, work_years, status, is_key_talent, entry_date, skills, projects)
SELECT * FROM (SELECT 'T000007' as talent_id, '周九' as name, 0 as gender, '13800138007' as phone, 'zhoujiu@company.com' as email, '人力资源部' as dept_name, 'HRBP' as position_name, '硕士' as education_level, '中国人民大学' as school_name, '人力资源管理' as major, 5 as work_years, 1 as status, 0 as is_key_talent, '2021-08-15' as entry_date, '["招聘", "培训", "绩效管理", "员工关系"]' as skills, '[{"name": "人才盘点项目", "role": "项目负责人", "period": "2023"}]' as projects) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM hr_talent WHERE talent_id = 'T000007');

INSERT INTO hr_talent (talent_id, name, gender, phone, email, dept_name, position_name, education_level, school_name, major, work_years, status, is_key_talent, entry_date, skills, projects)
SELECT * FROM (SELECT 'T000008' as talent_id, '吴十' as name, 1 as gender, '13800138008' as phone, 'wushi@company.com' as email, '销售部' as dept_name, '销售经理' as position_name, '本科' as education_level, '中山大学' as school_name, '市场营销' as major, 7 as work_years, 1 as status, 0 as is_key_talent, '2020-03-20' as entry_date, '["销售管理", "客户开发", "商务谈判", "团队管理"]' as skills, '[{"name": "大客户拓展", "role": "销售负责人", "period": "2022-2023"}]' as projects) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM hr_talent WHERE talent_id = 'T000008');

-- 检查并插入示例招聘需求（仅在表为空时）
INSERT INTO hr_job_requirement (req_id, title, dept_name, position_name, required_skills, work_years_min, work_years_max, education_level, headcount, priority, status, description)
SELECT * FROM (SELECT 'REQ001' as req_id, '高级Java后端工程师' as title, '研发中心' as dept_name, '高级Java工程师' as position_name, '["Java", "Spring Boot", "MySQL", "Redis", "微服务"]' as required_skills, 5 as work_years_min, 10 as work_years_max, '本科' as education_level, 2 as headcount, 3 as priority, 1 as status, '负责公司核心业务系统的后端开发，需要具备丰富的Java开发经验和微服务架构设计能力' as description) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM hr_job_requirement WHERE req_id = 'REQ001');

INSERT INTO hr_job_requirement (req_id, title, dept_name, position_name, required_skills, work_years_min, work_years_max, education_level, headcount, priority, status, description)
SELECT * FROM (SELECT 'REQ002' as req_id, 'AI算法工程师' as title, 'AI实验室' as dept_name, 'AI算法工程师' as position_name, '["Python", "TensorFlow", "PyTorch", "NLP", "机器学习"]' as required_skills, 3 as work_years_min, 8 as work_years_max, '硕士' as education_level, 1 as headcount, 3 as priority, 1 as status, '负责智能推荐系统的算法研发和优化，需要具备深度学习和自然语言处理经验' as description) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM hr_job_requirement WHERE req_id = 'REQ002');

INSERT INTO hr_job_requirement (req_id, title, dept_name, position_name, required_skills, work_years_min, work_years_max, education_level, headcount, priority, status, description)
SELECT * FROM (SELECT 'REQ003' as req_id, '前端开发工程师' as title, '研发中心' as dept_name, '前端工程师' as position_name, '["React", "Vue", "TypeScript", "Node.js"]' as required_skills, 3 as work_years_min, 5 as work_years_max, '本科' as education_level, 2 as headcount, 2 as priority, 1 as status, '负责公司前端产品的开发和维护，需要熟悉主流前端框架' as description) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM hr_job_requirement WHERE req_id = 'REQ003');

-- 检查并插入示例简历调取记录（仅在表为空时）
INSERT INTO hr_resume_access (access_id, talent_id, talent_name, access_type, access_by, access_dept, purpose, is_high_quality, quality_score, access_time)
SELECT * FROM (SELECT 'ACC001' as access_id, 'T000001' as talent_id, '张三' as talent_name, 1 as access_type, '王HR' as access_by, '人力资源部' as access_dept, '招聘评估' as purpose, 1 as is_high_quality, 92 as quality_score, DATE_SUB(NOW(), INTERVAL 1 DAY) as access_time) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM hr_resume_access WHERE access_id = 'ACC001');

INSERT INTO hr_resume_access (access_id, talent_id, talent_name, access_type, access_by, access_dept, purpose, is_high_quality, quality_score, access_time)
SELECT * FROM (SELECT 'ACC002' as access_id, 'T000002' as talent_id, '李四' as talent_name, 2 as access_type, '李经理' as access_by, '研发中心' as access_dept, '技术面试' as purpose, 1 as is_high_quality, 95 as quality_score, DATE_SUB(NOW(), INTERVAL 2 DAY) as access_time) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM hr_resume_access WHERE access_id = 'ACC002');

INSERT INTO hr_resume_access (access_id, talent_id, talent_name, access_type, access_by, access_dept, purpose, is_high_quality, quality_score, access_time)
SELECT * FROM (SELECT 'ACC003' as access_id, 'T000003' as talent_id, '王五' as talent_name, 1 as access_type, '张HR' as access_by, '人力资源部' as access_dept, '简历筛选' as purpose, 0 as is_high_quality, 75 as quality_score, DATE_SUB(NOW(), INTERVAL 3 DAY) as access_time) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM hr_resume_access WHERE access_id = 'ACC003');

INSERT INTO hr_resume_access (access_id, talent_id, talent_name, access_type, access_by, access_dept, purpose, is_high_quality, quality_score, access_time)
SELECT * FROM (SELECT 'ACC004' as access_id, 'T000001' as talent_id, '张三' as talent_name, 3 as access_type, '赵总监' as access_by, '研发中心' as access_dept, '人才盘点' as purpose, 1 as is_high_quality, 92 as quality_score, DATE_SUB(NOW(), INTERVAL 5 DAY) as access_time) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM hr_resume_access WHERE access_id = 'ACC004');

INSERT INTO hr_resume_access (access_id, talent_id, talent_name, access_type, access_by, access_dept, purpose, is_high_quality, quality_score, access_time)
SELECT * FROM (SELECT 'ACC005' as access_id, 'T000004' as talent_id, '赵六' as talent_name, 1 as access_type, '王HR' as access_by, '人力资源部' as access_dept, '招聘评估' as purpose, 0 as is_high_quality, 68 as quality_score, DATE_SUB(NOW(), INTERVAL 6 DAY) as access_time) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM hr_resume_access WHERE access_id = 'ACC005');
