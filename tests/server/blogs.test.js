import { describe, test, expect, vi, beforeEach } from 'vitest'
import { db } from '../setup/server.js'
import { request, read, tokenFor, params } from '../support/requests.js'
import { knownBug } from '../support/known-bug.js'
import * as list from '@/app/api/blogs/route'
import * as one from '@/app/api/blogs/[id]/route'
import { GET as myBlogs } from '@/app/api/blogs/my-blogs/route'
import bundled from '@/app/data/blogs.json'

const asha = { id: 'user-1', name: 'Asha', email: 'asha@example.com' }
const ravi = { id: 'user-2', name: 'Ravi', email: 'ravi@example.com' }
const blog = (id, overrides = {}) => ({
  id,
  title: `Post ${id}`,
  author_id: asha.id,
  published: true,
  date: `2025-01-0${id.slice(-1)}T00:00:00Z`,
  created_at: `2025-01-0${id.slice(-1)}T00:00:00Z`,
  category: 'Asia',
  tags: ['food'],
  ...overrides,
})

beforeEach(() => {
  db.seed({
    users: [asha, ravi],
    blogs: [
      blog('b1'),
      blog('b2', { category: 'Europe', tags: ['hiking'] }),
      blog('b3', { author_id: ravi.id }),
      blog('b4', { published: false }),
    ],
  })
})

describe('GET /api/blogs', () => {
  test('lists published posts, newest first, with paging', async () => {
    const { status, body } = await read(await list.GET(request('/api/blogs?page=1&limit=2')))
    expect(status).toBe(200)
    expect(body.blogs.map((b) => b.id)).toEqual(['b3', 'b2'])
    expect(body.pagination).toEqual({ page: 1, limit: 2, total: 3, totalPages: 2 })

    const page2 = await read(await list.GET(request('/api/blogs?page=2&limit=2')))
    expect(page2.body.blogs.map((b) => b.id)).toEqual(['b1'])
  })

  test('filters by category, tag and author; defaults to 9 per page', async () => {
    expect((await read(await list.GET(request('/api/blogs?category=Europe')))).body.blogs.map((b) => b.id)).toEqual(['b2'])
    expect((await read(await list.GET(request('/api/blogs?tag=food')))).body.blogs.map((b) => b.id)).toEqual(['b3', 'b1'])
    const byRavi = await read(await list.GET(request('/api/blogs?author=user-2')))
    expect(byRavi.body.blogs.map((b) => b.id)).toEqual(['b3'])
    expect(byRavi.body.pagination.limit).toBe(9)
  })

  test('a database error answers 500', async () => {
    db.failNext('blogs', { message: 'db down' })
    expect(await read(await list.GET(request('/api/blogs')))).toEqual({ status: 500, body: { error: 'db down' } })
  })

  test('an unexpected failure answers 500', async () => {
    vi.spyOn(db, 'from').mockImplementationOnce(() => { throw new Error('boom') })
    expect((await read(await list.GET(request('/api/blogs')))).status).toBe(500)
  })
})

describe('POST /api/blogs', () => {
  const create = (body, user = asha) => list.POST(request('/api/blogs', { method: 'POST', token: user && tokenFor(user), body }))

  test('saves a draft for the signed-in author with a slug', async () => {
    const { status, body } = await read(await create({ title: 'Hello, Kyoto!', content: 'x', excerpt: 'e', category: 'Asia' }))
    expect(status).toBe(200)
    expect(body.message).toBe('Blog created successfully')
    expect(body.blog).toMatchObject({ title: 'Hello, Kyoto!', author_id: 'user-1', author_name: 'Asha', published: false, read_time: '5 min read', tags: [] })
    expect(body.blog.slug).toMatch(/^hello-kyoto-[0-9a-f]{8}$/)
  })

  test('keeps the given author name, tags and published flag', async () => {
    const { body } = await read(await create({ title: 'T', author_name: 'Pen Name', tags: ['a'], published: true, read_time: '2 min read' }))
    expect(body.blog).toMatchObject({ author_name: 'Pen Name', tags: ['a'], published: true, read_time: '2 min read' })
  })

  test('needs a login', async () => {
    expect(await read(await create({ title: 'T' }, null))).toEqual({ status: 401, body: { error: 'Unauthorized' } })
  })

  test('database and input errors answer 500', async () => {
    db.failNext('blogs', { message: 'insert failed' })
    expect(await read(await create({ title: 'T' }))).toEqual({ status: 500, body: { error: 'insert failed' } })
    // No title: the slug cannot be built.
    expect((await create({ content: 'x' })).status).toBe(500)
  })
})

