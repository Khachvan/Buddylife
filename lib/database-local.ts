// Development-only Postgres backed by PGlite, a WebAssembly Postgres that runs
// inside the Node process. Enable it with DATABASE_URL=pglite:<directory|memory>.
// The engine is loaded through a computed dynamic import so bundlers and the
// Vercel file tracer leave it out of deployed functions; production always
// uses Neon through lib/database.ts.

import { mkdirSync } from "node:fs";

type Row = Record<string, unknown>;
type Engine = {
  query: (text: string, params?: unknown[]) => Promise<{ rows: Row[] }>;
  transaction: <T>(callback: (tx: { query: Engine["query"] }) => Promise<T>) => Promise<T>;
};
export type LazyQuery = { text: string; params: unknown[]; then: Promise<Row[]>["then"] };
type LocalSql = ((strings: TemplateStringsArray, ...values: unknown[]) => LazyQuery) & {
  query: (text: string, params?: unknown[]) => LazyQuery;
  transaction: (input: LazyQuery[] | ((sql: LocalSql) => LazyQuery[])) => Promise<Row[][]>;
};

const ENGINE_PACKAGE = "@electric-sql/pglite";
const loadModule = new Function("specifier", "return import(specifier)") as (
  specifier: string,
) => Promise<{ PGlite: new (dataDir?: string) => Engine }>;
const engines = ((globalThis as Record<string, unknown>).__buddylifeLocalEngines ||= new Map<string, Promise<Engine>>()) as Map<string, Promise<Engine>>;

function normalizeRows(rows: Row[]) {
  return rows.map((row) =>
    Object.fromEntries(Object.entries(row).map(([key, value]) => [key, typeof value === "bigint" ? Number(value) : value])),
  );
}

function build(strings: TemplateStringsArray, values: unknown[]) {
  let text = strings[0];
  const params: unknown[] = [];
  values.forEach((value, index) => {
    params.push(value);
    text += `$${params.length}${strings[index + 1]}`;
  });
  return { text, params };
}

export function createLocalSql(location: string): LocalSql {
  const dataDir = !location || location === "memory" ? "memory" : location;
  const getEngine = () => {
    let engine = engines.get(dataDir);
    if (!engine) {
      if (dataDir !== "memory") mkdirSync(dataDir, { recursive: true });
      engine = loadModule(ENGINE_PACKAGE).then((module) => new module.PGlite(dataDir === "memory" ? undefined : dataDir));
      engine.catch(() => engines.delete(dataDir));
      engines.set(dataDir, engine);
    }
    return engine;
  };
  const run = (text: string, params: unknown[]) =>
    getEngine()
      .then((engine) => engine.query(text, params))
      .then((result) => normalizeRows(result.rows));
  const lazy = (text: string, params: unknown[]): LazyQuery => {
    const promise = { text, params } as LazyQuery;
    promise.then = ((onFulfilled, onRejected) => run(text, params).then(onFulfilled, onRejected)) as Promise<Row[]>["then"];
    return promise;
  };
  const sql = ((strings: TemplateStringsArray, ...values: unknown[]) => {
    const { text, params } = build(strings, values);
    return lazy(text, params);
  }) as LocalSql;
  sql.query = (text, params = []) => lazy(text, params);
  sql.transaction = async (input) => {
    const queries = typeof input === "function" ? input(sql) : input;
    const engine = await getEngine();
    return engine.transaction(async (tx) => {
      const results: Row[][] = [];
      for (const query of queries) results.push(normalizeRows((await tx.query(query.text, query.params)).rows));
      return results;
    });
  };
  return sql;
}
