const { query, testConnection } = require('./db');

async function checkData() {
  try {
    await testConnection();
    
    // 检查表是否存在
    const tableCheck = await query(`
      SELECT COUNT(*) as count FROM information_schema.tables 
      WHERE table_schema = 'workspace_management' 
      AND table_name = 'hr_resume_access'
    `);
    console.log('简历调取记录表存在:', tableCheck[0].count > 0);
    
    if (tableCheck[0].count > 0) {
      // 查询数据条数
      const countResult = await query('SELECT COUNT(*) as total FROM hr_resume_access');
      console.log('简历调取记录数量:', countResult[0].total);
      
      // 查询统计数据
      const statsResult = await query(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN is_high_quality = 1 THEN 1 ELSE 0 END) as high_quality_count,
          AVG(quality_score) as avg_score
        FROM hr_resume_access
      `);
      console.log('\n统计信息:');
      console.log('  总调取次数:', statsResult[0].total);
      console.log('  优质简历数:', statsResult[0].high_quality_count);
      console.log('  平均质量分:', Math.round(statsResult[0].avg_score || 0));
      console.log('  优质覆盖率:', Math.round((statsResult[0].high_quality_count / statsResult[0].total) * 100) + '%');
      
      // 查询几条示例数据
      const sampleData = await query('SELECT * FROM hr_resume_access LIMIT 5');
      console.log('\n示例数据:');
      sampleData.forEach((row, i) => {
        console.log(`  ${i+1}. ${row.access_id} - ${row.talent_name} - ${row.access_dept} - 质量:${row.quality_score}`);
      });
    } else {
      console.log('简历调取记录表不存在，需要重新初始化数据库');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('错误:', error.message);
    process.exit(1);
  }
}

checkData();
