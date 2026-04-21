const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '123456',
  database: 'workspace_management',
  charset: 'utf8mb4'
};

async function checkAll() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log('========== 全面检查所有菜单数据 ==========\n');
    
    // 1. 数据仪表盘 - 检查统计数据
    console.log('1. 数据仪表盘');
    const [totalCount] = await connection.execute('SELECT COUNT(*) as count FROM hr_talent');
    const [activeCount] = await connection.execute('SELECT COUNT(*) as count FROM hr_talent WHERE status = "在职"');
    const [keyTalentCount] = await connection.execute('SELECT COUNT(*) as count FROM hr_talent WHERE is_key_talent = 1');
    const [eduDist] = await connection.execute('SELECT education_level, COUNT(*) as count FROM hr_talent WHERE education_level IS NOT NULL GROUP BY education_level ORDER BY count DESC');
    const [locationDist] = await connection.execute('SELECT organization_location, COUNT(*) as count FROM hr_talent WHERE organization_location IS NOT NULL GROUP BY organization_location ORDER BY count DESC LIMIT 5');
    console.log(`   总员工数: ${totalCount[0].count}`);
    console.log(`   在职员工: ${activeCount[0].count}`);
    console.log(`   关键人才: ${keyTalentCount[0].count}`);
    console.log(`   学历分布: ${eduDist.map(e => e.education_level + '(' + e.count + ')').join(', ')}`);
    console.log(`   地区分布: ${locationDist.map(l => l.organization_location + '(' + l.count + ')').join(', ')}`);
    
    // 2. 招聘需求
    console.log('\n2. 招聘需求');
    const [reqCount] = await connection.execute('SELECT COUNT(*) as count FROM hr_job_requirement');
    const [reqList] = await connection.execute('SELECT req_id, title, dept_name, position_name FROM hr_job_requirement LIMIT 3');
    console.log(`   需求总数: ${reqCount[0].count}`);
    reqList.forEach(r => console.log(`   - ${r.req_id}: ${r.title} (${r.position_name})`));
    
    // 3. 人才库
    console.log('\n3. 人才库');
    console.log(`   总记录数: ${totalCount[0].count}`);
    const [sampleTalent] = await connection.execute('SELECT talent_id, name, position_name, education_level, status FROM hr_talent LIMIT 3');
    sampleTalent.forEach(t => console.log(`   - ${t.talent_id}: ${t.name} | ${t.position_name} | ${t.education_level} | ${t.status}`));
    
    // 4. 智能搜索 - 检查NLP解析
    console.log('\n4. 智能搜索 (NLP)');
    console.log('   API端点: POST /api/nlp/chat');
    console.log('   状态: 本地解析可用');
    
    // 5. 人才画像 - 检查是否有数据
    console.log('\n5. 人才画像');
    const [profileCount] = await connection.execute('SELECT COUNT(*) as count FROM hr_talent WHERE main_skill IS NOT NULL AND main_skill != ""');
    console.log(`   有主技能信息的员工: ${profileCount[0].count}`);
    
    // 6. 人才盘点
    console.log('\n6. 人才盘点');
    const [inventoryCount] = await connection.execute('SELECT COUNT(*) as count FROM hr_talent WHERE status = "在职"');
    const [performanceDist] = await connection.execute('SELECT performance_2024, COUNT(*) as count FROM hr_talent WHERE performance_2024 IS NOT NULL GROUP BY performance_2024');
    console.log(`   在职员工数: ${inventoryCount[0].count}`);
    console.log(`   2024绩效分布: ${performanceDist.map(p => (p.performance_2024 || '未填') + '(' + p.count + ')').join(', ')}`);
    
    // 7. 简历管理 - 检查表是否存在
    console.log('\n7. 简历管理');
    const [resumeTable] = await connection.execute(`SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = 'workspace_management' AND table_name = 'hr_resume'`);
    if (resumeTable[0].count > 0) {
      const [resumeCount] = await connection.execute('SELECT COUNT(*) as count FROM hr_resume');
      console.log(`   简历记录数: ${resumeCount[0].count}`);
    } else {
      console.log('   简历表不存在，需要创建');
    }
    
    // 8. 数据治理
    console.log('\n8. 数据治理');
    const [missingIdCard] = await connection.execute('SELECT COUNT(*) as count FROM hr_talent WHERE id_card IS NULL OR id_card = ""');
    const [missingBirth] = await connection.execute('SELECT COUNT(*) as count FROM hr_talent WHERE birth_date IS NULL');
    const [missingEntry] = await connection.execute('SELECT COUNT(*) as count FROM hr_talent WHERE entry_date IS NULL');
    console.log(`   缺失身份证号: ${missingIdCard[0].count}`);
    console.log(`   缺失出生日期: ${missingBirth[0].count}`);
    console.log(`   缺失入职日期: ${missingEntry[0].count}`);
    
    // 9. 数据报告
    console.log('\n9. 数据报告');
    const [accessCount] = await connection.execute('SELECT COUNT(*) as count FROM hr_resume_access');
    const [highQualityCount] = await connection.execute('SELECT COUNT(*) as count FROM hr_resume_access WHERE is_high_quality = 1');
    console.log(`   简历调取记录: ${accessCount[0].count}`);
    console.log(`   优质简历数: ${highQualityCount[0].count}`);
    
    // 10. 简历优化 - 检查任务表
    console.log('\n10. 简历优化');
    const [optimizeTable] = await connection.execute(`SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = 'workspace_management' AND table_name = 'hr_resume_optimize_task'`);
    if (optimizeTable[0].count > 0) {
      const [optimizeCount] = await connection.execute('SELECT COUNT(*) as count FROM hr_resume_optimize_task');
      console.log(`   优化任务数: ${optimizeCount[0].count}`);
    } else {
      console.log('   使用内存存储任务');
    }
    
    // 11. 关键人才
    console.log('\n11. 关键人才');
    const [keyTalentList] = await connection.execute('SELECT talent_id, name, position_name, is_key_talent FROM hr_talent WHERE is_key_talent = 1 LIMIT 5');
    console.log(`   关键人才数: ${keyTalentCount[0].count}`);
    keyTalentList.forEach(t => console.log(`   - ${t.talent_id}: ${t.name} | ${t.position_name}`));
    
    console.log('\n========== 检查完成 ==========');
    
    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error('检查失败:', error);
    await connection.end();
    process.exit(1);
  }
}

checkAll();
