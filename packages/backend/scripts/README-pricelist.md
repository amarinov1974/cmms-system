# Seeding a pricelist for one vendor company

In this CMMS, **pricelists are per vendor company** (e.g. Voltaris Electrical Solutions, ThermaCore HVAC Services). They are used when S3 builds cost proposals on work orders.

## Option 1: Import from Excel (recommended if you have a spreadsheet)

If your pricelist is in Excel with columns **Group**, **Item**, **Specification**, **Unit**, and **Price (€)**:

1. From `packages/backend`, run:

   ```bash
   npm run db:seed-pricelist-excel -- "Vendor Company Name" path/to/your-pricelist.xlsx
   ```

   Example (file in backend folder):

   ```bash
   npm run db:seed-pricelist-excel -- "Voltaris Electrical Solutions" ./pricelist.xlsx
   ```

2. The script uses the **first sheet**, treats the first row as headers, and maps:
   - **Group** → category  
   - **Item** + **Specification** → description (e.g. "LED Panel 60x60 (36W 4000K)")  
   - **Unit** → unit  
   - **Price (€)** → price (handles European format like `1,00` or `145,00`)

3. It only **adds** new rows; it does not delete existing pricelist items.

## Option 2: Run the seed script from JSON

1. **Create a JSON file** with an array of items. Each item must have:
   - `category` (string) – e.g. "Labor", "Fixed Fees", "HVAC Parts"
   - `description` (string)
   - `unit` (string) – e.g. "hour", "visit", "piece", "meter", "kg"
   - `pricePerUnit` (number)

   Example: see `pricelist-example.json` in this folder.

2. **From `packages/backend`**, run:

   ```bash
   npm run db:seed-pricelist -- "Vendor Company Name" scripts/pricelist-example.json
   ```

   Or by vendor ID:

   ```bash
   npm run db:seed-pricelist -- 1 scripts/pricelist-example.json
   ```

   Replace `"Vendor Company Name"` with the exact name of the vendor company (e.g. `"Voltaris Electrical Solutions"`) or use its numeric ID. Replace the path with your JSON file path.

3. The script creates all rows in the `vendor_price_list` table for that vendor. It does **not** delete existing items; it only adds new ones.

## Option 3: Full database seed

Running `npm run db:seed` from `packages/backend` reseeds the entire database (including demo companies, users, tickets, etc.) and creates a sample pricelist for the **Voltaris Electrical Solutions** vendor only. Use this for a fresh demo environment, not for adding a pricelist to an existing vendor.

## Listing vendor companies

To see vendor company names and IDs, use Prisma Studio:

```bash
cd packages/backend && npm run db:studio
```

Open the `vendor_companies` table to find the `id` and `name` to use with the seed script.
