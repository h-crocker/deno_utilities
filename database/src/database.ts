import type { DB } from "./sqlite.ts";
import type { DatabaseStructure, TableStructure } from "./database_structure.ts";
import type { ConnectionPool } from "./connection_pool.ts";
import type { RowData } from "./row.ts";

import { generateCreateTableQuery, generateInsertQuery, generateSelectAllQuery, TABLE_EXISTS_QUERY } from "./sql_query_strings/table_queries.ts";
import { Table } from "./table.ts";

export class Database implements DatabaseStructure {
    private readonly path: string;
    private readonly connectionPool: ConnectionPool;
    public readonly tables: Table[];

    public constructor(
        connectionPool: ConnectionPool,
        path: string,
        databaseStructure?: DatabaseStructure,
        createTablesIfNotExist = true
    ) {
        this.connectionPool = connectionPool;
        this.path = path;
        if (databaseStructure) {
            this.tables = createTablesIfNotExist
                ? this.createTables(databaseStructure.tables)
                : this.mapExistingTables(databaseStructure.tables);
        } else {
            this.tables = [];
        }
    }

    public getTable(table: TableStructure | string): Table | null {
        if (typeof table === "string") {
            return this.getTableFromName(table);
        }
        return this.getTableFromName(table.name);
    }

    public createTables(tableStructures: TableStructure[]): Table[] {
        return tableStructures.map(tableStructure => this.createTable(tableStructure));
    }

    public createTable(tableStructure: TableStructure): Table {
        const db = this.getConnection();
        try {
            db.execute(generateCreateTableQuery(tableStructure, true));
        } catch (error) {
            console.log(generateCreateTableQuery(tableStructure, true));
            console.log(error);
            throw new Error(`Fatal Error - Could not create table "${tableStructure.name}"`);
        }
        return this.mapExistingTable(tableStructure);
    }

    private getTableFromName(tableName: string): Table | null {
        return this.tables.find(table => table.name === tableName) ?? null;
    }

    private *selectAll(tableName: string): Generator<Record<string, unknown>> {
        const query = generateSelectAllQuery(tableName);
        for (const row of this.query(query)) {
            yield row;
        }
    }

    private *insert(tableName: string, rows: RowData[]): Generator<Record<string, unknown>> {
        const query = generateInsertQuery(tableName, rows[0].columnNames, rows.length);
        const parameters = rows.flatMap(row => row.values.map(value => String(value)));
        for (const row of this.query(query, parameters)) {
            yield row;
        }
    }

    private *query(queryText: string, parameters?: string[]): Generator<Record<string, unknown>> {
        const db = this.getConnection();
        const query = db.prepareQuery<unknown[], Record<string, unknown>>(queryText);
        for (const row of query.iterEntries(parameters)) {
            yield row;
        }
        query.finalize();
    }

    private mapExistingTables(tableStructures: TableStructure[]): Table[] {
        return tableStructures.map(tableStructure => this.mapExistingTable(tableStructure));
    }

    private mapExistingTable(tableStructure: TableStructure): Table {
        if (!this.doesTableExist(tableStructure.name)) {
            // TODO: Create Fatal Error type, and rule for only allowing to throw fatal errors
            // TODO: Create file containing all error messages
            throw new Error(`Fatal Error - Could not find table "${tableStructure.name}"`);
        }
        return new Table(
            tableStructure,
            tableName => this.getTable(tableName),
            tableName => this.selectAll(tableName),
            (tableName, rows) => this.insert(tableName, rows),
            (query, parameters) => this.query(query, parameters),
        );
    }

    private doesTableExist(tableName: string): boolean {
        const db = this.getConnection();
        try {
            const result = db.query(TABLE_EXISTS_QUERY, [tableName]);
            return result[0][0] === 1;
        } catch {
            return false;
        }
    }

    private getConnection(): DB {
        return this.connectionPool.getConnection(this.path);
    }
}
