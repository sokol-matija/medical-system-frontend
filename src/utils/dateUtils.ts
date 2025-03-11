import { format, parseISO, differenceInYears } from 'date-fns';

/**
 * Formats a date string to a more readable format (DD/MM/YYYY)
 * @param dateString - The ISO date string to format
 * @returns Formatted date string
 */
export const formatDate = (dateString: string): string => {
  try {
    return format(parseISO(dateString), 'dd/MM/yyyy');
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString || 'N/A';
  }
};

/**
 * Formats a date string with time to a more readable format (DD/MM/YYYY HH:mm)
 * @param dateString - The ISO date string to format
 * @returns Formatted date and time string
 */
export const formatDateTime = (dateString: string): string => {
  try {
    return format(parseISO(dateString), 'dd/MM/yyyy HH:mm');
  } catch (error) {
    console.error('Error formatting datetime:', error);
    return dateString || 'N/A';
  }
};

/**
 * Converts a Date object to an ISO string without timezone information
 * @param date - JavaScript Date object
 * @returns ISO date string
 */
export const toISODateString = (date: Date): string => {
  return format(date, 'yyyy-MM-dd');
};

/**
 * Converts a Date object to an ISO date-time string
 * @param date - JavaScript Date object
 * @returns ISO date-time string
 */
export const toISODateTimeString = (date: Date): string => {
  return format(date, "yyyy-MM-dd'T'00:00:00'Z'");
};

/**
 * Calculates the age based on a date of birth
 * @param dateOfBirthString - The ISO date string of birth
 * @returns Age in years
 */
export const calculateAge = (dateOfBirthString: string): number => {
  try {
    const dob = parseISO(dateOfBirthString);
    return differenceInYears(new Date(), dob);
  } catch (error) {
    console.error('Error calculating age:', error);
    return 0;
  }
}; 