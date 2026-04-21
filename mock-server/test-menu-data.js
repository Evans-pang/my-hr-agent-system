const axios = require('axios');

const BASE_URL = 'http://localhost:8082/api';

async function testMenuData() {
  console.log('========== 测试各菜单数据 ==========\n');
  
  try {
    // 1. 人才盘点
    console.log('1. 人才盘点 API');
    const inventoryRes = await axios.get(`${BASE_URL}/talent/inventory`);
    if (inventoryRes.data.code === 200) {
      console.log('✅ 人才盘点API正常');
      console.log(`   数据条数: ${inventoryRes.data.data.length}`);
      if (inventoryRes.data.data.length > 0) {
        console.log('   第一条:', inventoryRes.data.data[0].name, '|', inventoryRes.data.data[0].performance, '|', inventoryRes.data.data[0].potential);
      }
    } else {
      console.log('❌ 人才盘点API失败:', inventoryRes.data.message);
    }
    
    // 2. 数据报告
    console.log('\n2. 数据报告 API');
    const reportRes = await axios.get(`${BASE_URL}/report/overview`);
    if (reportRes.data.code === 200) {
      console.log('✅ 数据报告API正常');
      console.log('   概览:', JSON.stringify(reportRes.data.data.overview));
    } else {
      console.log('❌ 数据报告API失败:', reportRes.data.message);
    }
    
    // 3. 关键人才
    console.log('\n3. 关键人才 API');
    const keyTalentRes = await axios.get(`${BASE_URL}/talent/key-talent-dashboard`);
    if (keyTalentRes.data.code === 200) {
      console.log('✅ 关键人才API正常');
      console.log(`   关键人才数: ${keyTalentRes.data.data.stats.totalKeyTalent}`);
      console.log(`   列表条数: ${keyTalentRes.data.data.keyTalents?.length || 0}`);
    } else {
      console.log('❌ 关键人才API失败:', keyTalentRes.data.message);
    }
    
    // 4. 人才列表（用于人才画像）
    console.log('\n4. 人才列表 API');
    const listRes = await axios.get(`${BASE_URL}/talent/list?page=1&pageSize=10`);
    if (listRes.data.code === 200) {
      console.log('✅ 人才列表API正常');
      console.log(`   总数: ${listRes.data.data.total}`);
      console.log(`   当前页条数: ${listRes.data.data.list?.length || 0}`);
    } else {
      console.log('❌ 人才列表API失败:', listRes.data.message);
    }
    
    console.log('\n========== 测试完成 ==========');
  } catch (error) {
    console.error('测试失败:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('   后端服务未启动，请先启动服务');
    }
  }
}

testMenuData();
