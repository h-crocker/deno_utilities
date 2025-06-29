import { ColumnStructure, ForeignKeyOptions, PrimaryKeyOptions, TableStructure } from "../database_structure.ts";

export function generateCreateTableQuery(tableDefinition: TableStructure, ifNotExists: boolean = false): string {
    const tableSql = `CREATE TABLE ${ifNotExists ? "IF NOT EXISTS " : ""}${tableDefinition.name}`,
        columnsSql = generateColumnDefinitionsString(tableDefinition.columns),
        primaryKeySql = generatePrimaryKeyString(tableDefinition.primaryKey),
        foreignKeysSql = generateForeignKeysString(tableDefinition.foreignKeys);
    const foreignKeySeparatorSql = foreignKeysSql === "" ? "" : ", ";
    return `${tableSql} (${columnsSql}, ${primaryKeySql}${foreignKeySeparatorSql}${foreignKeysSql})`;
}

function generateColumnDefinitionsString(columnDefinitions: ColumnStructure[]): string {
    const numberOfColumns = columnDefinitions.length;

    if (numberOfColumns < 1) {
        return "";
    }

    const firstColumn = columnDefinitions[0];

    if (numberOfColumns === 1) {
        return generateColumnDefinitionString(firstColumn);
    }

    const [,...remainingColumns] = columnDefinitions;
    return remainingColumns.reduce(
        (columnSql, columnDefinition) => `${columnSql}, ${generateColumnDefinitionString(columnDefinition)}`,
        generateColumnDefinitionString(firstColumn)
    );
}

function generateColumnDefinitionString(columnDefinition: ColumnStructure): string {
    return `${columnDefinition.name} ${columnDefinition.type}${columnDefinition.nullable ? "" : " NOT NULL"}${columnDefinition.unique ? " UNIQUE" : ""}`
}

function generatePrimaryKeyString(primaryKeyDefinition: PrimaryKeyOptions): string {
    if ("column" in primaryKeyDefinition) {
        return `PRIMARY KEY (${primaryKeyDefinition.column.name})`;
    } else if ("columns" in primaryKeyDefinition) {
        const firstColumn = primaryKeyDefinition.columns[0];
        if (firstColumn == null) {
            return "";
        }
        const [,...remainingColumns] = primaryKeyDefinition.columns;
        return `PRIMARY KEY (${remainingColumns.reduce(
            (primaryKeyColumnsSql, columnDefinition) => `${primaryKeyColumnsSql}, ${columnDefinition.name}}`,
            `${firstColumn.name}`
        )})`;
    }
    return "";
}

function generateForeignKeysString(foreignKeyDefinitions: ForeignKeyOptions[]): string {
    if (foreignKeyDefinitions.length < 1) {
        return "";
    }
    const firstForeignKey = foreignKeyDefinitions[0];
    const [,...remainingForeignKeys] = foreignKeyDefinitions; 
    return remainingForeignKeys.reduce(
        (foreignKeySql, foreignKeyDefinition) => `${foreignKeySql}, ${generateForeignKeyString(foreignKeyDefinition)}`,
        generateForeignKeyString(firstForeignKey)
    );
}

function generateForeignKeyString(foreignKeyDefinition: ForeignKeyOptions): string {
    return `FOREIGN KEY (${foreignKeyDefinition.column.name}) REFERENCES ${foreignKeyDefinition.references.table.name}(${foreignKeyDefinition.references.column.name})`;
}


export function generateSelectAllQuery(tableName: string): string {
    return `SELECT * FROM ${tableName}`;
}


export function generateInsertQuery(tableName: string, columnNames: string[], rowCount: number): string {
    const valuePlaceholderString = `(${columnNames.map(() => "?").join(", ")})`;
    const columnNamesString = `(${columnNames.join(", ")})`;
    let insertQuery = `INSERT INTO ${tableName} ${columnNamesString} VALUES ${valuePlaceholderString}`;
    for (let i = 0; i < rowCount - 1; i++) {
        insertQuery = `${insertQuery}, ${valuePlaceholderString}`;
    }
    return `${insertQuery}; RETURNING ${columnNamesString}`;
}

export const TABLE_EXISTS_QUERY = "SELECT 1 FROM sqlite_master WHERE type='table' AND name=?";


