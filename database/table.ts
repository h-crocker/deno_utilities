import { BlobColumn, Column, IntegerColumn, NumericColumn, RealColumn, TextColumn } from "./column.ts";
import { ForeignKey } from "./foreign_key.ts";
import { PrimaryKey } from "./primary_key.ts";
import { ColumnStructure, TableStructure } from "./database_structure.ts";
import { RowData } from "./row.ts";
import { JoinCondition, Query, Queryable, QueryColumn, RunQueryFunction } from "./query.ts";

export type FindTableFunction = (tableName: string) => Table | null;
export type SelectAllFunction = (tableName: string) => Generator<Record<string, unknown>>;
export type InsertFunction = (tableName: string, rows: RowData[]) => Generator<Record<string, unknown>>;

export class Table implements TableStructure, Queryable {
    private _name: string;
    private _columns: Column[];
    private _primaryKey: PrimaryKey;
    private _foreignKeys: ForeignKey[];
    private _selectAll: SelectAllFunction;
    private _insert: InsertFunction;
    private _runQuery: RunQueryFunction;

    public constructor(
        tableStructure: TableStructure,
        findTableFunction: FindTableFunction,
        selectAllFunction: SelectAllFunction,
        insertFunction: InsertFunction,
        runQueryFunction: RunQueryFunction,
    ) {
        this._name = tableStructure.name;

        this._columns = tableStructure.columns.map(columnStructure => this.mapColumnStructure(columnStructure));

        this._primaryKey = new PrimaryKey(
            tableStructure.primaryKey,
            (columnName: string) => this.findColumn(columnName)
        );

        this._foreignKeys = tableStructure.foreignKeys.map(
            foreignKeyOptions => new ForeignKey(
                foreignKeyOptions,
                (columnName: string) => this.findColumn(columnName),
                (tableName: string) => findTableFunction(tableName)
            )
        );

        this._selectAll = selectAllFunction;
        this._insert = insertFunction;
        this._runQuery = runQueryFunction;
    }

    public get name(): string { return this._name }
    public get columns(): Column[] { return this._columns }
    public get primaryKey(): PrimaryKey { return this._primaryKey }
    public get foreignKeys(): ForeignKey[] { return this._foreignKeys }

    public findColumn<T extends Column>(columnName: string): T | null {
        const column = this.columns.find(column => column.name === columnName);
        if (!column) {
            return null;
        }
        return column as T;
    }

    public *rows(): Generator<RowData> {
        for (const rowData of this._selectAll(this._name)) {
            yield new RowData(rowData);
        }
    }

    public *insert(newRows: RowData[]): Generator<RowData> {
        for (const newRowData of this._insert(this._name, newRows)) {
            yield new RowData(newRowData);
        }
    }

    public insertSingle(row: RowData): RowData {
        const result = this.insert([row]).next();
        if (result.value instanceof RowData) {
            return result.value;
        }
        throw new Error("Fatal Error - Could not find inserted row");
    }

    public join(joinCondition: JoinCondition): Query {
        return this.toQuery().join(joinCondition);
    }

    public selectColumn(queryColumn: QueryColumn) {
        return this.toQuery().selectColumn(queryColumn);
    };

    private toQuery(): Query {
        return new Query({ table: this }, this._runQuery);
    }

    private mapColumnStructure(columnStructure: ColumnStructure): Column {
        switch (columnStructure.type) {
            case "TEXT":
                return new TextColumn(columnStructure);
            case "NUMERIC":
                return new NumericColumn(columnStructure);
            case "INTEGER":
                return new IntegerColumn(columnStructure);
            case "REAL":
                return new RealColumn(columnStructure);
            case "BLOB":
                return new BlobColumn(columnStructure);
        }
        return new Column(columnStructure);
    }
}
