export type PrimaryKeyOptionsSingleColumnVariant = { column: ColumnStructure }
export type PrimaryKeyOptionMultipleColumnVariant = { columns: ColumnStructure[] }
export type PrimaryKeyOptions = PrimaryKeyOptionsSingleColumnVariant | PrimaryKeyOptionMultipleColumnVariant

export type DatabaseStructure = {
    tables: TableStructure[];
}


export type ForeignKeyOptions = {
    column: ColumnStructure;
    references: ForeignKeyReferencesOptions;
}

export type ForeignKeyReferencesOptions = {
    table: TableStructure;
    column: ColumnStructure;
}


export type TableStructure = {
    name: string;
    columns: ColumnStructure[];
    primaryKey: PrimaryKeyOptions;
    foreignKeys: ForeignKeyOptions[];
}


export type ColumnTypes = 'TEXT' | 'NUMERIC' | 'INTEGER' | 'REAL' | 'BLOB';

export type ColumnStructure = {
    name: string;
    type: ColumnTypes;
    nullable: boolean;
    unique?: boolean;
}

type SetColumnStructureType<T extends ColumnTypes> = Omit<ColumnStructure, "type"> & { type: T };

export type TextColumnStructure = SetColumnStructureType<"TEXT">;
export type NumericColumnStructure = SetColumnStructureType<"NUMERIC">;
export type IntegerColumnStructure = SetColumnStructureType<"INTEGER">
export type RealColumnStructure = SetColumnStructureType<"REAL">;
export type BlobColumnStructure = SetColumnStructureType<"BLOB">;

export function AssertTextColumnStructure(columnStructure: ColumnStructure): asserts columnStructure is TextColumnStructure {
    if (columnStructure.type !== "TEXT") throw new Error("Column type is not TEXT");
}
export function AssertNumericColumnStructure(columnStructure: ColumnStructure): asserts columnStructure is NumericColumnStructure {
    if (columnStructure.type !== "NUMERIC") throw new Error("Column type is not NUMERIC");
}
export function AssertIntegerColumnStructure(columnStructure: ColumnStructure): asserts columnStructure is IntegerColumnStructure {
    if (columnStructure.type !== "INTEGER") throw new Error("Column type is not INTEGER");
}
export function AssertRealColumnStructure(columnStructure: ColumnStructure): asserts columnStructure is RealColumnStructure {
    if (columnStructure.type !== "REAL") throw new Error("Column type is not REAL");
}
export function AssertBlobColumnStructure(columnStructure: ColumnStructure): asserts columnStructure is BlobColumnStructure {
    if (columnStructure.type !== "BLOB") throw new Error("Column type is not BLOB");
}
