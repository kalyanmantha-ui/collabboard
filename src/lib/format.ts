const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// parsed by hand: new Date("YYYY-MM-DD") can shift the day across timezones
export function shortDate(ymd: string): string {
  const [, m, d] = ymd.split("-").map(Number);
  return `${MONTHS[m - 1]} ${d}`;
}
export function longDate(ymd: string): string {
  return `${shortDate(ymd)}, ${ymd.slice(0, 4)}`;
}
export function dateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}
export function relativeDay(iso: string): string {
  const d = new Date(iso);
  const days = Math.floor((Date.now() - d.getTime()) / 86_400_000);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 7) return d.toLocaleDateString("en-US", { weekday: "short" });
  return shortDate(iso.slice(0, 10));
}
export const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;
