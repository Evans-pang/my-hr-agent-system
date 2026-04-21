const { query } = require('./db');

async function initProfileTables() {
  try {
    console.log('========== 初始化人才画像相关表 ==========\n');

    // 1. 创建标准岗位画像表
    await query(`
      CREATE TABLE IF NOT EXISTS hr_standard_profile (
        id INT PRIMARY KEY AUTO_INCREMENT,
        position_name VARCHAR(100) NOT NULL COMMENT '岗位名称',
        position_level VARCHAR(50) COMMENT '岗位级别',
        core_abilities JSON COMMENT '核心能力要求',
        required_skills JSON COMMENT '必备技能',
        knowledge_requirements JSON COMMENT '知识要求',
        project_experience TEXT COMMENT '项目经验要求',
        education_requirement VARCHAR(50) COMMENT '学历要求',
        work_years_requirement INT COMMENT '工作年限要求',
        ability_standards JSON COMMENT '能力标准评分',
        created_by VARCHAR(50) COMMENT '创建人',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY uk_position (position_name, position_level)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='标准岗位画像表'
    `);
    console.log('✅ 标准岗位画像表创建成功');

    // 2. 创建培训考核数据表
    await query(`
      CREATE TABLE IF NOT EXISTS hr_training_record (
        id INT PRIMARY KEY AUTO_INCREMENT,
        talent_id VARCHAR(50) NOT NULL COMMENT '人才ID',
        training_name VARCHAR(200) NOT NULL COMMENT '培训名称',
        training_type VARCHAR(50) COMMENT '培训类型',
        start_date DATE COMMENT '开始日期',
        end_date DATE COMMENT '结束日期',
        score DECIMAL(5,2) COMMENT '培训成绩',
        status VARCHAR(20) COMMENT '状态：已完成/进行中',
        trainer VARCHAR(100) COMMENT '培训师',
        description TEXT COMMENT '培训描述',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_talent (talent_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='培训记录表'
    `);
    console.log('✅ 培训记录表创建成功');

    // 3. 创建考核记录表
    await query(`
      CREATE TABLE IF NOT EXISTS hr_assessment_record (
        id INT PRIMARY KEY AUTO_INCREMENT,
        talent_id VARCHAR(50) NOT NULL COMMENT '人才ID',
        assessment_name VARCHAR(200) NOT NULL COMMENT '考核名称',
        assessment_type VARCHAR(50) COMMENT '考核类型',
        assessment_date DATE COMMENT '考核日期',
        score DECIMAL(5,2) COMMENT '考核分数',
        total_score DECIMAL(5,2) COMMENT '总分',
        ranking VARCHAR(20) COMMENT '排名等级',
        evaluator VARCHAR(100) COMMENT '评估人',
        comments TEXT COMMENT '评语',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_talent (talent_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='考核记录表'
    `);
    console.log('✅ 考核记录表创建成功');

    // 4. 创建人才收藏/推荐表
    await query(`
      CREATE TABLE IF NOT EXISTS hr_talent_favorite (
        id INT PRIMARY KEY AUTO_INCREMENT,
        talent_id VARCHAR(50) NOT NULL COMMENT '人才ID',
        user_id VARCHAR(50) NOT NULL COMMENT '用户ID',
        type VARCHAR(20) COMMENT '类型：收藏/推荐',
        tags JSON COMMENT '标签',
        notes TEXT COMMENT '备注',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uk_talent_user (talent_id, user_id, type),
        INDEX idx_user (user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='人才收藏推荐表'
    `);
    console.log('✅ 人才收藏推荐表创建成功');

    // 5. 创建简历标记表
    await query(`
      CREATE TABLE IF NOT EXISTS hr_resume_mark (
        id INT PRIMARY KEY AUTO_INCREMENT,
        talent_id VARCHAR(50) NOT NULL COMMENT '人才ID',
        user_id VARCHAR(50) NOT NULL COMMENT '用户ID',
        mark_type VARCHAR(50) COMMENT '标记类型：重点/关注/待定等',
        mark_content TEXT COMMENT '标记内容',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_talent (talent_id),
        INDEX idx_user (user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='简历标记表'
    `);
    console.log('✅ 简历标记表创建成功');

    // 6. 插入一些示例标准画像数据
    const standardProfileCount = await query('SELECT COUNT(*) as count FROM hr_standard_profile');
    if (standardProfileCount[0].count === 0) {
      await query(`
        INSERT INTO hr_standard_profile (position_name, position_level, core_abilities, required_skills, education_requirement, work_years_requirement, ability_standards) VALUES
        ('Java开发工程师', '中级', '["代码开发", "系统设计", "问题解决"]', '["Java", "Spring", "MySQL"]', '本科', 3, '{"coding": 80, "design": 70, "communication": 60}'),
        ('前端开发工程师', '中级', '["页面开发", "交互设计", "性能优化"]', '["JavaScript", "React", "Vue"]', '本科', 3, '{"coding": 80, "design": 75, "communication": 65}'),
        ('运维工程师', '中级', '["系统运维", "故障处理", "自动化"]', '["Linux", "Docker", "K8s"]', '本科', 3, '{"operation": 85, "troubleshooting": 80, "automation": 70}'),
        ('测试工程师', '中级', '["测试设计", "缺陷管理", "自动化测试"]', '["测试理论", "Selenium", "JMeter"]', '本科', 2, '{"testing": 80, "analysis": 75, "automation": 65}')
      `);
      console.log('✅ 示例标准画像数据插入成功');
    }

    console.log('\n========== 所有表初始化完成 ==========');
  } catch (error) {
    console.error('初始化失败:', error);
  } finally {
    process.exit(0);
  }
}

initProfileTables();
