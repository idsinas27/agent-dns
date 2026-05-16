import { neonConfig, Pool, type QueryResult, type QueryResultRow } from "@neondatabase/serverless";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const ws = require("ws");

neonConfig.webSocketConstructor = ws;

const connectionString = process.env.POSTGRES_URL;

if (!connectionString) {
  throw new Error("POSTGRES_URL is not defined.");
}

const pool = new Pool({ connectionString });

export function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  values?: unknown[],
): Promise<QueryResult<T>> {
  return pool.query<T>(text, values);
}
