CREATE TABLE `analytics_events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`event_type` text NOT NULL,
	`page` text NOT NULL,
	`language` text,
	`audience` text,
	`metadata` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_registrations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`role` text NOT NULL,
	`name` text,
	`business_name` text,
	`email` text,
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
--> statement-breakpoint
INSERT INTO `__new_registrations`("id", "role", "name", "business_name", "email", "phone", "pet_type", "pet_name", "category", "city", "province", "social", "interests", "created_at") SELECT "id", "role", "name", "business_name", "email", "phone", "pet_type", "pet_name", "category", "city", "province", "social", "interests", "created_at" FROM `registrations`;--> statement-breakpoint
DROP TABLE `registrations`;--> statement-breakpoint
ALTER TABLE `__new_registrations` RENAME TO `registrations`;--> statement-breakpoint
PRAGMA foreign_keys=ON;