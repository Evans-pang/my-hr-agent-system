const axios = require('axios');

const BASE_URL = 'http://localhost:8082/api';

async function testAPI() {
  console.log('========== 测试API ==========\n');
  
  try {
    // 1. 测试人才列表 - 默认排序（在职优先）
    console.log('1. 测试人才列表（默认排序）');
    const listRes = await axios.get(`${BASE_URL}/talent/list?page=1&pageSize=5`);
    if (listRes.data.code === 200) {
      console.log('✅ 人才列表API正常');
      console.log(`   总数: ${listRes.data.data.total}`);
      console.log('   前5条数据状态:', listRes.data.data.list.map(t => t.status).join(', '));
    }
    
    // 2. 测试人才列表 - 筛选在职人员
    console.log('\n2. 测试人才列表（筛选在职）');
    const activeRes = await axios.get(`${BASE_URL}/talent/list?page=1&pageSize=5&status=在职`);
    if (activeRes.data.code === 200) {
      console.log('✅ 状态筛选API正常');
      console.log(`   在职人员数: ${activeRes.data.data.total}`);
    }
    
    // 3. 测试人才列表 - 筛选离职人员
    console.log('\n3. 测试人才列表（筛选离职）');
    const inactiveRes = await axios.get(`${BASE_URL}/talent/list?page=1&pageSize=5&status=离职`);
    if (inactiveRes.data.code === 200) {
      console.log('✅ 离职筛选API正常');
      console.log(`   离职人员数: ${inactiveRes.data.data.total}`);
    }
    
    // 4. 测试智能搜索
    console.log('\n4. 测试智能搜索');
    const searchRes = await axios.get(`${BASE_URL}/talent/search?keyword=测试工程师&useWenxin=false`);
    if (searchRes.data.code === 200) {
      console.log('✅ 智能搜索API正常');
      console.log(`   搜索结果数: ${searchRes.data.data.length}`);
      if (searchRes.data.data.length > 0) {
        console.log('   第一条:', searchRes.data.data[0].name, '|', searchRes.data.data[0].positionName);
      }
    }
    
    // 5. 测试搜索Java
    console.log('\n5. 测试搜索Java');
    const javaRes = await axios.get(`${BASE_URL}/talent/search?keyword=Java开发工程师&useWenxin=false`);
    if (javaRes.data.code === 200) {
      console.log('✅ Java搜索正常');
      console.log(`   搜索结果数: ${javaRes.data.data.length}`);
    }
    
    console.log('\n========== 测试完成 ==========');
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    if (error.response) {
      console.error('   状态码:', error.response.status);
      console.error('   错误信息:', error.response.data);
    }
  }
}

testAPI();
