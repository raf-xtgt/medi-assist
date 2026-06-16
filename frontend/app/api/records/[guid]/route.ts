import { query } from '@/lib/db'
import type { MdaUser, UpdateMdaUserInput } from '@/lib/types'

type RouteContext = { params: Promise<{ guid: string }> }

/**
 * GET /api/records/[guid]
 * Fetch a single user by guid.
 */
export async function GET(_request: Request, { params }: RouteContext) {
  const { guid } = await params
  try {
    const result = await query(
      'SELECT guid, email, phone, created_date, status FROM app_mda_user WHERE guid = $1',
      [guid],
    )

    if (result.rows.length === 0) {
      return Response.json({ error: 'User not found' }, { status: 404 })
    }

    return Response.json(result.rows[0] as MdaUser)
  } catch (error) {
    console.error('[records/[guid]] GET error:', error)
    return Response.json({ error: 'Failed to fetch user' }, { status: 500 })
  }
}

/**
 * PATCH /api/records/[guid]
 * Partially update a user. Accepts any subset of { email, phone, status }.
 */
export async function PATCH(request: Request, { params }: RouteContext) {
  const { guid } = await params
  try {
    const body = (await request.json()) as Partial<UpdateMdaUserInput>

    const allowedFields: (keyof UpdateMdaUserInput)[] = ['email', 'phone', 'status']
    const updates: string[] = []
    const values: unknown[] = []
    let paramCount = 1

    for (const field of allowedFields) {
      if (field in body) {
        updates.push(`${field} = $${paramCount}`)
        values.push(body[field] ?? null)
        paramCount++
      }
    }

    if (updates.length === 0) {
      return Response.json(
        { error: 'No valid fields provided for update (allowed: email, phone, status)' },
        { status: 400 },
      )
    }

    values.push(guid)
    const sql = `
      UPDATE app_mda_user
      SET ${updates.join(', ')}
      WHERE guid = $${paramCount}
      RETURNING guid, email, phone, created_date, status
    `

    const result = await query(sql, values)

    if (result.rows.length === 0) {
      return Response.json({ error: 'User not found' }, { status: 404 })
    }

    return Response.json(result.rows[0] as MdaUser)
  } catch (error) {
    console.error('[records/[guid]] PATCH error:', error)
    return Response.json({ error: 'Failed to update user' }, { status: 500 })
  }
}

/**
 * DELETE /api/records/[guid]
 * Delete a user by guid.
 */
export async function DELETE(_request: Request, { params }: RouteContext) {
  const { guid } = await params
  try {
    const result = await query(
      'DELETE FROM app_mda_user WHERE guid = $1 RETURNING guid',
      [guid],
    )

    if (result.rows.length === 0) {
      return Response.json({ error: 'User not found' }, { status: 404 })
    }

    return Response.json({ success: true, guid: result.rows[0].guid })
  } catch (error) {
    console.error('[records/[guid]] DELETE error:', error)
    return Response.json({ error: 'Failed to delete user' }, { status: 500 })
  }
}
