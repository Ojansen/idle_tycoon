import { eq } from 'drizzle-orm'

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export default defineEventHandler(async (event) => {
  const playerId = getCookie(event, 'megacorp-player-id')
  if (!playerId || !uuidRegex.test(playerId)) {
    throw createError({ statusCode: 401, message: 'Invalid player ID' })
  }

  const body = await readBody<{ state: string }>(event)
  if (!body.state) {
    throw createError({ statusCode: 400, message: 'Missing state' })
  }

  const now = new Date()

  await db.insert(schema.gameSaves)
    .values({
      playerId,
      stateJson: body.state,
      updatedAt: now,
      createdAt: now
    })
    .onConflictDoUpdate({
      target: schema.gameSaves.playerId,
      set: {
        stateJson: body.state,
        updatedAt: now
      }
    })

  return { ok: true }
})
