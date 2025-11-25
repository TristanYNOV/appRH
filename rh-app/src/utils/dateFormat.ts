const padNumber = (value: number): string => value.toString().padStart(2, "0");

const getParts = (value: Date | string | number) => {
    const date = value instanceof Date ? value : new Date(value);

    return {
        year: date.getFullYear(),
        month: padNumber(date.getMonth() + 1),
        day: padNumber(date.getDate()),
        hours: padNumber(date.getHours()),
        minutes: padNumber(date.getMinutes()),
        seconds: padNumber(date.getSeconds()),
    };
};

/**
 * Formats a date into "yyyy-MM-dd HH:mm:ss".
 * Accepts either a Date instance or any value convertible to a Date.
 */
export const formatDateTime = (value: Date | string | number): string => {
    const { year, month, day, hours, minutes, seconds } = getParts(value);

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

/**
 * Formats a date into "yyyy-MM-ddTHH:mm:ss" (no timezone offset).
 * Useful for APIs expecting a local datetime string without an offset.
 */
export const formatDateTimeLocal = (value: Date | string | number): string => {
    const { year, month, day, hours, minutes, seconds } = getParts(value);

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
};

