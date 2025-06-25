import { eachDayOfInterval, endOfWeek, format, isSameDay, isToday, startOfWeek } from 'date-fns';

export const formatDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'yyyy-MM-dd');
};

export const formatDisplayDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'MMM d');
};

export const formatDayName = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'EEE');
};

export const getWeekDays = (date: Date = new Date()): Date[] => {
  const start = startOfWeek(date, { weekStartsOn: 1 }); // Monday start
  const end = endOfWeek(date, { weekStartsOn: 1 });
  return eachDayOfInterval({ start, end });
};

export const getCurrentWeekStart = (): string => {
  const start = startOfWeek(new Date(), { weekStartsOn: 1 });
  return formatDate(start);
};

export const isCurrentDay = (date: Date | string): boolean => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return isToday(dateObj);
};

export const isSameDate = (date1: Date | string, date2: Date | string): boolean => {
  const date1Obj = typeof date1 === 'string' ? new Date(date1) : date1;
  const date2Obj = typeof date2 === 'string' ? new Date(date2) : date2;
  return isSameDay(date1Obj, date2Obj);
};

export const getDayName = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'EEEE').toLowerCase();
};

export const addDays = (date: Date | string, days: number): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const newDate = new Date(dateObj);
  newDate.setDate(dateObj.getDate() + days);
  return formatDate(newDate);
}; 