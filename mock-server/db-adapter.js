// 数据库适配层 - 兼容 MySQL 和 SQLite 的 API
// 让 server.js 可以无缝切换到 SQLite

const { db, testConnection, query, queryOne, insert, update, remove, executeSqlFile, transaction } = require('./db-sqlite');
const { initSQLiteTables, insertSampleData } = require('./init-sqlite');

// 兼容 MySQL 风格的异步 API
async function asyncTestConnection() {
  return testConnection();
}

async function asyncQuery(sql, params) {
  // 处理 SQLite 和 MySQL 的语法差异
  let adaptedSql = sql;
  
  // 替换 LIMIT ?, ? 为 LIMIT ? OFFSET ?
  adaptedSql = adaptedSql.replace(/LIMIT\s+\?\s*,\s*\?/gi, 'LIMIT ? OFFSET ?');
  
  // 替换 information_schema 查询
  if (adaptedSql.includes('information_schema.tables')) {
    // 转换为 SQLite 的 sqlite_master 查询
    adaptedSql = adaptedSql.replace(
      /SELECT\s+table_name\s+FROM\s+information_schema\.tables\s+WHERE\s+table_schema\s*=\s*['"]?\w+['"]?\s+AND\s+table_name\s+IN\s+\(([^)]+)\)/i,
      "SELECT name as table_name FROM sqlite_master WHERE type='table' AND name IN ($1)"
    );
  }
  
  // 处理 COUNT(*) 查询
  if (adaptedSql.includes('COUNT(*)')) {
    // SQLite 返回的 count 字段名可能需要适配
  }
  
  // 处理 ON DUPLICATE KEY UPDATE -> INSERT OR REPLACE
  if (adaptedSql.includes('ON DUPLICATE KEY UPDATE')) {
    adaptedSql = adaptedSql.replace(/INSERT\s+INTO\s+(\w+)\s*\(([^)]+)\)\s*VALUES\s*\(([^)]+)\)\s*ON\s+DUPLICATE\s+KEY\s+UPDATE\s+(.+)/i,
      'INSERT OR REPLACE INTO $1 ($2) VALUES ($3)');
  }
  
  return query(adaptedSql, params || []);
}

async function asyncInsert(sql, params) {
  return insert(sql, params || []);
}

async function asyncUpdate(sql, params) {
  return update(sql, params || []);
}

async function asyncRemove(sql, params) {
  return remove(sql, params || []);
}

async function asyncExecuteSqlFile(filePath) {
  return executeSqlFile(filePath);
}

// 初始化数据库（兼容原来的 initDatabase 流程）
async function initDatabase() {
  console.log('========== 开始数据库初始化 ==========');
  
  const connected = await asyncTestConnection();
  if (!connected) {
    console.error('数据库连接失败');
    process.exit(1);
  }
  
  // 初始化表结构
  initSQLiteTables();
  
  // 插入示例数据
  insertSampleData();
  
  console.log('========== 数据库初始化完成 ==========');
  return true;
}

module.exports = {
  testConnection: asyncTestConnection,
  query: asyncQuery,
  queryOne,
  insert: asyncInsert,
  update: asyncUpdate,
  remove: asyncRemove,
  executeSqlFile: asyncExecuteSqlFile,
  transaction,
  initDatabase,
  db
};