describe('/api/blogs/[id]', () => {
  test('GET returns a published post to anyone', async () => {
    expect(await read(await one.GET(request('/api/blogs/b1'), params({ id: 'b1' })))).toMatchObject({ status: 200, body: { id: 'b1' } })
  })

  test('GET shows a draft only to its author', async () => {
    expect((await one.GET(request('/api/blogs/b4'), params({ id: 'b4' }))).status).toBe(404)
    expect((await one.GET(request('/api/blogs/b4', { token: tokenFor(ravi) }), params({ id: 'b4' }))).status).toBe(404)
    expect((await one.GET(request('/api/blogs/b4', { token: tokenFor(asha) }), params({ id: 'b4' }))).status).toBe(200)
  })

  test('GET: unknown id 404, database error 500, unexpected 500', async () => {
    expect(await read(await one.GET(request('/x'), params({ id: 'nope' })))).toMatchObject({ status: 404 })
    db.failNext('blogs', { message: 'db down' })
    expect(await read(await one.GET(request('/x'), params({ id: 'b1' })))).toEqual({ status: 500, body: { error: 'db down' } })
    const exploding = { params: { get id() { throw new Error('boom') } } }
    expect((await one.GET(request('/x'), exploding)).status).toBe(500)
  })

  const put = (id, body, user) => one.PUT(request(`/api/blogs/${id}`, { method: 'PUT', body, token: user && tokenFor(user) }), params({ id }))
  const del = (id, user) => one.DELETE(request(`/api/blogs/${id}`, { method: 'DELETE', token: user && tokenFor(user) }), params({ id }))

  test('PUT lets the author edit, but not change the author or id', async () => {
    const { status, body } = await read(await put('b1', { title: 'New', author_id: 'user-2', id: 'zzz' }, asha))
    expect(status).toBe(200)
    expect(body.blog).toMatchObject({ id: 'b1', title: 'New', author_id: 'user-1' })
    expect(body.blog.updated_at).toBeTruthy()
  })

  test('PUT: 401 without login, 403 for someone else, 404 unknown, 500 on database errors', async () => {
    expect((await put('b1', { title: 'x' })).status).toBe(401)
    expect(await read(await put('b1', { title: 'x' }, ravi))).toEqual({ status: 403, body: { error: 'Unauthorized to edit this blog' } })
    expect((await put('nope', { title: 'x' }, asha)).status).toBe(404)
    db.failNext('blogs', { message: 'db down' })
    expect((await put('b1', { title: 'x' }, asha)).status).toBe(500)
    const original = db.from.bind(db)
    vi.spyOn(db, 'from').mockImplementation((t) => {
      const q = original(t)
      if (q && db.queries.filter((x) => x.table === 'blogs').length >= 1) db.failNext('blogs', { message: 'update failed' })
      return q
    })
    expect(await read(await put('b1', { title: 'x' }, asha))).toEqual({ status: 500, body: { error: 'update failed' } })
  })

  test('DELETE lets only the author delete', async () => {
    expect((await del('b1')).status).toBe(401)
    expect((await del('b1', ravi)).status).toBe(403)
    expect((await del('nope', asha)).status).toBe(404)
    expect(await read(await del('b1', asha))).toEqual({ status: 200, body: { message: 'Blog deleted successfully' } })
    expect(db.tables.blogs.map((b) => b.id)).not.toContain('b1')
  })

  test('DELETE reports database errors', async () => {
    db.failNext('blogs', { message: 'db down' })
    expect((await del('b1', asha)).status).toBe(500)
    const original = db.from.bind(db)
    vi.spyOn(db, 'from').mockImplementation((t) => {
      const q = original(t)
      if (db.queries.filter((x) => x.table === 'blogs').length >= 2) db.failNext('blogs', { message: 'delete failed' })
      return q
    })
    expect(await read(await del('b2', asha))).toEqual({ status: 500, body: { error: 'delete failed' } })
  })

  test('PUT and DELETE: an unexpected failure answers 500', async () => {
    const exploding = { params: { get id() { throw new Error('boom') } } }
    expect((await one.PUT(request('/x', { method: 'PUT', token: tokenFor(asha), body: '{' }), params({ id: 'b1' }))).status).toBe(500)
    expect((await one.DELETE(request('/x', { method: 'DELETE', token: tokenFor(asha) }), exploding)).status).toBe(500)
  })
})

