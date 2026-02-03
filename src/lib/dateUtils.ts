/**
 * Format a date as MM/DD/YYYY.
 * Use this for all user-facing date displays across the app.
 */
export function formatDate(value: string | Date | null | undefined): string {
  if (value == null) return "";
  try {
    const date = typeof value === "string" ? new Date(value) : value;
    if (isNaN(date.getTime())) return "";
    return date.toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

/**
 * Format a date with time as MM/DD/YYYY, HH:MM.
 */
export function formatDateTime(value: string | Date | null | undefined): string {
  if (value == null) return "";
  try {
    const date = typeof value === "string" ? new Date(value) : value;
    if (isNaN(date.getTime())) return "";
    const dateStr = date.toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    });
    const timeStr = date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
    return `${dateStr}, ${timeStr}`;
  } catch {
    return "";
  }
}
