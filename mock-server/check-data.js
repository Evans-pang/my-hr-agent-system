const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '123456',
  database: 'workspace_management',
  charset: 'utf8mb4'
};

async function checkData() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log('检查数据库中的实际数据量...\n');
    
    // 检查总员工数
    const [totalResult] = await connection.execute('SELECT COUNT(*) as count FROM hr_talent');
    console.log('hr_talent 表总记录数:', totalResult[0].count);
    
    // 检查在职员工数
    const [activeResult] = await connection.execute("SELECT COUNT(*) as count FROM hr_talent WHERE status = '在职'");
    console.log('在职员工数:', activeResult[0].count);
    
    // 检查离职员工数
    const [inactiveResult] = await connection.execute("SELECT COUNT(*) as count FROM hr_talent WHERE status != '在职' OR status IS NULL");
    console.log('非在职员工数:', inactiveResult[0].count);
    
    // 查看状态分布
    const [statusDist] = await connection.execute('SELECT status, COUNT(*) as count FROM hr_talent GROUP BY status');
    console.log('\n状态分布:');
    statusDist.forEach(row => {
      console.log(`  ${row.status || 'NULL'}: ${row.count}`);
    });
    
    // 查看前10条数据
    const [sampleData] = await connection.execute('SELECT talent_id, name, status, is_key_talent FROM hr_talent LIMIT 10');
    console.log('\n前10条数据样本:');
    sampleData.forEach((row, i) => {
      console.log(`  ${i+1}. ${row.talent_id} - ${row.name} - 状态:${row.status} - 关键人才:${row.is_key_talent}`);
    });
    
    // 检查简历调取记录
    const [accessResult] = await connection.execute('SELECT COUNT(*) as count FROM hr_resume_access');
    console.log('\n简历调取记录数:', accessResult[0].count);
    
    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error('检查失败:', error);
    await connection.end();
    process.exit(1);
  }
}

checkData();
