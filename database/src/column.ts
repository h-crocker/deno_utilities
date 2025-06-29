import { AssertBlobColumnStructure, AssertIntegerColumnStructure, AssertNumericColumnStructure, AssertRealColumnStructure, AssertTextColumnStructure, BlobColumnStructure, ColumnStructure, ColumnTypes, IntegerColumnStructure, NumericColumnStructure, RealColumnStructure, TextColumnStructure } from "./database_structure.ts";

export type FindColumnFunction = (columnName: string) => Column | null;

export class Column implements ColumnStructure {
    private _name: string;
    private _nullable: boolean;
    private _type: ColumnTypes;

    public constructor(columnStructure: ColumnStructure) {
        this._name = columnStructure.name;
        this._type = columnStructure.type;
        this._nullable = columnStructure.nullable;
    }

    public get name() { return this._name }
    public get type() { return this._type }
    public get nullable() { return this._nullable }
}

export class TextColumn extends Column implements TextColumnStructure {
    public constructor(columnStructure: ColumnStructure) {
        AssertTextColumnStructure(columnStructure);
        super(columnStructure);
    }

    public override get type(): "TEXT" { return "TEXT" }
}

export class NumericColumn extends Column implements NumericColumnStructure {
    public constructor(columnStructure: ColumnStructure) {
        AssertNumericColumnStructure(columnStructure);
        super(columnStructure);
    }

    public override get type(): "NUMERIC" { return "NUMERIC" }
}

export class IntegerColumn extends Column implements IntegerColumnStructure {
    public constructor(columnStructure: ColumnStructure) {
        AssertIntegerColumnStructure(columnStructure);
        super(columnStructure);
    }

    public override get type(): "INTEGER" { return "INTEGER" }
}

export class RealColumn extends Column implements RealColumnStructure {
    public constructor(columnStructure: ColumnStructure) {
        AssertRealColumnStructure(columnStructure);
        super(columnStructure);
    }

    public override get type(): "REAL" { return "REAL" }
}

export class BlobColumn extends Column implements BlobColumnStructure {
    public constructor(columnStructure: ColumnStructure) {
        AssertBlobColumnStructure(columnStructure);
        super(columnStructure);
    }

    public override get type(): "BLOB" { return "BLOB" }
}

