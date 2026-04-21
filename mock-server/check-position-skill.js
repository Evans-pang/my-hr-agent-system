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
    console.log('检查职位和技能字段...\n');
    
    // 查看职位分布
    const [positionResult] = await connection.execute(`
      SELECT position_name, COUNT(*) as count 
      FROM hr_talent 
      WHERE position_name IS NOT NULL AND position_name != ''
      GROUP BY position_name 
      ORDER BY count DESC 
      LIMIT 20
    `);
    console.log('职位分布(前20):');
    positionResult.forEach(row => {
      console.log(`  ${row.position_name}: ${row.count}`);
    });
    
    // 查看技能名称分布
    const [skillResult] = await connection.execute(`
      SELECT skill_name, COUNT(*) as count 
      FROM hr_talent 
      WHERE skill_name IS NOT NULL AND skill_name != ''
      GROUP BY skill_name 
      ORDER BY count DESC 
      LIMIT 20
    `);
    console.log('\n技能名称分布(前20):');
    skillResult.forEach(row => {
      console.log(`  ${row.skill_name}: ${row.count}`);
    });
    
    // 查看主技能分布
    const [mainSkillResult] = await connection.execute(`
      SELECT main_skill, COUNT(*) as count 
      FROM hr_talent 
      WHERE main_skill IS NOT NULL AND main_skill != ''
      GROUP BY main_skill 
      ORDER BY count DESC 
      LIMIT 20
    `);
    console.log('\n主技能分布(前20):');
    mainSkillResult.forEach(row => {
      console.log(`  ${row.main_skill}: ${row.count}`);
    });
    
    // 查看基准职位分布
    const [basePositionResult] = await connection.execute(`
      SELECT base_position, COUNT(*) as count 
      FROM hr_talent 
      WHERE base_position IS NOT NULL AND base_position != ''
      GROUP BY base_position 
      ORDER BY count DESC 
      LIMIT 20
    `);
    console.log('\n基准职位分布(前20):');
    basePositionResult.forEach(row => {
      console.log(`  ${row.base_position}: ${row.count}`);
    });
    
    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error('检查失败:', error);
    await connection.end();
    process.exit(1);
  }
}

checkData();
