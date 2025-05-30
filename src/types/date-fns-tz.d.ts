declare module "date-fns-tz" {
  export function toDate(
    date: Date | number | string,
    options?: { timeZone: string }
  ): Date;

  export function formatInTimeZone(
    date: Date | number,
    timeZone: string,
    format: string,
    options?: {
      locale?: Locale;
    }
  ): string;

  // Exporta cualquier otro método que necesites usar.
}
