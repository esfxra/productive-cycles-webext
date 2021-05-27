import { Duration } from "luxon";

export function minutesToMillis(minutes: number): number {
  // Could also implement as 'minutes * 60000', but using Duration for consistency
  return Duration.fromObject({ minutes: minutes }).as("milliseconds");
}

export function millisToFormattedString(milliseconds: number): string {
  return Duration.fromMillis(milliseconds).toFormat("mm:ss");
}
