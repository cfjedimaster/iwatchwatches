CREATE TABLE "feed_items" (
	"id" serial PRIMARY KEY,
	"feed_id" integer NOT NULL,
	"title" text NOT NULL,
	"url" text NOT NULL UNIQUE,
	"synopsis" text,
	"image_url" text,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "feeds" (
	"id" serial PRIMARY KEY,
	"name" varchar(255) NOT NULL,
	"url" text NOT NULL,
	"feed_url" text NOT NULL UNIQUE,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "feed_items_published_at_idx" ON "feed_items" ("published_at");--> statement-breakpoint
ALTER TABLE "feed_items" ADD CONSTRAINT "feed_items_feed_id_feeds_id_fkey" FOREIGN KEY ("feed_id") REFERENCES "feeds"("id") ON DELETE CASCADE;