const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '123456',
  database: 'workspace_management',
  charset: 'utf8mb4'
};

async function checkFields() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log('检查真实数据的部门相关字段...\n');
    
    // 查看法人实体分布
    const [legalResult] = await connection.execute(`
      SELECT legal_entity, COUNT(*) as count 
      FROM hr_talent 
      WHERE legal_entity IS NOT NULL AND legal_entity != ''
      GROUP BY legal_entity 
      ORDER BY count DESC 
      LIMIT 10
    `);
    console.log('法人实体分布(前10):');
    legalResult.forEach(row => {
      console.log(`  ${row.legal_entity}: ${row.count}`);
    });
    
    // 查看组织所在地分布
    const [orgResult] = await connection.execute(`
      SELECT organization_location, COUNT(*) as count 
      FROM hr_talent 
      WHERE organization_location IS NOT NULL AND organization_location != ''
      GROUP BY organization_location 
      ORDER BY count DESC 
      LIMIT 10
    `);
    console.log('\n组织所在地分布(前10):');
    orgResult.forEach(row => {
      console.log(`  ${row.organization_location}: ${row.count}`);
    });
    
    // 查看职务序列分布
    const [positionSeqResult] = await connection.execute(`
      SELECT position_sequence, COUNT(*) as count 
      FROM hr_talent 
      WHERE position_sequence IS NOT NULL AND position_sequence != ''
      GROUP BY position_sequence 
      ORDER BY count DESC 
      LIMIT 10
    `);
    console.log('\n职务序列分布(前10):');
    positionSeqResult.forEach(row => {
      console.log(`  ${row.position_sequence}: ${row.count}`);
    });
    
    // 查看学历分布
    const [eduResult] = await connection.execute(`
      SELECT education_level, COUNT(*) as count 
      FROM hr_talent 
      WHERE education_level IS NOT NULL AND education_level != ''
      GROUP BY education_level 
      ORDER BY count DESC
    `);
    console.log('\n学历分布:');
    eduResult.forEach(row => {
      console.log(`  ${row.education_level}: ${row.count}`);
    });
    
    // 查看部门字段（dept_name）
    const [deptResult] = await connection.execute(`
      SELECT dept_name, COUNT(*) as count 
      FROM hr_talent 
      WHERE dept_name IS NOT NULL AND dept_name != ''
      GROUP BY dept_name 
      ORDER BY count DESC 
      LIMIT 5
    `);
    console.log('\ndept_name字段分布(前5):');
    if (deptResult.length === 0) {
      console.log('  (空)');
    } else {
      deptResult.forEach(row => {
        console.log(`  ${row.dept_name}: ${row.count}`);
      });
    }
    
    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error('检查失败:', error);
    await connection.end();
    process.exit(1);
  }
}

checkFields();
