// utils/dateUtil.ts

/**
 * Format a date string to readable format for UI.
 * @example "Jul 21, 2025"
 */
export function formatReadableDate(input: string | number | Date): string {
    if (typeof input === 'string' && /^\d{17}$/.test(input)) {
        // Parse "20250722175555553"
        const year = parseInt(input.slice(0, 4), 10);
        const month = parseInt(input.slice(4, 6), 10) - 1; // 0-indexed
        const day = parseInt(input.slice(6, 8), 10);
        const hour = parseInt(input.slice(8, 10), 10);
        const minute = parseInt(input.slice(10, 12), 10);
        const second = parseInt(input.slice(12, 14), 10);
        const millisecond = parseInt(input.slice(14, 17), 10);

        const date = new Date(year, month, day, hour, minute, second, millisecond);
        return date.toLocaleString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    }

    // fallback: regular date parsing
    const date = new Date(input);
    return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleDateString();
}



/**
 * Convert to backend format: YYYYMMDDHHMMSSmmm (e.g., 20250721103851385)
 */
export function formatDateForBackend(date: string | number | Date): string {
    const d = new Date(date);
    const pad = (num: number, size = 2) => String(num).padStart(size, '0');

    return (
        d.getFullYear().toString() +
        pad(d.getMonth() + 1) +
        pad(d.getDate()) +
        pad(d.getHours()) +
        pad(d.getMinutes()) +
        pad(d.getSeconds()) +
        pad(d.getMilliseconds(), 3)
    );
}
