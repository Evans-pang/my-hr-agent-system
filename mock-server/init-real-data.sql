-- ============================================
-- 人力资源智能体系统 - 真实数据表初始化脚本
-- 标准规范：先检查表是否存在，不存在则创建，不删除已有数据
-- ============================================

-- 创建人才表（基于真实Excel数据，如果不存在）
CREATE TABLE IF NOT EXISTS hr_talent (
  id INT AUTO_INCREMENT PRIMARY KEY,
  talent_id VARCHAR(20) NOT NULL UNIQUE COMMENT '人才编号(E编码)',
  employee_no VARCHAR(20) COMMENT '工号',
  name VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '姓名',
  gender VARCHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '性别',
  age DECIMAL(4,1) COMMENT '年龄',
  education_level VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '最高学历',
  school_name VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '毕业院校1',
  major VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '专业1',
  work_years INT COMMENT '工作年限',
  it_work_years INT COMMENT 'IT从业年限',
  industry VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '行业',
  english_level VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '英语水平',
  legal_entity VARCHAR(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '法人实体',
  position_sequence VARCHAR(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '职务序列',
  is_key_talent TINYINT DEFAULT 0 COMMENT '是否关键人才(骨干)',
  status VARCHAR(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT '在职' COMMENT '人员状态',
  work_location VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '工作意向地/办公地点',
  entry_date DATE COMMENT '入职日期',
  marital_status VARCHAR(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '婚姻状况',
  political_status VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '政治面貌',
  organization_location VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '组织所在地',
  id_card VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '身份证号',
  birth_date DATE COMMENT '出生日期',
  main_skill VARCHAR(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '主技能',
  is_fresh_graduate TINYINT DEFAULT 0 COMMENT '是否应届生',
  is_intern TINYINT DEFAULT 0 COMMENT '是否实习生',
  nationality VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '国籍',
  ethnicity VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '民族',
  graduation_date DATE COMMENT '毕业时间',
  school_type VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '院校类型',
  education_mode VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '学习方式',
  job_level VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '职级',
  base_position VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '基准职位',
  position_name VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '岗位',
  position_level VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '岗位职级',
  employee_type VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '员工类别',
  employee_category VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '员工类型(运营)',
  customer_name VARCHAR(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '客户名称',
  project_name VARCHAR(300) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '项目名称',
  project_type VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '项目类型',
  skill_name VARCHAR(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '技能名称',
  is_current_skill TINYINT DEFAULT 0 COMMENT '是否当前技能',
  is_main_skill TINYINT DEFAULT 0 COMMENT '是否主技能',
  skill_path VARCHAR(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '技能路径',
  proficiency VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '熟练程度',
  monthly_salary DECIMAL(10,2) COMMENT '月标准工费',
  performance_2023 VARCHAR(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '2023年度绩效',
  performance_2024 VARCHAR(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '2024年度绩效',
  performance_2025 VARCHAR(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '2025年度绩效',
  create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_status (status),
  INDEX idx_education (education_level),
  INDEX idx_industry (industry),
  INDEX idx_position (position_name),
  INDEX idx_entry_date (entry_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='人才信息表(真实数据)';

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
