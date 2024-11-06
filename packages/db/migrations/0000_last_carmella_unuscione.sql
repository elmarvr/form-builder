CREATE TABLE `form_field` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`attributes` text NOT NULL,
	`form_id` text NOT NULL,
	FOREIGN KEY (`form_id`) REFERENCES `form`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `form` (
	`id` text PRIMARY KEY NOT NULL
);
