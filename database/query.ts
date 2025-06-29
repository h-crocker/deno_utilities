import { ColumnStructure, TableStructure } from "./database_structure.ts";
import { RowData } from "./row.ts";

export type RunQueryFunction = (query: string, parameters?: string[]) => Generator<Record<string, unknown>>;

export interface Queryable {
    selectColumn: (column: QueryColumn) => Queryable;
    join: (joinCondition: JoinCondition) => Queryable;
    // leftJoin: (table: TableStructure, column: ColumnStructure) => Queryable;
    // rightJoin: (table: TableStructure, column: ColumnStructure) => Queryable;
    rows: () => Generator<RowData>;
}


export interface BasicTableQueryColumn {
    column: ColumnStructure;
    source: QueryReference;
    alias?: string;
}

export interface BasicTextQueryColumn {
    value: string;
    alias?: string;
}

export interface BasicNumericQueryColumn {
    value: number;
    alias?: string;
}

export type BasicQueryColumn = BasicTableQueryColumn | BasicTextQueryColumn | BasicNumericQueryColumn;

export type AggregateQueryColumn = BasicQueryColumn & {
    operation: "AVG" | "COUNT" | "MAX" | "MIN" | "SUM" | "GROUP_CONCAT";
    alias?: string;
};

export type QueryColumn = BasicQueryColumn | AggregateQueryColumn;

export function isAggregateQueryColumn(queryColumn: QueryColumn): queryColumn is AggregateQueryColumn {
    return (queryColumn as AggregateQueryColumn).operation != null;
}

export function isBasicTextQueryColumn(queryColumn: QueryColumn): queryColumn is BasicTextQueryColumn {
    return typeof (queryColumn as BasicTextQueryColumn).value === "string";
}

export function isBasicNumericQueryColumn(queryColumn: QueryColumn): queryColumn is BasicNumericQueryColumn {
    return typeof (queryColumn as BasicNumericQueryColumn).value === "number";
}

export function isBasicTableQueryColumn(queryColumn: QueryColumn): queryColumn is BasicTableQueryColumn {
    return (queryColumn as BasicTableQueryColumn).column != null;
}


export interface SelectQueryReference {
    select: string;
    alias: string;
}

export interface TableQueryReference {
    table: TableStructure;
    alias?: string;
}

export type QueryReference = SelectQueryReference | TableQueryReference;

export function isSelectQueryReference(queryReference: QueryReference): queryReference is SelectQueryReference {
    return typeof (queryReference as SelectQueryReference).select === "string";
}

export function isTableQueryReference(queryReference: QueryReference): queryReference is TableQueryReference {
    return (queryReference as TableQueryReference).table != null;
}


export type WhereConditionType = "=" | ">" | "<" | ">=" | "<=" | "!=" | "BETWEEN" | "LIKE" | "IN";

export type WhereCondition = {
    table: TableStructure;
    column: ColumnStructure;
    type: WhereConditionType;
    comparison: unknown | {
        table: TableStructure;
        column: ColumnStructure;
    };
}


export type JoinCondition = {
    from: QueryColumn & { source: QueryReference };
    to: QueryColumn & { source: QueryReference };
    condition: WhereConditionType;
}


export class Query implements Queryable {
    private _queryReference: QueryReference;
    private _runQuery: RunQueryFunction;
    private _columns: QueryColumn[] = [];
    private _joins: JoinCondition[] = [];

    constructor(queryReference: QueryReference, runQueryFunction: RunQueryFunction) {
        this._queryReference = queryReference;
        this._runQuery = runQueryFunction;
    }

    public *rows(): Generator<RowData> {
        if (this._columns.length === 0) {
            return;
        }
        console.log(this.getQueryText());
        for (const rowData of this._runQuery(this.getQueryText())) {
            yield new RowData(rowData);
        }
    }

    public selectColumn(column: QueryColumn): this {
        this._columns.push(column);
        return this;
    }

    public join(joinCondition: JoinCondition): this {
       this._joins.push(joinCondition);
        return this;
    }

    private getQueryText(): string {
        return `SELECT ${this._columns.map(column => this.getQueryColumn(column)).join(", ")} FROM ${this.getQueryReferenceText(this._queryReference)}${this.getJoinText()}`;
    }

    private getQueryColumn(queryColumn: QueryColumn): string {
        if (isAggregateQueryColumn(queryColumn)) {
            if (isBasicTableQueryColumn(queryColumn)) {
                const source = isTableQueryReference(queryColumn.source) ? queryColumn.source.alias ?? queryColumn.source.table.name : queryColumn.source.alias;
                return `${queryColumn.operation}(${source}.${queryColumn.column.name})${queryColumn.alias ? ` as ${queryColumn.alias}` : ''}`;
            }
            return `${queryColumn.operation}(${queryColumn.value})${queryColumn.alias ? ` as ${queryColumn.alias}` : ''}`;
         }
        if (isBasicTableQueryColumn(queryColumn)) {

            const source = isTableQueryReference(queryColumn.source) ? queryColumn.source.alias ?? queryColumn.source.table.name : queryColumn.source.alias;
            return `${source}.${queryColumn.column.name}${queryColumn.alias ? ` as ${queryColumn.alias}` : ''}`
        }
        return `${queryColumn.value}${queryColumn.alias ? ` as ${queryColumn.alias}` : ''}`
    }

    private getQueryColumnTarget(queryColumn: QueryColumn): string {
        if (isBasicTableQueryColumn(queryColumn)) {
            const source = this.getQueryReferenceSourceOrAlias(queryColumn.source);
            if (queryColumn.alias) {
                return `${source}.${queryColumn.alias}`;
            }
            return `${source}.${queryColumn.column.name}`;
        }
        return String(queryColumn.value);
    }

    private getQueryReferenceText(queryReference: QueryReference): string {
        if (isSelectQueryReference(queryReference)) {
            return `(${queryReference.select}) as ${queryReference.alias}`;
        }
        if (queryReference.alias != null) {
            return `${queryReference.table.name} as ${queryReference.alias}`;
        }
        return queryReference.table.name;
    }

    private getQueryReferenceSourceOrAlias(queryReference: QueryReference): string {
        if (queryReference.alias) {
            return queryReference.alias;
        }
        if (!isTableQueryReference(queryReference)) {
            throw new Error("Fatal Error - Must reference an alias or a table");
        }
        return queryReference.table.name;
    }

    private getJoinText(): string {
        return this._joins.map(condition => {
            return ` JOIN ${this.getQueryReferenceText(condition.to.source)} ON ${this.getQueryColumnTarget(condition.to)} ${condition.condition} ${this.getQueryColumnTarget(condition.from)}`
        }).join("");
    }
}
