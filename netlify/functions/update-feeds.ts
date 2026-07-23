import type { Config } from "@netlify/functions";
import { updateAllFeeds } from "../../src/lib/feeds";

export default async (req: Request) => {
  const body = await req.json().catch(() => ({}));
  const results = await updateAllFeeds();

  const summary = {
    next_run: body?.next_run ?? null,
    feeds: results.length,
    inserted: results.reduce((sum, result) => sum + result.inserted, 0),
    errors: results.filter((result) => result.error).length,
    results,
  };

  console.log("Feed update complete", JSON.stringify(summary));

  return new Response(JSON.stringify(summary), {
    headers: { "Content-Type": "application/json" },
  });
};

export const config: Config = {
  schedule: "@daily",
};
