const xlsx = require('xlsx');

const filePath = 'd:/code/人力资源/附件1-Bootcamp虚拟数据（to 测试） -20260409.xlsx';
const workbook = xlsx.readFile(filePath);

// 读取员工数据
const worksheet = workbook.Sheets['员工数据_清洁版'];
const data = xlsx.utils.sheet_to_json(worksheet);

console.log('总数据条数:', data.length);
console.log('\n所有字段名:');
const fields = Object.keys(data[0]);
fields.forEach((field, index) => {
  console.log(`  ${index + 1}. ${field}`);
});

console.log('\n第一条完整数据:');
const firstRow = data[0];
fields.forEach(field => {
  const value = firstRow[field];
  const displayValue = value === undefined ? '(空)' : String(value).substring(0, 50);
  console.log(`  ${field}: ${displayValue}`);
});

// 统计一些关键字段的唯一值
console.log('\n关键字段统计:');

// 人员状态
const statusSet = new Set(data.map(r => r['人员状态']).filter(Boolean));
console.log('人员状态种类:', Array.from(statusSet).join(', '));

// 学历
const eduSet = new Set(data.map(r => r['最高学历']).filter(Boolean));
console.log('最高学历种类:', Array.from(eduSet).join(', '));

// 职务序列
const positionSet = new Set(data.map(r => r['职务序列']).filter(Boolean));
console.log('职务序列种类数:', positionSet.size);

// 行业
const industrySet = new Set(data.map(r => r['行业']).filter(Boolean));
console.log('行业种类:', Array.from(industrySet).join(', '));

// 导出为JSON文件供后续使用
const fs = require('fs');
fs.writeFileSync('d:/code/人力资源/hr-agent-system/mock-server/employee-data.json', JSON.stringify(data, null, 2));
console.log('\n数据已导出到 employee-data.json');
