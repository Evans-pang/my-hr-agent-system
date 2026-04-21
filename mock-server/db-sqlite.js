const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

// 数据库文件路径 - 使用环境变量或默认路径
const DB_PATH = process.env.SQLITE_DB_PATH || path.join(__dirname, 'data', 'hr_system.db');

// 确保数据目录存在
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// 创建数据库连接
const db = new Database(DB_PATH);

// 启用外键约束
 db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// 测试连接
function testConnection() {
  try {
    db.prepare('SELECT 1').get();
    console.log('SQLite 数据库连接成功:', DB_PATH);
    return true;
  } catch (error) {
    console.error('SQLite 数据库连接失败:', error.message);
    return false;
  }
}

// 执行查询（返回多条）
function query(sql, params = []) {
  try {
    const stmt = db.prepare(sql);
    return stmt.all(...params);
  } catch (error) {
    console.error('查询失败:', error.message, 'SQL:', sql);
    throw error;
  }
}

// 执行查询（返回单条）
function queryOne(sql, params = []) {
  try {
    const stmt = db.prepare(sql);
    return stmt.get(...params);
  } catch (error) {
    console.error('查询失败:', error.message, 'SQL:', sql);
    throw error;
  }
}

// 执行插入并返回插入的ID
function insert(sql, params = []) {
  try {
    const stmt = db.prepare(sql);
    const result = stmt.run(...params);
    return { insertId: result.lastInsertRowid };
  } catch (error) {
    console.error('插入失败:', error.message, 'SQL:', sql);
    throw error;
  }
}

// 执行更新
function update(sql, params = []) {
  try {
    const stmt = db.prepare(sql);
    const result = stmt.run(...params);
    return result.changes;
  } catch (error) {
    console.error('更新失败:', error.message, 'SQL:', sql);
    throw error;
  }
}

// 执行删除
function remove(sql, params = []) {
  try {
    const stmt = db.prepare(sql);
    const result = stmt.run(...params);
    return result.changes;
  } catch (error) {
    console.error('删除失败:', error.message, 'SQL:', sql);
    throw error;
  }
}

// 执行SQL文件
function executeSqlFile(filePath) {
  try {
    const sql = fs.readFileSync(filePath, 'utf8');
    const statements = sql.split(';').filter(s => s.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          db.prepare(statement).run();
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

// 事务执行
function transaction(fn) {
  return db.transaction(fn);
}

module.exports = {
  db,
  testConnection,
  query,
  queryOne,
  insert,
  update,
  remove,
  executeSqlFile,
  transaction
};
