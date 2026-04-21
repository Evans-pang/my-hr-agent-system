const axios = require('axios');

const BASE_URL = 'http://localhost:8082/api';

async function testSearch() {
  console.log('========== 详细测试搜索 ==========\n');
  
  try {
    // 测试搜索 - 使用简单关键词
    console.log('1. 测试搜索"Java"');
    const res1 = await axios.get(`${BASE_URL}/talent/search?keyword=Java&useWenxin=false`);
    console.log('返回数据数:', res1.data.data.length);
    console.log('解析结果:', JSON.stringify(res1.data.parsed, null, 2));
    
    // 测试搜索 - 测试工程师
    console.log('\n2. 测试搜索"测试"');
    const res2 = await axios.get(`${BASE_URL}/talent/search?keyword=测试&useWenxin=false`);
    console.log('返回数据数:', res2.data.data.length);
    if (res2.data.data.length > 0) {
      console.log('第一条:', res2.data.data[0].name, '|', res2.data.data[0].positionName, '|', res2.data.data[0].skillName);
    }
    
    // 直接查询数据库看有多少测试相关的人才
    console.log('\n3. 直接查询职位包含"测试"的人才');
    const mysql = require('mysql2/promise');
    const connection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: '123456',
      database: 'workspace_management',
      charset: 'utf8mb4'
    });
    
    const [results] = await connection.execute(`
      SELECT COUNT(*) as count FROM hr_talent 
      WHERE position_name LIKE '%测试%' OR base_position LIKE '%测试%'
    `);
    console.log('数据库中职位包含"测试"的人数:', results[0].count);
    
    await connection.end();
    
  } catch (error) {
    console.error('测试失败:', error.message);
  }
}

testSearch();
