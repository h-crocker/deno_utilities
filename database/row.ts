import { BlobColumn, Column, IntegerColumn, NumericColumn, RealColumn, TextColumn } from "./column.ts";
import { BlobColumnStructure, ColumnStructure, IntegerColumnStructure, NumericColumnStructure, RealColumnStructure, TextColumnStructure } from "./database_structure.ts";


export class RowData {
    protected _data: Record<string, unknown>;

    constructor(data: Record<string, unknown>) {
        this._data = data;
    }

    public get columnNames(): string[] {
        return Object.keys(this._data);
    }

    public get values(): unknown[] {
        return Object.values(this._data);
    }

    public get(column: TextColumnStructure | TextColumn): string | null
    public get(column: NumericColumnStructure | NumericColumn): number | null
    public get(column: IntegerColumnStructure | IntegerColumn): number | null
    public get(column: RealColumnStructure | RealColumn): number | null
    public get(column: BlobColumnStructure | BlobColumn): string | null
    public get(column: ColumnStructure | Column | string): unknown {
        if (typeof column === "string") {
            return this.getFromColumnName(column);
        }
        return this.getFromColumnName(column.name);
    }

    public getFromColumnName(columnName: string): unknown {
        const value = this._data[columnName];
        if (!value) {
            return null;
        }
        return value;
    }
}

export class NewRow extends RowData {
    constructor() {
        super({});
    }

    public set(column: TextColumnStructure | TextColumn, value: string): void
    public set(column: NumericColumnStructure | NumericColumn, value: number): void
    public set(column: IntegerColumnStructure | IntegerColumn, value: number): void
    public set(column: RealColumnStructure | RealColumn, value: number): void
    public set(column: BlobColumnStructure | BlobColumn, value: string): void
    public set(column: ColumnStructure | Column, value: unknown): void {
        this._data[column.name] = value;
    }
}
