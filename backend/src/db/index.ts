import initSqlJs, { Database } from 'sql.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { DB_SCHEMA } from './schema';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../../chat.db');
const SQLITE_WASM_PATH = path.join(__dirname, '../../node_modules/sql.js/dist/sql-wasm.wasm');

let db: Database;
let SQL: any;

export function getDatabase(): Database {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
}

export async function initDatabase(): Promise<Database> {
  if (db) {
    return db;
  }

  if (!SQL) {
    SQL = await initSqlJs({
      locateFile: (file: string) => {
        if (file === 'sql-wasm.wasm') {
          return SQLITE_WASM_PATH;
        }
        return file;
      },
    });
  }

  let dbBuffer: Buffer | undefined;
  if (fs.existsSync(DB_PATH)) {
    dbBuffer = fs.readFileSync(DB_PATH);
  }

  db = new SQL.Database(dbBuffer);

  db.run(DB_SCHEMA);

  saveDatabase();

  console.log('✅ Database initialized successfully');
  console.log(`   Database path: ${DB_PATH}`);

  return db;
}

export function saveDatabase(): void {
  if (!db) {
    throw new Error('Database not initialized');
  }

  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(DB_PATH, buffer);
}

export function closeDatabase(): void {
  if (db) {
    saveDatabase();
    db.close();
    db = null as any;
    console.log('✅ Database connection closed');
  }
}

export function backupDatabase(backupPath: string): void {
  if (!db) {
    throw new Error('Database not initialized');
  }
  saveDatabase();
  fs.copyFileSync(DB_PATH, backupPath);
  console.log(`✅ Database backed up to: ${backupPath}`);
}

export function getDatabaseStats(): {
  tables: number;
  size: number;
} {
  if (!db) {
    throw new Error('Database not initialized');
  }

  const tablesResult = db.exec("SELECT COUNT(*) as count FROM sqlite_master WHERE type='table'");
  const tables = tablesResult[0]?.values[0]?.[0] as number || 0;

  const stats = fs.statSync(DB_PATH);

  return {
    tables,
    size: stats.size,
  };
}

export * from './types';
export * from './schema';
export * from './queries';
export * from './repositories';
export * from './services';

export default {
  getDatabase,
  initDatabase,
  closeDatabase,
  backupDatabase,
  getDatabaseStats,
};
