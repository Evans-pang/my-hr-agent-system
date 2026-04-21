const mysql = require('mysql2/promise');

// 数据库配置
const dbConfig = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '123456',
  database: 'workspace_management',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4',
  // 添加连接时设置字符集
  connectTimeout: 10000,
  acquireTimeout: 10000
};

// 创建连接池
const pool = mysql.createPool(dbConfig);

// 测试连接
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('数据库连接成功');
    // 设置字符集为utf8mb4
    await connection.execute('SET NAMES utf8mb4');
    await connection.execute('SET CHARACTER SET utf8mb4');
    connection.release();
    return true;
  } catch (error) {
    console.error('数据库连接失败:', error.message);
    return false;
  }
}

// 执行查询
async function query(sql, params) {
  try {
    const connection = await pool.getConnection();
    await connection.execute('SET NAMES utf8mb4');
    const [results] = await connection.execute(sql, params);
    connection.release();
    return results;
  } catch (error) {
    console.error('查询失败:', error.message);
    throw error;
  }
}

// 执行插入并返回插入的ID
async function insert(sql, params) {
  try {
    const connection = await pool.getConnection();
    await connection.execute('SET NAMES utf8mb4');
    const [result] = await connection.execute(sql, params);
    connection.release();
    return result.insertId;
  } catch (error) {
    console.error('插入失败:', error.message);
    throw error;
  }
}

// 执行更新
async function update(sql, params) {
  try {
    const connection = await pool.getConnection();
    await connection.execute('SET NAMES utf8mb4');
    const [result] = await connection.execute(sql, params);
    connection.release();
    return result.affectedRows;
  } catch (error) {
    console.error('更新失败:', error.message);
    throw error;
  }
}

// 执行删除
async function remove(sql, params) {
  try {
    const connection = await pool.getConnection();
    await connection.execute('SET NAMES utf8mb4');
    const [result] = await connection.execute(sql, params);
    connection.release();
    return result.affectedRows;
  } catch (error) {
    console.error('删除失败:', error.message);
    throw error;
  }
}

// 执行SQL文件
async function executeSqlFile(filePath) {
  const fs = require('fs');
  const path = require('path');
  
  try {
    const sql = fs.readFileSync(filePath, 'utf8');
    const statements = sql.split(';').filter(s => s.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await query(statement);
        } catch (e) {
          console.warn('执行SQL语句失败:', e.message);
        }
      }
    }
    console.log('SQL文件执行完成:', path.basename(filePath));
    return true;
  } catch (error) {
    console.error('执行SQL文件失败:', error.message);
    return false;
  }
}

module.exports = {
  pool,
  testConnection,
  query,
  insert,
  update,
  remove,
  executeSqlFile
};
