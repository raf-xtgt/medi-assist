import { query } from '@/lib/db'
import type { CreateMdaUserInput, MdaUser } from '@/lib/types'

/**
 * GET /api/records
 * Returns all users, ordered by created_date descending.
 * Supports optional query params: ?status=active&limit=50&offset=0
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '100', 10), 500)
    const offset = parseInt(searchParams.get('offset') ?? '0', 10)

    let sql = `
      SELECT guid, email, phone, created_date, status
      FROM app_mda_user
    `
    const values: unknown[] = []
    let paramCount = 1

    if (status) {
      sql += ` WHERE status = $${paramCount}`
      values.push(status)
      paramCount++
    }

    sql += ` ORDER BY created_date DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`
    values.push(limit, offset)

    const result = await query(sql, values)
    return Response.json(result.rows as MdaUser[])
  } catch (error) {
    console.error('[records] GET error:', error)
    return Response.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}

/**
 * POST /api/records
 * Creates a new user record. Expects JSON body: { guid, email?, phone?, status? }
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<CreateMdaUserInput>

    if (!body.guid || typeof body.guid !== 'string') {
      return Response.json({ error: 'guid is required and must be a string (UUID)' }, { status: 400 })
    }

    const { guid, email = null, phone = null, status = null } = body

    const result = await query(
      `INSERT INTO app_mda_user (guid, email, phone, status)
       VALUES ($1, $2, $3, $4)
       RETURNING guid, email, phone, created_date, status`,
      [guid, email, phone, status],
    )

    return Response.json(result.rows[0] as MdaUser, { status: 201 })
  } catch (error: unknown) {
    console.error('[records] POST error:', error)
    // Handle unique-constraint violation (duplicate guid)
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code: string }).code === '23505'
    ) {
      return Response.json({ error: 'A user with this guid already exists' }, { status: 409 })
    }
    return Response.json({ error: 'Failed to create user' }, { status: 500 })
  }
}
