import { writeFileSync } from "node:fs";
import bambooRaw from "../bamboohr/trainingTypesBamboo.json";
import salusRaw from "../salus/trainingTypesSalus.json";

function toCsvRow(fields: string[], obj: Record<string, unknown>): string {
    return fields.map(f => {
        const val = String(obj[f] ?? '');
        return val.includes(',') || val.includes('"') || val.includes('\n')
            ? `"${val.replace(/"/g, '""')}"` : val;
    }).join(',');
}

function writeCsv(filename: string, fields: string[], rows: Record<string, unknown>[]) {
    const lines = [fields.join(','), ...rows.map(r => toCsvRow(fields, r))];
    writeFileSync(filename, lines.join('\n'));
    console.log(`Wrote ${rows.length} rows to ${filename}`);
}

// BambooHR: object keyed by id → flatten nested category and dueFromHireDate
const bambooRows = Object.values(bambooRaw).map(t => ({
    id: t.id,
    name: t.name,
    renewable: t.renewable,
    frequency: t.frequency,
    required: t.required,
    categoryId: t.category.id,
    categoryName: t.category.name,
    dueFromHireDate: Array.isArray(t.dueFromHireDate)
        ? ''
        : `${(t.dueFromHireDate as { amount: string; unit: string }).amount} ${(t.dueFromHireDate as { amount: string; unit: string }).unit}`,
    allowEmployeesToMarkComplete: t.allowEmployeesToMarkComplete,
    linkUrl: t.linkUrl ?? '',
    description: t.description ?? '',
}));

writeCsv('bambooTrainingTypes.csv',
    ['id', 'name', 'renewable', 'frequency', 'required', 'categoryId', 'categoryName', 'dueFromHireDate', 'allowEmployeesToMarkComplete', 'linkUrl', 'description'],
    bambooRows as Record<string, unknown>[]);

// Salus: data array, fields are already flat
const salusRows = salusRaw.data as Record<string, unknown>[];

writeCsv('salusTrainingTypes.csv',
    ['id', 'name', 'required', 'slug', 'companyId'],
    salusRows);
