import { writeFileSync } from "node:fs";


// to csv
export function to_csv<T extends Record<string, unknown>>(list: T[], filename: string) {
    const csvHeaders = Object.keys(list[0]);
    const csvRows = list.map(item =>
        csvHeaders.map(h => {
            const val = String(item[h] ?? '');
            return val.includes(',') || val.includes('"') || val.includes('\n')
                ? `"${val.replace(/"/g, '""')}"` : val;
        }).join(',')
    );
    writeFileSync(filename, [csvHeaders.join(','), ...csvRows].join('\n'));
    console.log(`Wrote ${list.length} rows to ${filename}`);
}
