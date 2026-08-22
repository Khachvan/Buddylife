CREATE TABLE `content_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`content_key` text NOT NULL,
	`value` text NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `content_items_content_key_unique` ON `content_items` (`content_key`);--> statement-breakpoint
CREATE TABLE `registrations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`role` text NOT NULL,
	`name` text,
	`business_name` text,
	`email` text NOT NULL,
	`phone` text,
	`pet_type` text,
	`pet_name` text,
	`category` text,
	`city` text,
	`province` text,
	`social` text,
	`interests` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
