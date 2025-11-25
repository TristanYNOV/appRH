const padNumber = (value: number): string => value.toString().padStart(2, "0");

/**
 * Formats a date into "yyyy-MM-dd HH:mm:ss".
 * Accepts either a Date instance or any value convertible to a Date.
 */
export const formatDateTime = (value: Date | string | number): string => {
    const date = value instanceof Date ? value : new Date(value);

    const year = date.getFullYear();
    const month = padNumber(date.getMonth() + 1);
    const day = padNumber(date.getDate());
    const hours = padNumber(date.getHours());
    const minutes = padNumber(date.getMinutes());
    const seconds = padNumber(date.getSeconds());

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

