import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const playerId = getCookie(event, 'megacorp-player-id')
  if (!playerId) {
    throw createError({ statusCode: 401, message: 'No player ID' })
  }

  const row = await db.select()
    .from(schema.gameSaves)
    .where(eq(schema.gameSaves.playerId, playerId))
    .get()

  if (!row) return { state: null }
  return { state: JSON.parse(row.stateJson) }
})
