import { Column, FindColumnFunction } from "./column.ts";
import { FindTableFunction, Table } from "./table.ts";
import { ForeignKeyOptions, ForeignKeyReferencesOptions } from "./database_structure.ts";

export class ForeignKey implements ForeignKeyOptions {
    private _columnName: string;
    private _findColumnFunction: FindColumnFunction;
    private _references: ForeignKeyReferences;

    public constructor(
        foreignKeyOptions: ForeignKeyOptions,
        findColumnFunction: FindColumnFunction,
        findReferenceTableFunction: FindTableFunction,
    ) {
        this._columnName = foreignKeyOptions.column.name;
        this._findColumnFunction = findColumnFunction;
        this._references = new ForeignKeyReferences(foreignKeyOptions.references, findReferenceTableFunction);
    }

    public get column(): Column {
        const column = this._findColumnFunction(this._columnName);
        if (column == null) throw new Error("Could not find column referenced in foreign key");
        return column;
    };

    public get references(): ForeignKeyReferences {
        return this._references;
    }
}

export class ForeignKeyReferences implements ForeignKeyReferencesOptions {
    private _tableName: string;
    private _columnName: string;
    private _findTableFunction: FindTableFunction;

    constructor(
        foreignKeyReferencesOptions: ForeignKeyReferencesOptions,
        findTableFunction: FindTableFunction,
    ) {
        this._tableName = foreignKeyReferencesOptions.table.name;
        this._columnName = foreignKeyReferencesOptions.column.name;
        this._findTableFunction = findTableFunction;
    }

    public get table(): Table {
        const table = this._findTableFunction(this._tableName);
        if (table == null) throw new Error("Could not find table referenced in foreign key");
        return table;
    }

    public get column(): Column {
        const column = this.table.findColumn(this._columnName);
        if (column == null) throw new Error("Could not find column referenced in foreign key");
        return column;
    }
}
