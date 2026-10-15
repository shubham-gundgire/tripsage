import { vi } from 'vitest'

/**
 * An in-memory stand-in for the Supabase client, covering the part of the PostgREST query API
 * TripSage uses: select (with column lists, counts and embedded relations such as
 * `hotels:hotel_id (*)`), eq/gt/gte/lte/ilike/contains, order, range, limit, single,
 * maybeSingle, insert, update and delete. Queries resolve like the real client:
 * `{ data, error, count }`.
 *
 * `db.tables` holds the rows; `db.failNext(table, error)` makes the next query on a table fail;
 * `db.queries` records every query that ran.
 */
export function createFakeSupabase(initial = {}) {
  let nextId = 1
  const failures = new Map()
  const db = {
    tables: {},
    queries: [],
    seed(tables) {
      for (const [name, rows] of Object.entries(tables)) {
        db.tables[name] = rows.map((row) => ({ ...row }))
      }
    },
    reset(tables = {}) {
      db.tables = {}
      db.queries = []
      failures.clear()
      nextId = 1
      db.seed(tables)
    },
    failNext(table, error = { message: `${table} is unavailable` }) {
      failures.set(table, error)
    },
    from(table) {
      return new Query(table)
    },
    rpc: vi.fn(async () => ({ data: null, error: null })),
    auth: { getSession: vi.fn(async () => ({ data: { session: null }, error: null })) },
  }

  const rowsOf = (table) => (db.tables[table] ??= [])

  class Query {
    constructor(table) {
      this.table = table
      this.op = 'select'
      this.columns = '*'
      this.filters = []
      this.returning = false
    }

    select(columns = '*', options = {}) {
      if (this.op === 'select') {
        this.columns = columns
        this.count = options.count
        this.head = options.head
      } else {
        this.returning = true
        this.columns = columns
      }
      return this
    }

    insert(rows) {
      this.op = 'insert'
      this.payload = Array.isArray(rows) ? rows : [rows]
      return this
    }

    update(values) {
      this.op = 'update'
      this.payload = values
      return this
    }

    delete() {
      this.op = 'delete'
      return this
    }

    eq(column, value) {
      this.filters.push([column, (v) => v === value || (v != null && value != null && String(v) === String(value))])
      return this
    }

    gt(column, value) {
      this.filters.push([column, (v) => v > value])
      return this
    }

    gte(column, value) {
      this.filters.push([column, (v) => v >= value])
      return this
    }

    lte(column, value) {
      this.filters.push([column, (v) => v <= value])
      return this
    }

    ilike(column, pattern) {
      const regex = new RegExp(`^${pattern.split('%').map(escapeRegExp).join('.*')}$`, 'i')
      this.filters.push([column, (v) => regex.test(String(v ?? ''))])
      return this
    }

    contains(column, values) {
      this.filters.push([column, (v) => Array.isArray(v) && values.every((x) => v.includes(x))])
      return this
    }

    order(column, { ascending = true } = {}) {
      this.ordering = { column, ascending }
      return this
    }

    range(from, to) {
      this.window = [from, to]
      return this
    }

    limit(n) {
      this.max = n
      return this
    }

    single() {
      this.expect = 'single'
      return this
    }

    maybeSingle() {
      this.expect = 'maybeSingle'
      return this
    }

    then(resolve, reject) {
      return Promise.resolve()
        .then(() => this.run())
        .then(resolve, reject)
    }

    run() {
      db.queries.push(this)
      if (failures.has(this.table)) {
        const error = failures.get(this.table)
        failures.delete(this.table)
        return { data: null, error, count: null }
      }
      const rows = rowsOf(this.table)
      const matches = (row) => this.filters.every(([column, test]) => test(row[column]))

      if (this.op === 'insert') {
        const inserted = this.payload.map((row) => ({ id: row.id ?? `${this.table}-${nextId++}`, ...row }))
        rows.push(...inserted)
        return this.finish(this.returning ? inserted.map((r) => ({ ...r })) : null)
      }
      if (this.op === 'update') {
        const updated = rows.filter(matches)
        for (const row of updated) Object.assign(row, this.payload)
        return this.finish(this.returning ? updated.map((r) => ({ ...r })) : null)
      }
      if (this.op === 'delete') {
        db.tables[this.table] = rows.filter((row) => !matches(row))
        return this.finish(null)
      }

      let found = rows.filter(matches)
      const count = found.length
      if (this.ordering) {
        const { column, ascending } = this.ordering
        found = [...found].sort((a, b) => (a[column] > b[column] ? 1 : a[column] < b[column] ? -1 : 0) * (ascending ? 1 : -1))
      }
      if (this.window) found = found.slice(this.window[0], this.window[1] + 1)
      if (this.max != null) found = found.slice(0, this.max)
      if (this.head) return { data: null, error: null, count }
      return this.finish(found.map((row) => this.shape(row)), this.count ? count : undefined)
    }

    finish(data, count) {
      if (this.expect && data) {
        if (data.length === 1) return { data: data[0], error: null, count }
        if (data.length === 0 && this.expect === 'maybeSingle') return { data: null, error: null, count }
        return {
          data: null,
          error: { code: 'PGRST116', message: 'JSON object requested, multiple (or no) rows returned' },
          count,
        }
      }
      return { data, error: null, count }
    }

    /** Applies the select list: `*`, `a, b`, and embedded `alias:foreign_key (*)`. */
    shape(row) {
      const embedded = [...this.columns.matchAll(/(\w+):(\w+)\s*\(\s*\*\s*\)/g)]
      const plain = this.columns
        .replace(/\w+:\w+\s*\(\s*\*\s*\)/g, '')
        .split(',')
        .map((c) => c.trim())
        .filter(Boolean)
      const out = plain.includes('*') ? { ...row } : Object.fromEntries(plain.map((c) => [c, row[c]]))
      for (const [, alias, key] of embedded) {
        out[alias] = rowsOf(alias).find((r) => r.id === row[key]) ?? null
      }
      return out
    }
  }

  db.reset(initial)
  return db
}

const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