describe('GET /api/blogs/my-blogs', () => {
  test('lists my posts, drafts included, newest first', async () => {
    const { status, body } = await read(await myBlogs(request('/api/blogs/my-blogs?limit=2', { token: tokenFor(asha) })))
    expect(status).toBe(200)
    expect(body.blogs.map((b) => b.id)).toEqual(['b4', 'b2'])
    expect(body.pagination).toEqual({ page: 1, limit: 2, total: 3, totalPages: 2 })
  })

  test('needs a login, and reports database errors', async () => {
    expect((await myBlogs(request('/x'))).status).toBe(401)
    db.failNext('blogs', { message: 'db down' })
    expect(await read(await myBlogs(request('/x', { token: tokenFor(asha) })))).toEqual({ status: 500, body: { error: 'db down' } })
    // A URL that cannot be parsed fails after the login check.
    const req = request('/x', { token: tokenFor(asha) })
    expect((await myBlogs({ headers: req.headers, url: 'not a url' })).status).toBe(500)
  })
})

describe('POST /api/blogs/migrate', () => {
  let migrate
  beforeEach(async () => {
    vi.resetModules()
    migrate = (await import('@/app/api/blogs/migrate/route')).POST
  })
  const call = (headers = {}) => migrate(request('/api/blogs/migrate', { method: 'POST', headers }))

  test('outside development it needs the admin key', async () => {
    process.env.ADMIN_API_KEY = 'admin-key'
    try {
      expect(await read(await call())).toEqual({ status: 401, body: { error: 'Unauthorized' } })
      expect((await call({ authorization: 'Bearer wrong' })).status).toBe(401)
      expect((await call({ authorization: 'Bearer admin-key' })).status).toBe(200)
    } finally {
      delete process.env.ADMIN_API_KEY
    }
  })

  test('creates the admin author and copies the bundled posts, published', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    db.reset({ users: [] })
    const { status, body } = await read(await call())

    expect(status).toBe(200)
    expect(body.message).toBe(`Successfully migrated ${bundled.blogs.length} blogs to the database`)
    const admin = db.tables.users.find((u) => u.email === 'admin@example.com')
    expect(db.tables.blogs).toHaveLength(bundled.blogs.length)
    expect(db.tables.blogs.every((b) => b.author_id === admin.id && b.published)).toBe(true)
    expect(db.tables.blogs[0].slug).toMatch(/-[0-9a-f]{8}$/)
  })

  test('reuses an existing admin author', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    db.reset({ users: [{ id: 'admin', email: 'admin@example.com' }] })
    await call()
    expect(db.tables.users).toHaveLength(1)
    expect(db.tables.blogs[0].author_id).toBe('admin')
  })

  test('skips when posts already exist (counting only)', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    db.seed({ users: [{ id: 'admin', email: 'admin@example.com' }], blogs: [blog('b1')] })
    expect(await read(await call())).toEqual({ status: 200, body: { message: 'Blogs already exist in the database. Migration skipped.' } })
  })

  // Fails the n-th query (0-based) on a table.
  const failQuery = (table, n) => {
    const original = db.from.bind(db)
    vi.spyOn(db, 'from').mockImplementation((t) => {
      if (t === table && db.queries.filter((q) => q.table === table).length === n) db.failNext(table, { message: `${table} failed` })
      return original(t)
    })
  }

  test.each([
    ['creating the admin user', 'users', 1, 'Failed to create admin user: users failed'],
    ['counting posts', 'blogs', 0, 'Failed to check existing blogs: blogs failed'],
    ['inserting posts', 'blogs', 1, 'Failed to migrate blogs: blogs failed'],
  ])('reports a failure while %s', async (_label, table, n, error) => {
    vi.stubEnv('NODE_ENV', 'development')
    db.reset({ users: [] })
    failQuery(table, n)
    expect(await read(await call())).toEqual({ status: 500, body: { error } })
  })

  test('without service-role settings it answers 500', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', '')
    expect((await read(await call())).body.error).toBe('Internal server error: Missing Supabase environment variables')
  })

  // FINDING: if ADMIN_API_KEY is not set, the check compares against the string
  // "Bearer undefined", so that header is accepted and anyone can run the migration (which
  // also creates admin@example.com with a password written in a source comment).
  knownBug('without ADMIN_API_KEY configured, no header is accepted', async () => {
    delete process.env.ADMIN_API_KEY
    expect((await call({ authorization: 'Bearer undefined' })).status).toBe(401)
  })
})
