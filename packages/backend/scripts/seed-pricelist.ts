/**
 * Seed pricelist for one vendor company.
 * Usage: npx tsx scripts/seed-pricelist.ts <vendorCompanyNameOrId> <path-to-json>
 *
 * Example:
 *   npx tsx scripts/seed-pricelist.ts "Voltaris Electrical Solutions" scripts/pricelist-example.json
 *   npx tsx scripts/seed-pricelist.ts 1 scripts/pricelist-example.json
 *
 * JSON format: array of { category, description, unit, pricePerUnit }
 * - category: string (e.g. "Labor", "Fixed Fees", "HVAC Parts")
 * - description: string
 * - unit: string (e.g. "hour", "visit", "piece", "meter", "kg")
 * - pricePerUnit: number
 */

import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const prisma = new PrismaClient();

interface PricelistRow {
  category: string;
  description: string;
  unit: string;
  pricePerUnit: number;
}

function usage(): never {
  console.error(`
Usage: npx tsx scripts/seed-pricelist.ts <vendorCompanyNameOrId> <path-to-json>

  vendorCompanyNameOrId  Vendor company name (e.g. "Voltaris Electrical Solutions") or numeric ID
  path-to-json          Path to JSON file with array of { category, description, unit, pricePerUnit }

Example:
  npx tsx scripts/seed-pricelist.ts "Voltaris Electrical Solutions" scripts/pricelist-example.json
`);
  process.exit(1);
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 2) usage();

  const vendorArg = args[0];
  const jsonPath = resolve(process.cwd(), args[1]);

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

  let raw: string;
  try {
    raw = readFileSync(jsonPath, 'utf-8');
  } catch (e) {
    console.error(`Cannot read file: ${jsonPath}`, e);
    process.exit(1);
  }

  let rows: PricelistRow[];
  try {
    rows = JSON.parse(raw) as PricelistRow[];
  } catch (e) {
    console.error('Invalid JSON:', e);
    process.exit(1);
  }

  if (!Array.isArray(rows) || rows.length === 0) {
    console.error('JSON must be a non-empty array of { category, description, unit, pricePerUnit }.');
    process.exit(1);
  }

  for (const row of rows) {
    if (
      typeof row.category !== 'string' ||
      typeof row.description !== 'string' ||
      typeof row.unit !== 'string' ||
      typeof row.pricePerUnit !== 'number'
    ) {
      console.error('Each row must have category (string), description (string), unit (string), pricePerUnit (number).', row);
      process.exit(1);
    }
  }

  let created = 0;
  for (const row of rows) {
    await prisma.vendorPriceListItem.create({
      data: {
        vendorId,
        category: row.category.trim(),
        description: row.description.trim(),
        unit: row.unit.trim(),
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
