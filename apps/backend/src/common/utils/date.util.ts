export class DateUtil {
  static getDaysDifference(start: Date, end: Date): number {
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  static isDateInPast(date: Date): boolean {
    return date < new Date();
  }

  static isDateInFuture(date: Date): boolean {
    return date > new Date();
  }

  static addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }
}
