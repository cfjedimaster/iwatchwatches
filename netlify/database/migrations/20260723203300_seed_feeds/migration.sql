INSERT INTO "feeds" ("name", "url", "feed_url")
VALUES
  ('Hodinkee', 'https://www.hodinkee.com', 'https://www.hodinkee.com/articles/rss.xml'),
  ('Fratello', 'https://www.fratellowatches.com', 'https://www.fratellowatches.com/feed/'),
  ('Worn & Wound', 'https://wornandwound.com', 'https://wornandwound.com/feed'),
  ('aBlogtoWatch', 'https://www.ablogtowatch.com', 'https://www.ablogtowatch.com/feed/'),
  ('Monochrome Watches', 'https://monochrome-watches.com', 'https://monochrome-watches.com/feed/'),
  ('A Collected Man', 'https://www.acollectedman.com', 'https://www.acollectedman.com/blogs/journal.atom')
ON CONFLICT ("feed_url") DO NOTHING;
