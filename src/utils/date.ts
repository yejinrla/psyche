const DAY_IN_MS = 24 * 60 * 60 * 1000;

export const todayISO = () => {
  const today = new Date();
  const localTime = today.getTime() - today.getTimezoneOffset() * 60 * 1000;
  return new Date(localTime).toISOString().slice(0, 10);
};

export const parseISODate = (date: string) => new Date(`${date}T00:00:00`);

export const formatShortDate = (date: string) => {
  const parsed = parseISODate(date);
  return new Intl.DateTimeFormat('ko-KR', {
    month: 'short',
    day: 'numeric',
  }).format(parsed);
};

export const formatFullDate = (date: string) => {
  const parsed = parseISODate(date);
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  }).format(parsed);
};

export const daysBetween = (startDate: string, endDate = todayISO()) => {
  const start = parseISODate(startDate).getTime();
  const end = parseISODate(endDate).getTime();
  return Math.max(1, Math.floor((end - start) / DAY_IN_MS) + 1);
};

export const daysUntil = (date: string) => {
  const today = parseISODate(todayISO()).getTime();
  const target = parseISODate(date).getTime();
  return Math.ceil((target - today) / DAY_IN_MS);
};

export const isWithinDays = (date: string, days: number) => {
  const diff = Math.abs(parseISODate(todayISO()).getTime() - parseISODate(date).getTime());
  return diff <= days * DAY_IN_MS;
};

export const sortByDateDesc = <T extends { date: string }>(items: T[]) =>
  [...items].sort((a, b) => b.date.localeCompare(a.date));

export const sortByDateAsc = <T extends { date: string }>(items: T[]) =>
  [...items].sort((a, b) => a.date.localeCompare(b.date));
