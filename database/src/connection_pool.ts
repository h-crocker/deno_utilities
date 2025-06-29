import { DB } from "./sqlite.ts";

export class ConnectionPool {
    private pool = new Map<string, DB>();

    public getConnection(path: string): DB {
        let connection = this.pool.get(path);
        if (connection == null) {
            connection = new DB(path);
            this.pool.set(path, connection);
        }
        return connection;
    }
}
