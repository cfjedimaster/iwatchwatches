export function formatRelativeTime(date: Date | string | null | undefined): string {
  if (!date) return "Recently";
  const value = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(value.getTime())) return "Recently";

  const diffMs = value.getTime() - Date.now();
  const absMs = Math.abs(diffMs);
  const minutes = Math.round(absMs / 60_000);
  const hours = Math.round(absMs / 3_600_000);
  const days = Math.round(absMs / 86_400_000);

  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  if (minutes < 60) return rtf.format(Math.sign(diffMs) * minutes || 0, "minute");
  if (hours < 48) return rtf.format(Math.sign(diffMs) * hours, "hour");
  if (days < 30) return rtf.format(Math.sign(diffMs) * days, "day");

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(value);
}

export function formatAbsoluteDate(date: Date | string | null | undefined): string {
  if (!date) return "";
  const value = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(value.getTime())) return "";

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(value).toUpperCase();
}
