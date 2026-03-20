import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

export const gameSaves = sqliteTable('game_saves', {
  playerId: text('player_id').primaryKey(),
  stateJson: text('state_json').notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date())
})
