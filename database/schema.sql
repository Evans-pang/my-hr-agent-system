-- 人力资源智能体系统数据库脚本
-- 数据库: workspace_management
-- 创建时间: 2026-04-09

-- 使用数据库
USE workspace_management;

-- ============================================
-- 1. 基础数据表
-- ============================================

-- 部门表
CREATE TABLE IF NOT EXISTS sys_department (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '部门ID',
    dept_code VARCHAR(32) NOT NULL COMMENT '部门编码',
    dept_name VARCHAR(64) NOT NULL COMMENT '部门名称',
    parent_id BIGINT DEFAULT 0 COMMENT '父部门ID',
    dept_level INT DEFAULT 1 COMMENT '部门层级',
    sort_order INT DEFAULT 0 COMMENT '排序',
    status TINYINT DEFAULT 1 COMMENT '状态: 0-禁用, 1-启用',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE KEY uk_dept_code (dept_code),
    INDEX idx_parent_id (parent_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='部门表';

-- 岗位表
CREATE TABLE IF NOT EXISTS sys_position (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '岗位ID',
    position_code VARCHAR(32) NOT NULL COMMENT '岗位编码',
    position_name VARCHAR(64) NOT NULL COMMENT '岗位名称',
    position_type VARCHAR(32) COMMENT '岗位类型',
    dept_id BIGINT COMMENT '所属部门ID',
    status TINYINT DEFAULT 1 COMMENT '状态: 0-禁用, 1-启用',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE KEY uk_position_code (position_code),
    INDEX idx_dept_id (dept_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='岗位表';

-- ============================================
-- 2. 人才核心表
-- ============================================

-- 人才主表
CREATE TABLE IF NOT EXISTS hr_talent (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT 'ID',
    talent_id VARCHAR(32) NOT NULL COMMENT '人才唯一标识',
    e_code VARCHAR(32) COMMENT 'E编码',
    employee_no VARCHAR(32) COMMENT '工号',
    name VARCHAR(64) NOT NULL COMMENT '姓名',
    gender TINYINT COMMENT '性别: 0-女, 1-男, 2-保密',
    birth_date DATE COMMENT '出生日期',
    phone VARCHAR(256) COMMENT '手机号(加密存储)',
    email VARCHAR(128) COMMENT '邮箱',
    id_card VARCHAR(256) COMMENT '身份证号(加密存储)',
    status TINYINT DEFAULT 1 COMMENT '状态: 0-离职, 1-在职, 2-试用期',
    dept_id BIGINT COMMENT '部门ID',
    position_id BIGINT COMMENT '岗位ID',
    entry_date DATE COMMENT '入职日期',
    leave_date DATE COMMENT '离职日期',
    work_years DECIMAL(4,1) COMMENT '工作年限',
    education_level VARCHAR(32) COMMENT '学历层次',
    school_name VARCHAR(128) COMMENT '毕业院校',
    major VARCHAR(64) COMMENT '专业',
    is_985_211 TINYINT DEFAULT 0 COMMENT '是否985/211: 0-否, 1-是',
    is_key_talent TINYINT DEFAULT 0 COMMENT '是否关键人才: 0-否, 1-是',
    talent_type VARCHAR(32) COMMENT '人才类型: 高码开发/AI开发等',
    resume_url VARCHAR(256) COMMENT '简历文件URL',
    avatar_url VARCHAR(256) COMMENT '头像URL',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE KEY uk_talent_id (talent_id),
    UNIQUE KEY uk_e_code (e_code),
    INDEX idx_dept_id (dept_id),
    INDEX idx_position_id (position_id),
    INDEX idx_status (status),
    INDEX idx_is_key_talent (is_key_talent)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='人才主表';

-- 教育背景表
CREATE TABLE IF NOT EXISTS hr_education (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT 'ID',
    talent_id VARCHAR(32) NOT NULL COMMENT '人才ID',
    school_name VARCHAR(128) NOT NULL COMMENT '学校名称',
    major VARCHAR(64) COMMENT '专业',
    education_level VARCHAR(32) COMMENT '学历层次: 高中/大专/本科/硕士/博士',
    education_type VARCHAR(32) COMMENT '学历类型: 统招/自考/成教等',
    is_985_211 TINYINT DEFAULT 0 COMMENT '是否985/211',
    start_date DATE COMMENT '入学时间',
    end_date DATE COMMENT '毕业时间',
    is_graduated TINYINT DEFAULT 1 COMMENT '是否毕业: 0-在读, 1-已毕业',
    sort_order INT DEFAULT 0 COMMENT '排序',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_talent_id (talent_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='教育背景表';

-- 工作履历表
CREATE TABLE IF NOT EXISTS hr_work_experience (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT 'ID',
    talent_id VARCHAR(32) NOT NULL COMMENT '人才ID',
    company_name VARCHAR(128) NOT NULL COMMENT '公司名称',
    position_name VARCHAR(64) COMMENT '职位名称',
    department VARCHAR(64) COMMENT '部门',
    job_description TEXT COMMENT '工作职责',
    start_date DATE COMMENT '入职时间',
    end_date DATE COMMENT '离职时间',
    is_current TINYINT DEFAULT 0 COMMENT '是否当前工作: 0-否, 1-是',
    industry VARCHAR(64) COMMENT '所属行业',
    sort_order INT DEFAULT 0 COMMENT '排序',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_talent_id (talent_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工作履历表';

-- 项目经历表
CREATE TABLE IF NOT EXISTS hr_project_experience (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT 'ID',
    talent_id VARCHAR(32) NOT NULL COMMENT '人才ID',
    project_name VARCHAR(128) NOT NULL COMMENT '项目名称',
    project_type VARCHAR(64) COMMENT '项目类型',
    project_role VARCHAR(64) COMMENT '担任角色',
    project_description TEXT COMMENT '项目描述',
    project_achievement TEXT COMMENT '项目成果',
    start_date DATE COMMENT '开始时间',
    end_date DATE COMMENT '结束时间',
    team_size INT COMMENT '团队规模',
    skill_tags VARCHAR(512) COMMENT '技能标签,逗号分隔',
    sort_order INT DEFAULT 0 COMMENT '排序',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_talent_id (talent_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='项目经历表';

-- 技能表
CREATE TABLE IF NOT EXISTS hr_skill (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT 'ID',
    talent_id VARCHAR(32) NOT NULL COMMENT '人才ID',
    skill_name VARCHAR(64) NOT NULL COMMENT '技能名称',
    skill_level VARCHAR(32) COMMENT '熟练程度: 入门/熟练/精通/专家',
    skill_category VARCHAR(64) COMMENT '技能类别: 编程语言/框架/工具等',
    years_of_experience DECIMAL(3,1) COMMENT '使用年数',
    is_primary TINYINT DEFAULT 0 COMMENT '是否主要技能: 0-否, 1-是',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_talent_id (talent_id),
    INDEX idx_skill_name (skill_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='技能表';

-- 证书认证表
CREATE TABLE IF NOT EXISTS hr_certification (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT 'ID',
    talent_id VARCHAR(32) NOT NULL COMMENT '人才ID',
    cert_name VARCHAR(128) NOT NULL COMMENT '证书名称',
    cert_org VARCHAR(128) COMMENT '认证机构',
    cert_no VARCHAR(64) COMMENT '证书编号',
    issue_date DATE COMMENT '获取日期',
    expire_date DATE COMMENT '有效期至',
    cert_url VARCHAR(256) COMMENT '证书图片URL',
    status TINYINT DEFAULT 1 COMMENT '状态: 0-过期, 1-有效',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_talent_id (talent_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='证书认证表';

-- ============================================
-- 3. 人才画像表
-- ============================================

-- 人才画像表
CREATE TABLE IF NOT EXISTS hr_talent_profile (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT 'ID',
    profile_id VARCHAR(32) NOT NULL COMMENT '画像ID',
    talent_id VARCHAR(32) NOT NULL COMMENT '人才ID',
    profile_type TINYINT DEFAULT 2 COMMENT '画像类型: 1-标准画像, 2-实时画像',
    -- 能力维度评分 (0-100)
    tech_ability_score INT DEFAULT 0 COMMENT '技术能力评分',
    project_exp_score INT DEFAULT 0 COMMENT '项目经验评分',
    soft_skill_score INT DEFAULT 0 COMMENT '软技能评分',
    edu_bg_score INT DEFAULT 0 COMMENT '教育背景评分',
    overall_score INT DEFAULT 0 COMMENT '综合评分',
    -- 画像标签
    skill_tags JSON COMMENT '技能标签JSON',
    strength_points JSON COMMENT '优势亮点JSON',
    weakness_points JSON COMMENT '待提升项JSON',
    -- 匹配信息
    match_score DECIMAL(5,2) COMMENT '匹配评分',
    match_tags VARCHAR(512) COMMENT '匹配标签',
    -- 九宫格定位
    performance_level VARCHAR(32) COMMENT '绩效等级: 高/中/低',
    potential_level VARCHAR(32) COMMENT '潜力等级: 高/中/低',
    nine_box_position VARCHAR(32) COMMENT '九宫格位置',
    -- 版本控制
    version INT DEFAULT 1 COMMENT '版本号',
    is_current TINYINT DEFAULT 1 COMMENT '是否当前版本: 0-否, 1-是',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE KEY uk_profile_id (profile_id),
    INDEX idx_talent_id (talent_id),
    INDEX idx_profile_type (profile_type),
    INDEX idx_nine_box (nine_box_position)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='人才画像表';

-- 标准岗位画像表
CREATE TABLE IF NOT EXISTS hr_standard_profile (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT 'ID',
    profile_id VARCHAR(32) NOT NULL COMMENT '画像ID',
    position_id BIGINT NOT NULL COMMENT '岗位ID',
    profile_name VARCHAR(64) COMMENT '画像名称',
    -- 能力维度要求
    tech_ability_requirement TEXT COMMENT '技术能力要求',
    project_exp_requirement TEXT COMMENT '项目经验要求',
    soft_skill_requirement TEXT COMMENT '软技能要求',
    edu_bg_requirement TEXT COMMENT '教育背景要求',
    -- 技能要求
    required_skills JSON COMMENT '必需技能JSON',
    optional_skills JSON COMMENT '可选技能JSON',
    -- 其他要求
    work_years_min DECIMAL(4,1) COMMENT '最低工作年限',
    work_years_max DECIMAL(4,1) COMMENT '最高工作年限',
    education_level_min VARCHAR(32) COMMENT '最低学历要求',
    description TEXT COMMENT '画像描述',
    status TINYINT DEFAULT 1 COMMENT '状态: 0-禁用, 1-启用',
    version INT DEFAULT 1 COMMENT '版本号',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE KEY uk_profile_id (profile_id),
    INDEX idx_position_id (position_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='标准岗位画像表';

-- ============================================
-- 4. 简历管理表
-- ============================================

-- 简历模板表
CREATE TABLE IF NOT EXISTS hr_resume_template (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT 'ID',
    template_id VARCHAR(32) NOT NULL COMMENT '模板ID',
    template_name VARCHAR(64) NOT NULL COMMENT '模板名称',
    template_type VARCHAR(32) COMMENT '模板类型: 技术类/管理类/通用类',
    template_content TEXT COMMENT '模板内容(HTML)',
    template_style TEXT COMMENT '模板样式(CSS)',
    description VARCHAR(256) COMMENT '模板描述',
    is_default TINYINT DEFAULT 0 COMMENT '是否默认: 0-否, 1-是',
    sort_order INT DEFAULT 0 COMMENT '排序',
    status TINYINT DEFAULT 1 COMMENT '状态: 0-禁用, 1-启用',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE KEY uk_template_id (template_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='简历模板表';

-- 生成简历记录表
CREATE TABLE IF NOT EXISTS hr_generated_resume (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT 'ID',
    resume_id VARCHAR(32) NOT NULL COMMENT '简历ID',
    talent_id VARCHAR(32) NOT NULL COMMENT '人才ID',
    template_id VARCHAR(32) COMMENT '使用的模板ID',
    resume_content TEXT COMMENT '简历内容',
    resume_url VARCHAR(256) COMMENT '简历文件URL',
    file_format VARCHAR(32) COMMENT '文件格式: PDF/Word',
    file_size BIGINT COMMENT '文件大小(字节)',
    generation_status TINYINT DEFAULT 0 COMMENT '生成状态: 0-生成中, 1-已完成, 2-失败',
    -- 发送记录
    send_status TINYINT DEFAULT 0 COMMENT '发送状态: 0-未发送, 1-已发送',
    send_method VARCHAR(32) COMMENT '发送方式: 邮件/企业微信/钉钉',
    send_to VARCHAR(256) COMMENT '接收人',
    send_time DATETIME COMMENT '发送时间',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE KEY uk_resume_id (resume_id),
    INDEX idx_talent_id (talent_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='生成简历记录表';

-- ============================================
-- 5. 数据治理表
-- ============================================

-- 数据质量规则表
CREATE TABLE IF NOT EXISTS hr_data_quality_rule (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT 'ID',
    rule_code VARCHAR(32) NOT NULL COMMENT '规则编码',
    rule_name VARCHAR(64) NOT NULL COMMENT '规则名称',
    rule_type VARCHAR(32) COMMENT '规则类型: 格式校验/逻辑校验/重复校验',
    rule_description TEXT COMMENT '规则描述',
    rule_sql TEXT COMMENT '校验SQL',
    error_message VARCHAR(256) COMMENT '错误提示信息',
    severity_level TINYINT DEFAULT 1 COMMENT '严重程度: 1-提示, 2-警告, 3-错误',
    auto_fix_sql TEXT COMMENT '自动修复SQL',
    status TINYINT DEFAULT 1 COMMENT '状态: 0-禁用, 1-启用',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE KEY uk_rule_code (rule_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='数据质量规则表';

-- 数据质量问题表
CREATE TABLE IF NOT EXISTS hr_data_quality_issue (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT 'ID',
    issue_id VARCHAR(32) NOT NULL COMMENT '问题ID',
    rule_id BIGINT COMMENT '关联规则ID',
    talent_id VARCHAR(32) COMMENT '关联人才ID',
    issue_type VARCHAR(32) COMMENT '问题类型',
    issue_description TEXT COMMENT '问题描述',
    field_name VARCHAR(64) COMMENT '问题字段',
    field_value VARCHAR(256) COMMENT '字段值',
    severity_level TINYINT DEFAULT 1 COMMENT '严重程度',
    status TINYINT DEFAULT 0 COMMENT '处理状态: 0-未处理, 1-处理中, 2-已处理, 3-已忽略',
    handler_id BIGINT COMMENT '处理人ID',
    handle_time DATETIME COMMENT '处理时间',
    handle_result TEXT COMMENT '处理结果',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE KEY uk_issue_id (issue_id),
    INDEX idx_rule_id (rule_id),
    INDEX idx_talent_id (talent_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='数据质量问题表';

-- ============================================
-- 6. 系统管理表
-- ============================================

-- 用户表
CREATE TABLE IF NOT EXISTS sys_user (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '用户ID',
    username VARCHAR(64) NOT NULL COMMENT '用户名',
    password VARCHAR(256) NOT NULL COMMENT '密码(加密)',
    real_name VARCHAR(64) COMMENT '真实姓名',
    email VARCHAR(128) COMMENT '邮箱',
    phone VARCHAR(32) COMMENT '手机号',
    avatar_url VARCHAR(256) COMMENT '头像URL',
    dept_id BIGINT COMMENT '部门ID',
    status TINYINT DEFAULT 1 COMMENT '状态: 0-禁用, 1-启用',
    last_login_time DATETIME COMMENT '最后登录时间',
    last_login_ip VARCHAR(64) COMMENT '最后登录IP',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE KEY uk_username (username),
    INDEX idx_dept_id (dept_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- 角色表
CREATE TABLE IF NOT EXISTS sys_role (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '角色ID',
    role_code VARCHAR(32) NOT NULL COMMENT '角色编码',
    role_name VARCHAR(64) NOT NULL COMMENT '角色名称',
    role_type VARCHAR(32) COMMENT '角色类型: admin/manager/user',
    description VARCHAR(256) COMMENT '角色描述',
    status TINYINT DEFAULT 1 COMMENT '状态: 0-禁用, 1-启用',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE KEY uk_role_code (role_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='角色表';

-- 用户角色关联表
CREATE TABLE IF NOT EXISTS sys_user_role (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT 'ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    role_id BIGINT NOT NULL COMMENT '角色ID',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    UNIQUE KEY uk_user_role (user_id, role_id),
    INDEX idx_role_id (role_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户角色关联表';

-- 操作日志表
CREATE TABLE IF NOT EXISTS sys_operation_log (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT 'ID',
    user_id BIGINT COMMENT '操作用户ID',
    username VARCHAR(64) COMMENT '用户名',
    operation_type VARCHAR(64) COMMENT '操作类型',
    operation_desc TEXT COMMENT '操作描述',
    request_method VARCHAR(32) COMMENT '请求方法',
    request_url VARCHAR(256) COMMENT '请求URL',
    request_params TEXT COMMENT '请求参数',
    response_data TEXT COMMENT '响应数据',
    ip_address VARCHAR(64) COMMENT 'IP地址',
    user_agent VARCHAR(512) COMMENT '浏览器UA',
    execution_time INT COMMENT '执行时长(ms)',
    status TINYINT DEFAULT 1 COMMENT '状态: 0-失败, 1-成功',
    error_msg TEXT COMMENT '错误信息',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_user_id (user_id),
    INDEX idx_operation_type (operation_type),
    INDEX idx_create_time (create_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='操作日志表';

-- ============================================
-- 7. 插入初始数据
-- ============================================

-- 插入默认部门
INSERT INTO sys_department (dept_code, dept_name, parent_id, sort_order) VALUES
('D001', '研发中心', 0, 1),
('D002', '产品部', 0, 2),
('D003', '销售部', 0, 3),
('D004', '人力资源部', 0, 4),
('D005', '财务部', 0, 5);

-- 插入默认岗位
INSERT INTO sys_position (position_code, position_name, dept_id, position_type) VALUES
('P001', '软件工程师', 1, '技术'),
('P002', '高级软件工程师', 1, '技术'),
('P003', '技术主管', 1, '管理'),
('P004', '产品经理', 2, '产品'),
('P005', '销售经理', 3, '销售'),
('P006', 'HR专员', 4, '职能');

-- 插入默认管理员
INSERT INTO sys_user (username, password, real_name, email, status) VALUES
('admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5E', '系统管理员', 'admin@company.com', 1);

-- 插入默认角色
INSERT INTO sys_role (role_code, role_name, role_type, description) VALUES
('ROLE_ADMIN', '系统管理员', 'admin', '拥有所有权限'),
('ROLE_HR', 'HR管理员', 'manager', '人力资源管理权限'),
('ROLE_MANAGER', '部门经理', 'manager', '部门管理权限'),
('ROLE_USER', '普通用户', 'user', '基本查看权限');

-- 关联管理员角色
INSERT INTO sys_user_role (user_id, role_id) VALUES (1, 1);

-- 插入简历模板
INSERT INTO hr_resume_template (template_id, template_name, template_type, description, is_default, sort_order) VALUES
('T001', '技术类简历', '技术', '适用于软件开发工程师', 1, 1),
('T002', '管理类简历', '管理', '适用于技术管理者', 0, 2),
('T003', 'AI类简历', 'AI', '适用于AI/算法工程师', 0, 3),
('T004', '通用类简历', '通用', '适用于各类岗位', 0, 4);

-- 插入数据质量规则
INSERT INTO hr_data_quality_rule (rule_code, rule_name, rule_type, rule_description, error_message, severity_level) VALUES
('RULE001', '手机号格式校验', '格式校验', '校验手机号是否为11位数字', '手机号格式不正确，应为11位数字', 3),
('RULE002', '邮箱格式校验', '格式校验', '校验邮箱格式是否正确', '邮箱格式不正确', 2),
('RULE003', '身份证格式校验', '格式校验', '校验身份证号格式', '身份证号格式不正确', 3),
('RULE004', '毕业时间逻辑校验', '逻辑校验', '毕业时间不能晚于入职时间', '毕业时间晚于入职时间，请核实', 2),
('RULE005', '工作年限逻辑校验', '逻辑校验', '工作年限应与入职时间匹配', '工作年限与入职时间不匹配', 1);

-- 插入示例人才数据
INSERT INTO hr_talent (talent_id, e_code, employee_no, name, gender, phone, email, status, dept_id, position_id, entry_date, work_years, education_level, school_name, major, is_key_talent, talent_type) VALUES
('T20240001', 'E001', '10001', '李明', 1, 'AES_ENCRYPT("13800138001", "key")', 'liming@company.com', 1, 1, 2, '2021-03-15', 5.0, '本科', '清华大学', '计算机科学与技术', 1, '高码开发'),
('T20240002', 'E002', '10002', '王芳', 0, 'AES_ENCRYPT("13900139001", "key")', 'wangfang@company.com', 1, 1, 1, '2022-06-01', 4.0, '硕士', '北京大学', '软件工程', 1, 'AI开发'),
('T20240003', 'E003', '10003', '张伟', 1, 'AES_ENCRYPT("13700137001", "key")', 'zhangwei@company.com', 1, 1, 3, '2019-01-10', 7.0, '本科', '复旦大学', '信息管理与信息系统', 1, '高码开发');

-- 插入示例技能
INSERT INTO hr_skill (talent_id, skill_name, skill_level, skill_category, years_of_experience, is_primary) VALUES
('T20240001', 'Java', '精通', '编程语言', 5.0, 1),
('T20240001', 'Spring Boot', '精通', '框架', 4.0, 1),
('T20240001', 'MySQL', '熟练', '数据库', 4.0, 0),
('T20240002', 'Python', '精通', '编程语言', 4.0, 1),
('T20240002', 'TensorFlow', '熟练', 'AI框架', 3.0, 1),
('T20240002', 'PyTorch', '熟练', 'AI框架', 2.0, 0);

COMMIT;

-- 完成提示
SELECT '数据库初始化完成！' AS message;
