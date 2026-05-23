import { Database } from 'sql.js';
import { getDatabase, saveDatabase } from '../index';

export abstract class BaseRepository<T> {
  private _db?: Database;
  protected tableName: string;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  protected get db(): Database {
    if (!this._db) {
      this._db = getDatabase();
    }
    return this._db;
  }

  protected toDate(value: string | Date | null): Date | undefined {
    if (!value) return undefined;
    return typeof value === 'string' ? new Date(value) : value;
  }

  protected fromDate(date: Date | undefined): string | null {
    return date ? date.toISOString() : null;
  }

  protected run(sql: string, params: any[] = []): void {
    this.db.run(sql, params);
    saveDatabase();
  }

  protected get(sql: string, params: any[] = []): any | undefined {
    const stmt = this.db.prepare(sql);
    stmt.bind(params);
    if (stmt.step()) {
      const result = stmt.getAsObject();
      stmt.free();
      return result;
    }
    stmt.free();
    return undefined;
  }

  protected all(sql: string, params: any[] = []): any[] {
    const results: any[] = [];
    const stmt = this.db.prepare(sql);
    stmt.bind(params);
    while (stmt.step()) {
      results.push(stmt.getAsObject());
    }
    stmt.free();
    return results;
  }

  findById(id: string): T | undefined {
    const row = this.get(
      `SELECT * FROM ${this.tableName} WHERE id = ? AND is_deleted = 0`,
      [id]
    );
    return row ? this.mapRow(row) : undefined;
  }

  findAll(): T[] {
    const rows = this.all(
      `SELECT * FROM ${this.tableName} WHERE is_deleted = 0 ORDER BY created_at DESC`
    );
    return rows.map((row) => this.mapRow(row));
  }

  delete(id: string): boolean {
    const stmt = this.db.prepare(
      `UPDATE ${this.tableName} SET is_deleted = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?`
    );
    stmt.bind([id]);
    const result = stmt.step();
    stmt.free();
    saveDatabase();
    return result;
  }

  hardDelete(id: string): boolean {
    const stmt = this.db.prepare(`DELETE FROM ${this.tableName} WHERE id = ?`);
    stmt.bind([id]);
    const result = stmt.step();
    stmt.free();
    saveDatabase();
    return result;
  }

  count(): number {
    const row = this.get(
      `SELECT COUNT(*) as count FROM ${this.tableName} WHERE is_deleted = 0`
    );
    return row?.count || 0;
  }

  exists(id: string): boolean {
    const row = this.get(
      `SELECT 1 FROM ${this.tableName} WHERE id = ? AND is_deleted = 0 LIMIT 1`,
      [id]
    );
    return !!row;
  }

  protected abstract mapRow(row: any): T;
}
