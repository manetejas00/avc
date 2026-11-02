CREATE TABLE "form_submissions" (
	"id" serial PRIMARY KEY,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text NOT NULL,
	"interest" text DEFAULT '' NOT NULL,
	"message" text DEFAULT '' NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "api_sync_logs" (
	"id" serial PRIMARY KEY,
	"provider" text NOT NULL,
	"status" text NOT NULL,
	"message" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
