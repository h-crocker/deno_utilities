import { Column, FindColumnFunction } from "./column.ts";
import { PrimaryKeyOptionMultipleColumnVariant, PrimaryKeyOptions } from "./database_structure.ts";

export class PrimaryKey implements PrimaryKeyOptionMultipleColumnVariant {
    private _columnNames: string[];
    private _findColumnFunction: FindColumnFunction;

    public constructor(
        primaryKeyOptions: PrimaryKeyOptions,
        findColumnFunction: FindColumnFunction,
    ) {
        const columns = "column" in primaryKeyOptions ? [primaryKeyOptions.column] : primaryKeyOptions.columns;
        this._columnNames = columns.map(column => column.name);
        this._findColumnFunction = findColumnFunction;
    }

    public get columns(): Column[] {
        return this._columnNames.reduce((columns, columnName) => {
            const column = this._findColumnFunction(columnName);
            if (column != null) {
                columns.push(column)
            }
            return columns;
        }, new Array<Column>());
    }
}
