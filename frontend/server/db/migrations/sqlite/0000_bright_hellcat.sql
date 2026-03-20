CREATE TABLE `game_saves` (
	`player_id` text PRIMARY KEY NOT NULL,
	`state_json` text NOT NULL,
	`updated_at` integer NOT NULL,
	`created_at` integer NOT NULL
);
