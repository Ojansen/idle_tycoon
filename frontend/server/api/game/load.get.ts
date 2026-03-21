import { eq } from 'drizzle-orm'

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export default defineEventHandler(async (event) => {
  const playerId = getCookie(event, 'megacorp-player-id')
  if (!playerId || !uuidRegex.test(playerId)) {
    throw createError({ statusCode: 401, message: 'Invalid player ID' })
  }

  const row = await db.select()
    .from(schema.gameSaves)
    .where(eq(schema.gameSaves.playerId, playerId))
    .get()

  if (!row) return { state: null }
  return { state: JSON.parse(row.stateJson) }
})
