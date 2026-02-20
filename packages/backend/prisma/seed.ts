/**
 * CMMS Seed Data
 * Populates database with demo companies, users, assets, tickets, and workflow data.
 * Run: npm run db:seed (from packages/backend)
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/** Timestamp N days ago (for recent demo data) */
function daysAgo(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}

async function main() {
  console.log('Cleaning existing data...');

  // Delete in order of dependencies (children first)
  await prisma.auditLog.deleteMany();
  await prisma.qRRecord.deleteMany();
  await prisma.attachment.deleteMany();
  await prisma.wOComment.deleteMany();
  await prisma.workReportRow.deleteMany();
  await prisma.invoiceRow.deleteMany();
  await prisma.invoiceBatchItem.deleteMany();
  await prisma.workOrder.updateMany({ data: { invoiceBatchId: null } });
  await prisma.invoiceBatch.deleteMany();
  await prisma.workOrder.deleteMany();
  await prisma.approvalRecord.deleteMany();
  await prisma.costEstimation.deleteMany();
  await prisma.ticketComment.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.asset.deleteMany();
  await prisma.internalUser.deleteMany();
  await prisma.vendorUser.deleteMany();
  await prisma.vendorPriceListItem.deleteMany();
  await prisma.store.deleteMany();
  await prisma.region.deleteMany();
  await prisma.company.deleteMany();
  await prisma.vendorCompany.deleteMany();

  console.log('Creating companies and structure...');

  const retailA = await prisma.company.create({
    data: { name: 'Retail A', active: true },
  });

  const northRegion = await prisma.region.create({
    data: { companyId: retailA.id, name: 'North Region' },
  });
  const southRegion = await prisma.region.create({
    data: { companyId: retailA.id, name: 'South Region' },
  });

  const storesRetailA: { id: number; name: string; regionId: number }[] = [];
  for (let i = 1; i <= 4; i++) {
    const s = await prisma.store.create({
      data: {
        companyId: retailA.id,
        regionId: northRegion.id,
        name: `Store ${i} North`,
        address: `North Address ${i}`,
        active: true,
      },
    });
    storesRetailA.push(s);
  }
  for (let i = 5; i <= 8; i++) {
    const s = await prisma.store.create({
      data: {
        companyId: retailA.id,
        regionId: southRegion.id,
        name: `Store ${i} South`,
        address: `South Address ${i}`,
        active: true,
      },
    });
    storesRetailA.push(s);
  }

  const store1North = storesRetailA[0];
  const store2North = storesRetailA[1];
  const store3North = storesRetailA[2];
  const store4North = storesRetailA[3];
  const store5South = storesRetailA[4];
  const store6South = storesRetailA[5];
  const store7South = storesRetailA[6];
  const store8South = storesRetailA[7];

  console.log('Creating internal users (Retail A)...');

  const sm1 = await prisma.internalUser.create({
    data: { name: 'Ivana Petrović', role: 'SM', companyId: retailA.id, storeId: store1North.id, active: true },
  });
  const sm2 = await prisma.internalUser.create({
    data: { name: 'Tomislav Knežević', role: 'SM', companyId: retailA.id, storeId: store2North.id, active: true },
  });
  const sm3 = await prisma.internalUser.create({
    data: { name: 'Martina Jurić', role: 'SM', companyId: retailA.id, storeId: store3North.id, active: true },
  });
  const sm4 = await prisma.internalUser.create({
    data: { name: 'Davor Šimić', role: 'SM', companyId: retailA.id, storeId: store4North.id, active: true },
  });
  const sm5 = await prisma.internalUser.create({
    data: { name: 'Kristina Kovačić', role: 'SM', companyId: retailA.id, storeId: store5South.id, active: true },
  });
  const sm6 = await prisma.internalUser.create({
    data: { name: 'Matej Babić', role: 'SM', companyId: retailA.id, storeId: store6South.id, active: true },
  });
  const sm7 = await prisma.internalUser.create({
    data: { name: 'Ana Horvat', role: 'SM', companyId: retailA.id, storeId: store7South.id, active: true },
  });
  const sm8 = await prisma.internalUser.create({
    data: { name: 'Nikola Božić', role: 'SM', companyId: retailA.id, storeId: store8South.id, active: true },
  });

  const amNorth = await prisma.internalUser.create({
    data: { name: 'Marko Pavlović', role: 'AM', companyId: retailA.id, regionId: northRegion.id, active: true },
  });
  const amSouth = await prisma.internalUser.create({
    data: { name: 'Ivana Marković', role: 'AM', companyId: retailA.id, regionId: southRegion.id, active: true },
  });
  const ammNorth = await prisma.internalUser.create({
    data: { name: 'Petar Kovač', role: 'AMM', companyId: retailA.id, regionId: northRegion.id, active: true },
  });
  const ammSouth = await prisma.internalUser.create({
    data: { name: 'Sandra Novak', role: 'AMM', companyId: retailA.id, regionId: southRegion.id, active: true },
  });
  const salesDir = await prisma.internalUser.create({
    data: { name: 'Goran Jurković', role: 'D', companyId: retailA.id, active: true },
  });
  const maintDir = await prisma.internalUser.create({
    data: { name: 'Maja Šarić', role: 'C2', companyId: retailA.id, active: true },
  });
  const bod = await prisma.internalUser.create({
    data: { name: 'Zoran Tomašević', role: 'BOD', companyId: retailA.id, active: true },
  });

  console.log('Creating vendor companies and users...');

  const voltaris = await prisma.vendorCompany.create({
    data: { name: 'Voltaris Electrical Solutions', active: true },
  });
  const thermacore = await prisma.vendorCompany.create({
    data: { name: 'ThermaCore HVAC Services', active: true },
  });

  const vendorAna = await prisma.vendorUser.create({
    data: { name: 'Ana Kovač', role: 'S1', vendorCompanyId: voltaris.id, active: true },
  });
  const vendorMarko = await prisma.vendorUser.create({
    data: { name: 'Marko Horvat', role: 'S2', vendorCompanyId: voltaris.id, active: true },
  });
  const vendorPetra = await prisma.vendorUser.create({
    data: { name: 'Petra Novak', role: 'S2', vendorCompanyId: voltaris.id, active: true },
  });
  const vendorIvan = await prisma.vendorUser.create({
    data: { name: 'Ivan Babić', role: 'S3', vendorCompanyId: voltaris.id, active: true },
  });
  const vendorLuka = await prisma.vendorUser.create({
    data: { name: 'Luka Marić', role: 'S1', vendorCompanyId: thermacore.id, active: true },
  });
  const vendorMaja = await prisma.vendorUser.create({
    data: { name: 'Maja Tomić', role: 'S2', vendorCompanyId: thermacore.id, active: true },
  });
  const vendorJosip = await prisma.vendorUser.create({
    data: { name: 'Josip Jurić', role: 'S3', vendorCompanyId: thermacore.id, active: true },
  });

  console.log('Creating vendor price list (Voltaris Electrical Solutions)...');

  const priceListData = [
    // Cables & Wiring
    { category: 'Cables & Wiring', description: 'NYM-J 3x1.5 mm² (Lighting circuits)', unit: 'meter', pricePerUnit: 1 },
    { category: 'Cables & Wiring', description: 'NYM-J 3x2.5 mm² (Socket circuits)', unit: 'meter', pricePerUnit: 2 },
    { category: 'Cables & Wiring', description: 'NYM-J 5x6 mm² (3-phase supply)', unit: 'meter', pricePerUnit: 3.5 },
    { category: 'Cables & Wiring', description: 'H07V-K 6 mm² (Flexible conductor)', unit: 'meter', pricePerUnit: 4 },
    { category: 'Cables & Wiring', description: 'Halogen-free cable 3x2.5 (Mall compliant)', unit: 'meter', pricePerUnit: 5 },
    // Distribution & Protection
    { category: 'Distribution & Protection', description: 'Distribution board 24M (Flush mounted)', unit: 'piece', pricePerUnit: 145 },
    { category: 'Distribution & Protection', description: 'Distribution board 36M (Surface mounted)', unit: 'piece', pricePerUnit: 185 },
    { category: 'Distribution & Protection', description: 'MCB 16A C-curve (1P)', unit: 'piece', pricePerUnit: 12 },
    { category: 'Distribution & Protection', description: 'MCB 3P 32A (3-phase)', unit: 'piece', pricePerUnit: 38 },
    { category: 'Distribution & Protection', description: 'RCD 40A 30mA (Type A)', unit: 'piece', pricePerUnit: 65 },
    { category: 'Distribution & Protection', description: 'SPD Type 2 (3P+N)', unit: 'piece', pricePerUnit: 120 },
    // Lighting - Retail Grade
    { category: 'Lighting - Retail Grade', description: 'LED Panel 60x60 (36W 4000K)', unit: 'piece', pricePerUnit: 32 },
    { category: 'Lighting - Retail Grade', description: 'LED Linear Light (150cm 50W)', unit: 'piece', pricePerUnit: 48 },
    { category: 'Lighting - Retail Grade', description: 'LED Track Light (30W adjustable)', unit: 'piece', pricePerUnit: 55 },
    { category: 'Lighting - Retail Grade', description: 'Emergency Exit Light (3h autonomy)', unit: 'piece', pricePerUnit: 42 },
    { category: 'Lighting - Retail Grade', description: 'Emergency Module Kit (Retrofit)', unit: 'piece', pricePerUnit: 28 },
    // Installation Accessories
    { category: 'Installation Accessories', description: 'PVC Conduit Ø25 (Rigid)', unit: 'meter', pricePerUnit: 1 },
    { category: 'Installation Accessories', description: 'Flexible Conduit Ø20 (Corrugated)', unit: 'meter', pricePerUnit: 1 },
    { category: 'Installation Accessories', description: 'Cable Tray 100mm (Perforated)', unit: 'meter', pricePerUnit: 14 },
    { category: 'Installation Accessories', description: 'Junction Box 100x100 (IP54)', unit: 'piece', pricePerUnit: 6 },
    { category: 'Installation Accessories', description: 'Socket outlet (Modular white)', unit: 'piece', pricePerUnit: 7 },
    { category: 'Installation Accessories', description: 'Light switch (Modular white)', unit: 'piece', pricePerUnit: 6 },
    // Power & Special Equipment
    { category: 'Power & Special Equipment', description: 'Industrial socket 32A (5P 400V)', unit: 'piece', pricePerUnit: 28 },
    { category: 'Power & Special Equipment', description: 'Industrial plug 32A (5P 400V)', unit: 'piece', pricePerUnit: 22 },
    { category: 'Power & Special Equipment', description: 'EV Charger 22kW (Wallbox)', unit: 'piece', pricePerUnit: 890 },
    { category: 'Power & Special Equipment', description: 'Data cabinet 12U (Wall mounted)', unit: 'piece', pricePerUnit: 165 },
    { category: 'Power & Special Equipment', description: 'CAT6 cable (305m box)', unit: 'box', pricePerUnit: 95 },
  ];

  const priceListItems: { id: number }[] = [];
  for (const row of priceListData) {
    const item = await prisma.vendorPriceListItem.create({
      data: {
        vendorId: voltaris.id,
        category: row.category,
        description: row.description,
        unit: row.unit,
        pricePerUnit: row.pricePerUnit,
        active: true,
      },
    });
    priceListItems.push(item);
  }

  // Voltaris billing rules: not selectable in UI; applied automatically per intervention
  await prisma.vendorPriceListItem.create({
    data: {
      vendorId: voltaris.id,
      category: 'Fixed Fees',
      description: 'Arrival to location',
      unit: 'arrival',
      pricePerUnit: 50,
      active: true,
      selectableInUI: false,
      unitMinutes: null,
    },
  });
  await prisma.vendorPriceListItem.create({
    data: {
      vendorId: voltaris.id,
      category: 'Labor',
      description: 'Service time (15 min units)',
      unit: '15 min',
      pricePerUnit: 10,
      active: true,
      selectableInUI: false,
      unitMinutes: 15,
    },
  });

  console.log('Creating vendor price list (ThermaCore HVAC Services)...');
  const thermacorePriceListData = [
    { category: 'Air Conditioning Units', description: 'Split AC Set (3.5 kW inverter indoor + outdoor)', unit: 'set', pricePerUnit: 780 },
    { category: 'Air Conditioning Units', description: 'Split AC Set (5.0 kW inverter)', unit: 'set', pricePerUnit: 980 },
    { category: 'Air Conditioning Units', description: 'Cassette AC Unit (5.3 kW commercial ceiling type)', unit: 'set', pricePerUnit: 1450 },
    { category: 'Air Conditioning Units', description: 'VRF Indoor Unit (Wall mounted)', unit: 'unit', pricePerUnit: 620 },
    { category: 'Air Conditioning Units', description: 'VRF Outdoor Unit (20 kW system)', unit: 'unit', pricePerUnit: 4800 },
    { category: 'Ventilation Equipment', description: 'Inline Duct Fan (250 mm)', unit: 'piece', pricePerUnit: 190 },
    { category: 'Ventilation Equipment', description: 'Roof Ventilator (Commercial type)', unit: 'piece', pricePerUnit: 420 },
    { category: 'Ventilation Equipment', description: 'Heat Recovery Unit HRV (800 m³/h)', unit: 'unit', pricePerUnit: 1350 },
    { category: 'Ventilation Equipment', description: 'Air Handling Unit AHU (5,000 m³/h)', unit: 'unit', pricePerUnit: 6800 },
    { category: 'Ducting & Distribution', description: 'Spiral Duct Ø200 (Galvanized)', unit: 'meter', pricePerUnit: 18 },
    { category: 'Ducting & Distribution', description: 'Rectangular Duct (500x300 mm)', unit: 'meter', pricePerUnit: 32 },
    { category: 'Ducting & Distribution', description: 'Flexible Insulated Duct (Ø160)', unit: 'meter', pricePerUnit: 9 },
    { category: 'Ducting & Distribution', description: 'Air Diffuser (4-way ceiling)', unit: 'piece', pricePerUnit: 38 },
    { category: 'Ducting & Distribution', description: 'Linear Slot Diffuser (1 meter)', unit: 'piece', pricePerUnit: 85 },
    { category: 'Refrigeration Components', description: 'Copper Pipe 1/4" (Refrigerant line)', unit: 'meter', pricePerUnit: 6 },
    { category: 'Refrigeration Components', description: 'Copper Pipe 3/8" (Refrigerant line)', unit: 'meter', pricePerUnit: 9 },
    { category: 'Refrigeration Components', description: 'Insulation Tube (For copper pipes)', unit: 'meter', pricePerUnit: 3 },
    { category: 'Refrigeration Components', description: 'Condensate Pump (Mini pump)', unit: 'piece', pricePerUnit: 95 },
    { category: 'Heating Equipment', description: 'Gas Boiler (35 kW commercial)', unit: 'unit', pricePerUnit: 2600 },
    { category: 'Heating Equipment', description: 'Electric Boiler (24 kW)', unit: 'unit', pricePerUnit: 950 },
    { category: 'Heating Equipment', description: 'Circulation Pump (High efficiency)', unit: 'piece', pricePerUnit: 220 },
    { category: 'Controls & Accessories', description: 'Wall Thermostat (Digital programmable)', unit: 'piece', pricePerUnit: 75 },
    { category: 'Controls & Accessories', description: 'Smart Thermostat (WiFi enabled)', unit: 'piece', pricePerUnit: 180 },
    { category: 'Controls & Accessories', description: 'Control Panel (For AHU systems)', unit: 'piece', pricePerUnit: 650 },
  ];
  for (const row of thermacorePriceListData) {
    await prisma.vendorPriceListItem.create({
      data: {
        vendorId: thermacore.id,
        category: row.category,
        description: row.description,
        unit: row.unit,
        pricePerUnit: row.pricePerUnit,
        active: true,
      },
    });
  }

  console.log('Creating demo assets (5 per store for first 4 stores)...');

  const assetNames = ['HVAC Unit 1', 'Refrigeration Unit 1', 'Elevator 1', 'Automatic Door 1', 'Electrical Panel 1'];
  const storesWithAssets = [store1North, store2North, store3North, store4North];
  const assetIdsByStore: Map<number, number[]> = new Map();
  for (const store of storesWithAssets) {
    const ids: number[] = [];
    for (let i = 0; i < assetNames.length; i++) {
      const a = await prisma.asset.create({
        data: {
          storeId: store.id,
          description: assetNames[i],
          category: i === 0 ? 'HVAC' : i === 1 ? 'Refrigeration' : i === 2 ? 'Elevators' : i === 3 ? 'Doors' : 'Electrical',
          active: true,
        },
      });
      ids.push(a.id);
    }
    assetIdsByStore.set(store.id, ids);
  }

  const store1AssetIds = assetIdsByStore.get(store1North.id)!;
  const hvacStore1 = store1AssetIds[0];
  const refrigStore1 = store1AssetIds[1];

  console.log('Creating 11 demo tickets with scenarios...');

  const now = new Date();
  const baseCreated = daysAgo(5);

  // 1. Urgent ticket – submitted, awaiting vendor (urgent path)
  const t1 = await prisma.ticket.create({
    data: {
      companyId: retailA.id,
      storeId: store1North.id,
      createdByUserId: sm1.id,
      category: 'HEATING_VENTILATION_AIR_CONDITIONING',
      description: 'Urgent: HVAC failure in sales area, no cooling.',
      urgent: true,
      currentStatus: 'SUBMITTED',
      currentOwnerUserId: ammNorth.id,
      assetId: hvacStore1,
      archived: false,
      createdAt: baseCreated,
      updatedAt: now,
    },
  });
  await prisma.auditLog.create({
    data: {
      entityType: 'TICKET',
      entityId: t1.id,
      ticketId: t1.id,
      prevStatus: null,
      newStatus: 'Ticket Submitted',
      actionType: 'SUBMIT',
      actorType: 'INTERNAL',
      actorId: sm1.id,
      createdAt: baseCreated,
    },
  });

  // 2. Non-urgent, low threshold (≤1000 EUR) – cost estimation approved
  const t2 = await prisma.ticket.create({
    data: {
      companyId: retailA.id,
      storeId: store1North.id,
      createdByUserId: sm1.id,
      category: 'ELECTRICAL_INSTALLATIONS',
      description: 'Lighting replacement in back office, non-urgent.',
      urgent: false,
      currentStatus: 'COST_ESTIMATION_APPROVED',
      currentOwnerUserId: ammNorth.id,
      assetId: store1AssetIds[4],
      archived: false,
      createdAt: daysAgo(6),
      updatedAt: now,
    },
  });
  await prisma.costEstimation.create({
    data: {
      ticketId: t2.id,
      estimatedAmount: 850,
      createdByUserId: ammNorth.id,
      createdAt: daysAgo(4),
    },
  });
  await prisma.approvalRecord.create({
    data: {
      ticketId: t2.id,
      approverUserId: amNorth.id,
      role: 'AMM',
      decision: 'APPROVED',
      comment: 'Within threshold',
      createdAt: daysAgo(3),
    },
  });
  await prisma.auditLog.create({
    data: {
      entityType: 'TICKET',
      entityId: t2.id,
      ticketId: t2.id,
      prevStatus: 'Cost Estimation Approval Needed',
      newStatus: 'Ticket Cost Estimation Approved',
      actionType: 'APPROVE_COST',
      actorType: 'INTERNAL',
      actorId: ammNorth.id,
      createdAt: daysAgo(3),
    },
  });

  // 3. Non-urgent, mid threshold (1000–3000 EUR) – needs director approval
  const t3 = await prisma.ticket.create({
    data: {
      companyId: retailA.id,
      storeId: store2North.id,
      createdByUserId: sm2.id,
      category: 'REFRIGERATION',
      description: 'Refrigeration unit overhaul, estimated 1500 EUR.',
      urgent: false,
      currentStatus: 'COST_ESTIMATION_APPROVAL_NEEDED',
      currentOwnerUserId: maintDir.id,
      assetId: refrigStore1,
      archived: false,
      createdAt: daysAgo(4),
      updatedAt: now,
    },
  });
  await prisma.costEstimation.create({
    data: {
      ticketId: t3.id,
      estimatedAmount: 1500,
      createdByUserId: ammNorth.id,
      createdAt: daysAgo(3),
    },
  });
  await prisma.auditLog.create({
    data: {
      entityType: 'TICKET',
      entityId: t3.id,
      ticketId: t3.id,
      prevStatus: 'Cost Estimation Needed',
      newStatus: 'Cost Estimation Approval Needed',
      actionType: 'SUBMIT_COST_ESTIMATION',
      actorType: 'INTERNAL',
      actorId: ammNorth.id,
      createdAt: daysAgo(3),
    },
  });

  // 4. Non-urgent, high threshold (>3000 EUR)
  const t4 = await prisma.ticket.create({
    data: {
      companyId: retailA.id,
      storeId: store3North.id,
      createdByUserId: sm3.id,
      category: 'ELEVATORS',
      description: 'Elevator modernization, budget >3000 EUR.',
      urgent: false,
      currentStatus: 'COST_ESTIMATION_NEEDED',
      currentOwnerUserId: ammNorth.id,
      assetId: store1AssetIds[2],
      archived: false,
      createdAt: daysAgo(5),
      updatedAt: now,
    },
  });
  await prisma.auditLog.create({
    data: {
      entityType: 'TICKET',
      entityId: t4.id,
      ticketId: t4.id,
      prevStatus: 'Draft',
      newStatus: 'Ticket Submitted',
      actionType: 'SUBMIT',
      actorType: 'INTERNAL',
      actorId: sm3.id,
      createdAt: daysAgo(4),
    },
  });

  // 5. Clarification request flow – awaiting creator response
  const t5 = await prisma.ticket.create({
    data: {
      companyId: retailA.id,
      storeId: store4North.id,
      createdByUserId: sm4.id,
      category: 'AUTOMATIC_DOORS',
      description: 'Door sensor intermittent fault – need more details from store.',
      urgent: false,
      currentStatus: 'AWAITING_CREATOR_RESPONSE',
      currentOwnerUserId: sm4.id,
      assetId: store1AssetIds[3],
      archived: false,
      createdAt: daysAgo(4),
      updatedAt: now,
    },
  });
  await prisma.ticketComment.create({
    data: {
      ticketId: t5.id,
      authorUserId: ammNorth.id,
      text: 'Please specify exact location and frequency of fault.',
      internalFlag: true,
      createdAt: daysAgo(3),
    },
  });
  await prisma.auditLog.create({
    data: {
      entityType: 'TICKET',
      entityId: t5.id,
      ticketId: t5.id,
      prevStatus: 'Ticket Submitted',
      newStatus: 'Awaiting Ticket Creator Response',
      actionType: 'REQUEST_CLARIFICATION',
      actorType: 'INTERNAL',
      actorId: ammNorth.id,
      createdAt: daysAgo(3),
    },
  });

  // 6. Draft ticket
  const t6 = await prisma.ticket.create({
    data: {
      companyId: retailA.id,
      storeId: store5South.id,
      createdByUserId: sm5.id,
      category: 'HYGIENE',
      description: 'Deep clean request – draft.',
      urgent: false,
      currentStatus: 'DRAFT',
      currentOwnerUserId: sm5.id,
      archived: false,
      createdAt: daysAgo(2),
      updatedAt: now,
    },
  });

  // 7. Updated submitted (after clarification)
  const t7 = await prisma.ticket.create({
    data: {
      companyId: retailA.id,
      storeId: store6South.id,
      createdByUserId: sm6.id,
      category: 'WATER_AND_SEWAGE',
      description: 'Minor leak in staff WC – details added after clarification.',
      urgent: false,
      currentStatus: 'UPDATED_SUBMITTED',
      currentOwnerUserId: ammSouth.id,
      archived: false,
      createdAt: daysAgo(5),
      updatedAt: now,
    },
  });
  await prisma.auditLog.create({
    data: {
      entityType: 'TICKET',
      entityId: t7.id,
      ticketId: t7.id,
      prevStatus: 'Awaiting Ticket Creator Response',
      newStatus: 'Updated Ticket Submitted',
      actionType: 'RESUBMIT',
      actorType: 'INTERNAL',
      actorId: sm6.id,
      createdAt: daysAgo(3),
    },
  });

  // 8. Rejected ticket
  const t8 = await prisma.ticket.create({
    data: {
      companyId: retailA.id,
      storeId: store7South.id,
      createdByUserId: sm7.id,
      category: 'OTHER',
      description: 'Request rejected – out of scope.',
      urgent: false,
      currentStatus: 'REJECTED',
      currentOwnerUserId: null,
      archived: false,
      createdAt: daysAgo(7),
      updatedAt: now,
    },
  });
  await prisma.approvalRecord.create({
    data: {
      ticketId: t8.id,
      approverUserId: ammSouth.id,
      role: 'AMM',
      decision: 'REJECTED',
      comment: 'Out of scope',
      createdAt: daysAgo(6),
    },
  });
  await prisma.auditLog.create({
    data: {
      entityType: 'TICKET',
      entityId: t8.id,
      ticketId: t8.id,
      prevStatus: 'Ticket Submitted',
      newStatus: 'Ticket Rejected',
      actionType: 'REJECT',
      actorType: 'INTERNAL',
      actorId: ammSouth.id,
      createdAt: daysAgo(6),
    },
  });

  // 9. Withdrawn ticket
  const t9 = await prisma.ticket.create({
    data: {
      companyId: retailA.id,
      storeId: store8South.id,
      createdByUserId: sm8.id,
      category: 'FIRE_PROTECTION_SYSTEM',
      description: 'Withdrawn – resolved internally.',
      urgent: false,
      currentStatus: 'WITHDRAWN',
      currentOwnerUserId: null,
      archived: false,
      createdAt: daysAgo(4),
      updatedAt: now,
    },
  });
  await prisma.auditLog.create({
    data: {
      entityType: 'TICKET',
      entityId: t9.id,
      ticketId: t9.id,
      prevStatus: 'Draft',
      newStatus: 'Ticket Withdrawn',
      actionType: 'WITHDRAW',
      actorType: 'INTERNAL',
      actorId: sm8.id,
      createdAt: daysAgo(3),
    },
  });

  // 10. Archived ticket (work completed)
  const t10 = await prisma.ticket.create({
    data: {
      companyId: retailA.id,
      storeId: store1North.id,
      createdByUserId: sm1.id,
      category: 'KITCHEN_EQUIPMENT',
      description: 'Kitchen exhaust repair – completed and archived.',
      urgent: false,
      currentStatus: 'ARCHIVED',
      currentOwnerUserId: null,
      archived: true,
      createdAt: daysAgo(7),
      updatedAt: now,
    },
  });
  await prisma.auditLog.create({
    data: {
      entityType: 'TICKET',
      entityId: t10.id,
      ticketId: t10.id,
      prevStatus: 'Ticket Cost Estimation Approved',
      newStatus: 'Ticket Archived',
      actionType: 'ARCHIVE',
      actorType: 'INTERNAL',
      actorId: ammNorth.id,
      createdAt: daysAgo(1),
    },
  });

  // 11. Ticket with work order – vendor execution (CREATED → ACCEPTED)
  const t11 = await prisma.ticket.create({
    data: {
      companyId: retailA.id,
      storeId: store2North.id,
      createdByUserId: sm2.id,
      category: 'ELECTRICAL_INSTALLATIONS',
      description: 'Electrical panel upgrade – WO created and accepted by vendor.',
      urgent: true,
      currentStatus: 'SUBMITTED',
      currentOwnerUserId: ammNorth.id,
      assetId: store1AssetIds[4],
      archived: false,
      createdAt: daysAgo(3),
      updatedAt: now,
    },
  });

  const wo1 = await prisma.workOrder.create({
    data: {
      ticketId: t11.id,
      vendorCompanyId: voltaris.id,
      assignedTechnicianId: vendorMarko.id,
      assetId: store1AssetIds[4],
      currentStatus: 'ACCEPTED_TECHNICIAN_ASSIGNED',
      currentOwnerType: 'VENDOR',
      currentOwnerId: vendorAna.id,
      declaredTechCount: 1,
      archived: false,
      createdAt: daysAgo(2),
      updatedAt: now,
    },
  });
  await prisma.auditLog.create({
    data: {
      entityType: 'WORK_ORDER',
      entityId: wo1.id,
      workOrderId: wo1.id,
      prevStatus: 'Awaiting Service Provider',
      newStatus: 'Service Visit Scheduled',
      actionType: 'ACCEPT_WO',
      actorType: 'VENDOR',
      actorId: vendorAna.id,
      createdAt: daysAgo(2),
    },
  });

  console.log('Seed completed successfully.');
  console.log('Summary:');
  console.log('  Companies: 1 (Retail A only)');
  console.log('  Regions: 2');
  console.log('  Stores: 8');
  console.log('  Internal users: 15');
  console.log('  Vendor companies:', 2);
  console.log('  Vendor users:', 7);
  console.log('  Price list items:', priceListData.length);
  console.log('  Assets:', storesWithAssets.length * assetNames.length);
  console.log('  Tickets:', 11);
  console.log('  Work orders:', 1);
  console.log('  Cost estimations:', 2);
  console.log('  Approval records:', 2);
  console.log('  Audit log entries: multiple');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
