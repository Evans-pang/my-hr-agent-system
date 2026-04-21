const xlsx = require('xlsx');
const { query, insert, testConnection, executeSqlFile } = require('./db');
const path = require('path');

const filePath = 'd:/code/人力资源/附件1-Bootcamp虚拟数据（to 测试） -20260409.xlsx';

// Excel日期转换
function excelDateToJSDate(excelDate) {
  if (!excelDate) return null;
  if (typeof excelDate === 'string') {
    // 尝试解析字符串日期
    const date = new Date(excelDate);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
    return null;
  }
  // Excel日期是从1900年1月1日开始的天数
  const epoch = new Date(1900, 0, 1);
  const days = Math.floor(excelDate) - 2; // Excel认为1900年是闰年
  const date = new Date(epoch.getTime() + days * 24 * 60 * 60 * 1000);
  return date.toISOString().split('T')[0];
}

// 转换是否字段
function parseYesNo(value) {
  if (value === '是' || value === 'Y' || value === 'y' || value === 1 || value === '1') return 1;
  return 0;
}

// 生成人才编号
function generateTalentId(index) {
  return 'E' + String(index + 1).padStart(9, '0');
}

async function importData() {
  try {
    await testConnection();
    console.log('数据库连接成功');

    // 先执行SQL创建表
    console.log('创建数据库表...');
    const sqlFilePath = path.join(__dirname, 'init-real-data.sql');
    await executeSqlFile(sqlFilePath);
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
        // 处理日期字段
        const entryDate = excelDateToJSDate(row['入职日期']);
        const birthDate = excelDateToJSDate(row['出生日期']);
        const graduationDate = excelDateToJSDate(row['毕业时间']);

        // 生成唯一ID
        const talentId = row['E编码'] || generateTalentId(i);

        // 判断是否关键人才（骨干）
        const isKeyTalent = parseYesNo(row['是否骨干']);

        // 处理状态
        const status = row['人员状态'] || '在职';

        await insert(`
          INSERT INTO hr_talent (
            talent_id, employee_no, name, gender, age, education_level,
            school_name, major, work_years, it_work_years, industry,
            english_level, legal_entity, position_sequence, is_key_talent,
            status, work_location, entry_date, marital_status, political_status,
            organization_location, id_card, birth_date, main_skill,
            is_fresh_graduate, is_intern, nationality, ethnicity,
            graduation_date, school_type, education_mode, job_level,
            base_position, position_name, position_level, employee_type,
            employee_category, customer_name, project_name, project_type,
            skill_name, is_current_skill, is_main_skill, skill_path,
            proficiency, monthly_salary, performance_2023, performance_2024,
            performance_2025
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          talentId,
          row['工号'] ? String(row['工号']) : null,
          row['姓名'],
          row['性别'],
          row['年龄'] || null,
          row['最高学历'],
          row['毕业院校1'],
          row['专业1'],
          row['工作年限'] || 0,
          row['IT从业年限'] || 0,
          row['行业'],
          row['英语水平'],
          row['法人实体'],
          row['职务序列'],
          isKeyTalent,
          status,
          row['办公地点'] || row['工作意向地'],
          entryDate,
          row['婚姻状况'],
          row['政治面貌'],
          row['组织所在地'],
          row['身份证号'],
          birthDate,
          row['主技能'],
          parseYesNo(row['是否应届生']),
          parseYesNo(row['是否实习生']),
          row['国籍'],
          row['民族'],
          graduationDate,
          row['院校类型1'],
          row['学习方式1'],
          row['职级'],
          row['基准职位'],
          row['岗位'],
          row['岗位职级'],
          row['员工类别'],
          row['员工类型(运营)'],
          row['客户名称'],
          row['项目名称'],
          row['项目类型'],
          row['技能名称'],
          parseYesNo(row['是否是当前技能']),
          parseYesNo(row['是否是主技能']),
          row['技能路径'],
          row['熟练程度'],
          row['月标准工费'] || 0,
          row['2023年度绩效'],
          row['2024年度绩效'],
          row['2025年度绩效']
        ]);

        successCount++;
        if (successCount % 100 === 0) {
          console.log(`已导入 ${successCount}/${data.length} 条...`);
        }
      } catch (error) {
        errorCount++;
        console.error(`导入第 ${i + 1} 条数据失败:`, error.message);
        console.error('数据:', JSON.stringify(row).substring(0, 200));
      }
    }

    console.log(`\n导入完成！成功: ${successCount}, 失败: ${errorCount}`);

    // 生成一些简历调取记录数据（基于真实员工）
    console.log('\n生成简历调取记录...');
    const accessTypes = ['查看', '下载', '导出'];
    const purposes = ['招聘评估', '技术面试', '人才盘点', '晋升评估', '薪酬调整', '项目分配'];
    const depts = ['人力资源部', '研发中心', 'AI实验室', '销售部', '产品部', '质量部'];

    // 获取所有在职员工ID
    const talents = await query("SELECT talent_id, name FROM hr_talent WHERE status = '在职' LIMIT 200");

    for (let i = 0; i < 200; i++) {
      const talent = talents[i % talents.length];
      const accessType = Math.floor(Math.random() * 3) + 1;
      const qualityScore = Math.floor(Math.random() * 40) + 60; // 60-100分
      const isHighQuality = qualityScore >= 80 ? 1 : 0;
      const accessTime = new Date();
      accessTime.setDate(accessTime.getDate() - Math.floor(Math.random() * 90)); // 最近90天

      await insert(`
        INSERT INTO hr_resume_access (access_id, talent_id, talent_name, access_type, access_by, access_dept, purpose, is_high_quality, quality_score, access_time)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        `ACC${String(i + 1).padStart(5, '0')}`,
        talent.talent_id,
        talent.name,
        accessType,
        `HR${Math.floor(Math.random() * 10) + 1}`,
        depts[Math.floor(Math.random() * depts.length)],
        purposes[Math.floor(Math.random() * purposes.length)],
        isHighQuality,
        qualityScore,
        accessTime.toISOString().slice(0, 19).replace('T', ' ')
      ]);
    }
    console.log('已生成 200 条简历调取记录');

    // 插入示例招聘需求
    console.log('\n插入示例招聘需求...');
    await insert(`
      INSERT INTO hr_job_requirement (req_id, title, dept_name, position_name, required_skills, work_years_min, work_years_max, education_level, headcount, priority, status, description)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, ['REQ001', '高级Java后端工程师', '研发中心', '高级Java工程师', '["Java", "Spring Boot", "MySQL", "Redis", "微服务"]', 5, 10, '本科', 2, 3, 1, '负责公司核心业务系统的后端开发，需要具备丰富的Java开发经验和微服务架构设计能力']);

    await insert(`
      INSERT INTO hr_job_requirement (req_id, title, dept_name, position_name, required_skills, work_years_min, work_years_max, education_level, headcount, priority, status, description)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, ['REQ002', 'AI算法工程师', 'AI实验室', 'AI算法工程师', '["Python", "TensorFlow", "PyTorch", "NLP", "机器学习"]', 3, 8, '硕士', 1, 3, 1, '负责智能推荐系统的算法研发和优化，需要具备深度学习和自然语言处理经验']);

    await insert(`
      INSERT INTO hr_job_requirement (req_id, title, dept_name, position_name, required_skills, work_years_min, work_years_max, education_level, headcount, priority, status, description)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, ['REQ003', '前端开发工程师', '研发中心', '前端工程师', '["React", "Vue", "TypeScript", "Node.js"]', 3, 5, '本科', 2, 2, 1, '负责公司前端产品的开发和维护，需要熟悉主流前端框架']);

    console.log('示例招聘需求已插入');

    // 统计信息
    console.log('\n========== 数据统计 ==========');
    const talentCount = await query('SELECT COUNT(*) as count FROM hr_talent');
    const activeCount = await query("SELECT COUNT(*) as count FROM hr_talent WHERE status = '在职'");
    const keyTalentCount = await query('SELECT COUNT(*) as count FROM hr_talent WHERE is_key_talent = 1');
    const eduStats = await query('SELECT education_level, COUNT(*) as count FROM hr_talent GROUP BY education_level ORDER BY count DESC');
    const industryStats = await query('SELECT industry, COUNT(*) as count FROM hr_talent GROUP BY industry ORDER BY count DESC LIMIT 5');

    console.log(`总员工数: ${talentCount[0].count}`);
    console.log(`在职员工数: ${activeCount[0].count}`);
    console.log(`关键人才数: ${keyTalentCount[0].count}`);
    console.log('\n学历分布:');
    eduStats.forEach(row => {
      console.log(`  ${row.education_level || '未填写'}: ${row.count}`);
    });
    console.log('\n行业分布(Top5):');
    industryStats.forEach(row => {
      console.log(`  ${row.industry || '未填写'}: ${row.count}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('导入失败:', error);
    process.exit(1);
  }
}

importData();
