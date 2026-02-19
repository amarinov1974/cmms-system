/**
 * Seed pricelist from an Excel file for one vendor company.
 *
 * Expected Excel columns (first row = headers, names flexible):
 *   - Group         → category
 *   - Item          → part of description
 *   - Specification → appended to description (optional)
 *   - Unit          → unit
 *   - Price (€)     → pricePerUnit (handles "1,00" or 1.00)
 *
 * Usage: npx tsx scripts/seed-pricelist-excel.ts <vendorCompanyNameOrId> <path-to-xlsx>
 *
 * Example:
 *   npx tsx scripts/seed-pricelist-excel.ts "Voltaris Electrical Solutions" ./pricelist.xlsx
 */

import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';
import { resolve } from 'path';
// @ts-expect-error xlsx has no types
import * as XLSX from 'xlsx';

const prisma = new PrismaClient();

function findColumn(row: Record<string, unknown>, ...names: string[]): string | null {
  const keys = Object.keys(row);
  const lower = (s: string) => s.trim().toLowerCase();
  for (const name of names) {
    const n = lower(name);
    const key = keys.find((k) => lower(k) === n || lower(k).startsWith(n));
    if (key) return key;
  }
  return null;
}

function parsePrice(value: unknown): number | null {
  if (typeof value === 'number' && !Number.isNaN(value)) return value;
  if (typeof value === 'string') {
    const normalized = value.trim().replace(',', '.');
    const n = parseFloat(normalized);
    return Number.isNaN(n) ? null : n;
  }
  return null;
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.error(`
Usage: npx tsx scripts/seed-pricelist-excel.ts <vendorCompanyNameOrId> <path-to-xlsx>

  vendorCompanyNameOrId  Vendor company name or numeric ID
  path-to-xlsx          Path to Excel file (columns: Group, Item, Specification, Unit, Price (€))

Example:
  npx tsx scripts/seed-pricelist-excel.ts "Voltaris Electrical Solutions" ./pricelist.xlsx
`);
    process.exit(1);
  }

  const vendorArg = args[0];
  const xlsxPath = resolve(process.cwd(), args[1]);

  let vendorId: number;
  const numericId = parseInt(vendorArg, 10);
  if (!Number.isNaN(numericId)) {
    const vendor = await prisma.vendorCompany.findUnique({ where: { id: numericId } });
    if (!vendor) {
      console.error(`Vendor company with ID ${numericId} not found.`);
      process.exit(1);
    }
    vendorId = vendor.id;
    console.log(`Using vendor: ${vendor.name} (id=${vendorId})`);
  } else {
    const vendor = await prisma.vendorCompany.findFirst({
      where: { name: { equals: vendorArg, mode: 'insensitive' } },
    });
    if (!vendor) {
      console.error(`Vendor company "${vendorArg}" not found.`);
      process.exit(1);
    }
    vendorId = vendor.id;
    console.log(`Using vendor: ${vendor.name} (id=${vendorId})`);
  }

  let workbook: XLSX.WorkBook;
  try {
    const buf = readFileSync(xlsxPath);
    workbook = XLSX.read(buf, { type: 'buffer' });
  } catch (e) {
    console.error(`Cannot read file: ${xlsxPath}`, e);
    process.exit(1);
  }

  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(sheet) as Record<string, unknown>[];

  if (rows.length === 0) {
    console.error('Excel sheet is empty or has no data rows.');
    process.exit(1);
  }

  const first = rows[0];
  const groupKey = findColumn(first, 'Group', 'group', 'Category', 'category');
  const itemKey = findColumn(first, 'Item', 'item', 'Description', 'description');
  const specKey = findColumn(first, 'Specification', 'specification', 'Spec', 'spec');
  const unitKey = findColumn(first, 'Unit', 'unit');
  const priceKey = findColumn(first, 'Price (€)', 'Price', 'price', 'Price (EUR)', 'Price (euro)');

  if (!groupKey || !itemKey || !unitKey || !priceKey) {
    console.error(
      'Expected columns: Group, Item, Unit, and Price (€). Found:',
      Object.keys(first).join(', ')
    );
    process.exit(1);
  }

  const normalized: { category: string; description: string; unit: string; pricePerUnit: number }[] = [];

  for (const row of rows) {
    const group = row[groupKey];
    const item = row[itemKey];
    const spec = specKey ? row[specKey] : null;
    const unit = row[unitKey];
    const price = parsePrice(row[priceKey]);

    const category = typeof group === 'string' ? group.trim() : String(group ?? '').trim();
    const itemStr = typeof item === 'string' ? item.trim() : String(item ?? '').trim();
    const specStr = spec != null && spec !== '' ? (typeof spec === 'string' ? spec.trim() : String(spec).trim()) : '';
    const description = specStr ? `${itemStr} (${specStr})` : itemStr;
    const unitStr = typeof unit === 'string' ? unit.trim() : String(unit ?? '').trim();

    if (!category || !itemStr || !unitStr || price == null || price < 0) continue;

    normalized.push({ category, description, unit: unitStr, pricePerUnit: price });
  }

  if (normalized.length === 0) {
    console.error('No valid rows found (need Group, Item, Unit, and a valid Price).');
    process.exit(1);
  }

  console.log(`Importing ${normalized.length} row(s) from "${sheetName}"...`);

  let created = 0;
  for (const row of normalized) {
    await prisma.vendorPriceListItem.create({
      data: {
        vendorId,
        category: row.category,
        description: row.description,
        unit: row.unit,
        pricePerUnit: row.pricePerUnit,
        active: true,
      },
    });
    created++;
  }

  console.log(`Created ${created} price list item(s) for vendor id=${vendorId}.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
