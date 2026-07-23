import { integer, pgTable, serial, text, timestamp, varchar, index } from "drizzle-orm/pg-core";

export const feeds = pgTable("feeds", {
  id: serial().primaryKey(),
  name: varchar({ length: 255 }).notNull(),
  url: text().notNull(),
  feedUrl: text("feed_url").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const feedItems = pgTable(
  "feed_items",
  {
    id: serial().primaryKey(),
    feedId: integer("feed_id")
      .notNull()
      .references(() => feeds.id, { onDelete: "cascade" }),
    title: text().notNull(),
    url: text().notNull().unique(),
    synopsis: text(),
    imageUrl: text("image_url"),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("feed_items_published_at_idx").on(table.publishedAt)],
);

export type Feed = typeof feeds.$inferSelect;
export type NewFeed = typeof feeds.$inferInsert;
export type FeedItem = typeof feedItems.$inferSelect;
export type NewFeedItem = typeof feedItems.$inferInsert;
