const xlsx = require('xlsx');
const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '123456',
  database: 'workspace_management',
  charset: 'utf8mb4'
};

const filePath = 'd:/code/人力资源/附件1-Bootcamp虚拟数据（to 测试） -20260409.xlsx';

function excelDateToJSDate(excelDate) {
  if (!excelDate) return null;
  if (typeof excelDate === 'string') {
    const date = new Date(excelDate);
    if (!isNaN(date.getTime())) return date.toISOString().split('T')[0];
    return null;
  }
  const epoch = new Date(1900, 0, 1);
  const days = Math.floor(excelDate) - 2;
  const date = new Date(epoch.getTime() + days * 24 * 60 * 60 * 1000);
  return date.toISOString().split('T')[0];
}

function parseYesNo(value) {
  if (value === '是' || value === 'Y' || value === 'y' || value === 1 || value === '1') return 1;
  return 0;
}

async function importData() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log('数据库连接成功');
    await connection.execute('SET NAMES utf8mb4');

    // 删除旧表并创建新表
    console.log('创建数据库表...');
    await connection.execute('DROP TABLE IF EXISTS hr_resume_access');
    await connection.execute('DROP TABLE IF EXISTS hr_job_match');
    await connection.execute('DROP TABLE IF EXISTS hr_job_requirement');
    await connection.execute('DROP TABLE IF EXISTS hr_talent');
    
    await connection.execute(`
      CREATE TABLE hr_talent (
        id INT AUTO_INCREMENT PRIMARY KEY,
        talent_id VARCHAR(20) NOT NULL UNIQUE,
        employee_no VARCHAR(20),
        name VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
        gender VARCHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
        age DECIMAL(4,1),
        education_level VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
        school_name VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
        major VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
        work_years INT,
        it_work_years INT,
        industry VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
        english_level VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
        legal_entity VARCHAR(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
        position_sequence VARCHAR(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
        is_key_talent TINYINT DEFAULT 0,
        status VARCHAR(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT '在职',
        work_location VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
        entry_date DATE,
        marital_status VARCHAR(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
        political_status VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
        organization_location VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
        id_card VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
        birth_date DATE,
        main_skill VARCHAR(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
        is_fresh_graduate TINYINT DEFAULT 0,
        is_intern TINYINT DEFAULT 0,
        nationality VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
        ethnicity VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
        graduation_date DATE,
        school_type VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
        education_mode VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
        job_level VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
        base_position VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
        position_name VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
        position_level VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
        employee_type VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
        employee_category VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
        customer_name VARCHAR(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
        project_name VARCHAR(300) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
        project_type VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
        skill_name VARCHAR(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
        is_current_skill TINYINT DEFAULT 0,
        is_main_skill TINYINT DEFAULT 0,
        skill_path VARCHAR(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
        proficiency VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
        monthly_salary DECIMAL(10,2),
        performance_2023 VARCHAR(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
        performance_2024 VARCHAR(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
        performance_2025 VARCHAR(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
        create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_status (status),
        INDEX idx_education (education_level),
        INDEX idx_industry (industry),
        INDEX idx_position (position_name)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    
    await connection.execute(`
      CREATE TABLE hr_resume_access (
        id INT AUTO_INCREMENT PRIMARY KEY,
        access_id VARCHAR(20) NOT NULL UNIQUE,
        talent_id VARCHAR(20) NOT NULL,
        talent_name VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
        access_type TINYINT DEFAULT 1,
        access_by VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
        access_dept VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
        purpose VARCHAR(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
        is_high_quality TINYINT DEFAULT 0,
        quality_score INT DEFAULT 0,
        access_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_access_time (access_time),
        INDEX idx_talent_id (talent_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    
    await connection.execute(`
      CREATE TABLE hr_job_requirement (
        id INT AUTO_INCREMENT PRIMARY KEY,
        req_id VARCHAR(20) NOT NULL UNIQUE,
        title VARCHAR(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
        dept_name VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
        position_name VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
        required_skills JSON,
        work_years_min INT DEFAULT 0,
        work_years_max INT DEFAULT NULL,
        education_level VARCHAR(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
        headcount INT DEFAULT 1,
        priority TINYINT DEFAULT 1,
        status TINYINT DEFAULT 1,
        description TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
        create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    
    await connection.execute(`
      CREATE TABLE hr_job_match (
        id INT AUTO_INCREMENT PRIMARY KEY,
        req_id VARCHAR(20) NOT NULL,
        talent_id VARCHAR(20) NOT NULL,
        match_score INT DEFAULT 0,
        match_reason TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
        status TINYINT DEFAULT 1,
        create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY uk_req_talent (req_id, talent_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('数据库表创建完成');

    // 读取Excel
    const workbook = xlsx.readFile(filePath);
    const worksheet = workbook.Sheets['员工数据_清洁版'];
    const data = xlsx.utils.sheet_to_json(worksheet);
    console.log(`读取到 ${data.length} 条员工数据`);

    // 导入员工数据
    console.log('开始导入员工数据...');
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      try {
        const entryDate = excelDateToJSDate(row['入职日期']);
        const birthDate = excelDateToJSDate(row['出生日期']);
        const graduationDate = excelDateToJSDate(row['毕业时间']);
        const talentId = row['E编码'] || `E${String(i + 1).padStart(9, '0')}`;
        const isKeyTalent = parseYesNo(row['是否骨干']);
        const status = row['人员状态'] ? String(row['人员状态']).trim() : '在职';

        const fields = [
          'talent_id', 'employee_no', 'name', 'gender', 'age', 'education_level',
          'school_name', 'major', 'work_years', 'it_work_years', 'industry',
          'english_level', 'legal_entity', 'position_sequence', 'is_key_talent',
          'status', 'work_location', 'entry_date', 'marital_status', 'political_status',
          'organization_location', 'id_card', 'birth_date', 'main_skill',
          'is_fresh_graduate', 'is_intern', 'nationality', 'ethnicity',
          'graduation_date', 'school_type', 'education_mode', 'job_level',
          'base_position', 'position_name', 'position_level', 'employee_type',
          'employee_category', 'customer_name', 'project_name', 'project_type',
          'skill_name', 'is_current_skill', 'is_main_skill', 'skill_path',
          'proficiency', 'monthly_salary', 'performance_2023', 'performance_2024',
          'performance_2025'
        ];
        
        const placeholders = fields.map(() => '?').join(', ');
        
        const params = [
          talentId,
          row['工号'] ? String(row['工号']) : null,
          row['姓名'] || '',
          row['性别'] || null,
          row['年龄'] || null,
          row['最高学历'] || null,
          row['毕业院校1'] || null,
          row['专业1'] || null,
          row['工作年限'] || 0,
          row['IT从业年限'] || 0,
          row['行业'] || null,
          row['英语水平'] || null,
          row['法人实体'] || null,
          row['职务序列'] || null,
          isKeyTalent,
          status,
          row['办公地点'] || row['工作意向地'] || null,
          entryDate,
          row['婚姻状况'] || null,
          row['政治面貌'] || null,
          row['组织所在地'] || null,
          row['身份证号'] || null,
          birthDate,
          row['主技能'] || null,
          parseYesNo(row['是否应届生']),
          parseYesNo(row['是否实习生']),
          row['国籍'] || null,
          row['民族'] || null,
          graduationDate,
          row['院校类型1'] || null,
          row['学习方式1'] || null,
          row['职级'] || null,
          row['基准职位'] || null,
          row['岗位'] || null,
          row['岗位职级'] || null,
          row['员工类别'] || null,
          row['员工类型(运营)'] || null,
          row['客户名称'] || null,
          row['项目名称'] || null,
          row['项目类型'] || null,
          row['技能名称'] || null,
          parseYesNo(row['是否是当前技能']),
          parseYesNo(row['是否是主技能']),
          row['技能路径'] || null,
          row['熟练程度'] || null,
          row['月标准工费'] || 0,
          row['2023年度绩效'] || null,
          row['2024年度绩效'] || null,
          row['2025年度绩效'] || null
        ];

        await connection.execute(
          `INSERT INTO hr_talent (${fields.join(', ')}) VALUES (${placeholders})`,
          params
        );

        successCount++;
        if (successCount % 100 === 0) {
          console.log(`已导入 ${successCount}/${data.length} 条...`);
        }
      } catch (error) {
        errorCount++;
        if (errorCount <= 3) {
          console.error(`导入第 ${i + 1} 条数据失败:`, error.message);
        }
      }
    }

    console.log(`\n员工数据导入完成！成功: ${successCount}, 失败: ${errorCount}`);

    // 生成简历调取记录
    console.log('\n生成简历调取记录...');
    const [talents] = await connection.execute("SELECT talent_id, name FROM hr_talent WHERE status = '在职' LIMIT 200");
    
    if (talents.length > 0) {
      const depts = ['人力资源部', '研发中心', 'AI实验室', '销售部', '产品部', '质量部'];
      const purposes = ['招聘评估', '技术面试', '人才盘点', '晋升评估', '薪酬调整', '项目分配'];

      for (let i = 0; i < Math.min(200, talents.length); i++) {
        const talent = talents[i];
        const qualityScore = Math.floor(Math.random() * 40) + 60;
        const accessTime = new Date();
        accessTime.setDate(accessTime.getDate() - Math.floor(Math.random() * 90));

        await connection.execute(
          `INSERT INTO hr_resume_access (access_id, talent_id, talent_name, access_type, access_by, access_dept, purpose, is_high_quality, quality_score, access_time)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            `ACC${String(i + 1).padStart(5, '0')}`,
            talent.talent_id,
            talent.name,
            Math.floor(Math.random() * 3) + 1,
            `HR${Math.floor(Math.random() * 10) + 1}`,
            depts[Math.floor(Math.random() * depts.length)],
            purposes[Math.floor(Math.random() * purposes.length)],
            qualityScore >= 80 ? 1 : 0,
            qualityScore,
            accessTime.toISOString().slice(0, 19).replace('T', ' ')
          ]
        );
      }
      console.log(`已生成 ${Math.min(200, talents.length)} 条简历调取记录`);
    }

    // 插入示例招聘需求
    console.log('\n插入示例招聘需求...');
    await connection.execute(
      `INSERT INTO hr_job_requirement (req_id, title, dept_name, position_name, required_skills, work_years_min, work_years_max, education_level, headcount, priority, status, description)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ['REQ001', '高级Java后端工程师', '研发中心', '高级Java工程师', '["Java", "Spring Boot", "MySQL", "Redis", "微服务"]', 5, 10, '本科', 2, 3, 1, '负责公司核心业务系统的后端开发，需要具备丰富的Java开发经验和微服务架构设计能力']
    );
    await connection.execute(
      `INSERT INTO hr_job_requirement (req_id, title, dept_name, position_name, required_skills, work_years_min, work_years_max, education_level, headcount, priority, status, description)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ['REQ002', 'AI算法工程师', 'AI实验室', 'AI算法工程师', '["Python", "TensorFlow", "PyTorch", "NLP", "机器学习"]', 3, 8, '硕士', 1, 3, 1, '负责智能推荐系统的算法研发和优化，需要具备深度学习和自然语言处理经验']
    );
    console.log('示例招聘需求已插入');

    // 统计信息
    console.log('\n========== 数据统计 ==========');
    const [talentCount] = await connection.execute('SELECT COUNT(*) as count FROM hr_talent');
    const [activeCount] = await connection.execute("SELECT COUNT(*) as count FROM hr_talent WHERE status = '在职'");
    const [keyTalentCount] = await connection.execute('SELECT COUNT(*) as count FROM hr_talent WHERE is_key_talent = 1');
    const [eduStats] = await connection.execute('SELECT education_level, COUNT(*) as count FROM hr_talent GROUP BY education_level ORDER BY count DESC');

    console.log(`总员工数: ${talentCount[0].count}`);
    console.log(`在职员工数: ${activeCount[0].count}`);
    console.log(`关键人才数: ${keyTalentCount[0].count}`);
    console.log('\n学历分布:');
    eduStats.forEach(row => {
      console.log(`  ${row.education_level || '未填写'}: ${row.count}`);
    });

    await connection.end();
    console.log('\n数据导入全部完成！');
    process.exit(0);
  } catch (error) {
    console.error('导入失败:', error);
    await connection.end();
    process.exit(1);
  }
}

importData();
