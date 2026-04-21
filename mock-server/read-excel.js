const xlsx = require('xlsx');
const fs = require('fs');

const filePath = 'd:/code/人力资源/附件1-Bootcamp虚拟数据（to 测试） -20260409.xlsx';

// 读取Excel文件
const workbook = xlsx.readFile(filePath);

console.log('Excel文件中的所有Sheet:');
workbook.SheetNames.forEach((name, index) => {
  console.log(`  ${index + 1}. ${name}`);
});

// 读取每个Sheet的数据
workbook.SheetNames.forEach(sheetName => {
  const worksheet = workbook.Sheets[sheetName];
  const data = xlsx.utils.sheet_to_json(worksheet);
  console.log(`\n=== ${sheetName} ===`);
  console.log('数据条数:', data.length);
  if (data.length > 0) {
    console.log('字段名:', Object.keys(data[0]).join(', '));
    console.log('前3条数据:');
    data.slice(0, 3).forEach((row, i) => {
      console.log(`  ${i + 1}.`, JSON.stringify(row).substring(0, 200) + '...');
    });
  }
});
