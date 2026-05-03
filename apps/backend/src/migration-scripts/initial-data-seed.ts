import { MedusaContainer } from "@medusajs/framework";
import {
  ContainerRegistrationKeys,
  ModuleRegistrationName,
  Modules,
  ProductStatus,
} from "@medusajs/framework/utils";
import {
  createApiKeysWorkflow,
  createInventoryLevelsWorkflow,
  createProductCategoriesWorkflow,
  createProductsWorkflow,
  createRegionsWorkflow,
  createSalesChannelsWorkflow,
  createShippingOptionsWorkflow,
  createStockLocationsWorkflow,
  createStoresWorkflow,
  createTaxRegionsWorkflow,
  linkSalesChannelsToApiKeyWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
} from "@medusajs/medusa/core-flows";

const COUNTRY_ID = "id";

/** Nama stabil agar seed idempotent (hindari duplikat channel/key tiap `docker up`). */
const METRO_SEED_SALES_CHANNEL_NAME = "Metro Apparel Store";
const METRO_WORKSHOP_LOCATION_NAME = "Metro Workshop";
const METRO_FULFILLMENT_SET_NAME = "Metro delivery";
const METRO_STORE_NAME = "Metro Apparel";

function errorMessage(e: unknown): string {
  if (e instanceof Error) return e.message;
  if (typeof e === "object" && e !== null && "message" in e) {
    return String((e as { message: unknown }).message);
  }
  try {
    return JSON.stringify(e);
  } catch {
    return String(e);
  }
}

/**
 * Metro catalog seed — tier **names** (opsi Medusa `Paket`) harus sama persis dengan
 * label paket di `apps/storefront/lib/data/catalog.ts` agar configurator & varian toko selaras.
 * Kerah, oversize, dan add-on tetap dihitung di storefront (pricelist workshop), bukan di varian Medusa.
 */
/** Mirrors storefront `lib/data/catalog.ts` tier ids, names, and base prices (IDR). */
const METRO_CATEGORIES = [
  { name: "Jersey Atasan", handle: "jersey-atasan" },
  { name: "Jersey Satu Set", handle: "jersey-satu-set" },
  { name: "Training Pants", handle: "training-pants" },
  { name: "Jaket", handle: "jaket" },
  { name: "Short Pants", handle: "short-pants" },
  { name: "Polo", handle: "polo" },
] as const;

type MetroKind =
  | "jersey-top"
  | "jersey-set"
  | "training-pants"
  | "jacket"
  | "short-pants"
  | "polo";

type TierRow = { id: string; name: string; price: number };

type MetroProductSeed = {
  handle: string;
  title: string;
  categoryHandle: (typeof METRO_CATEGORIES)[number]["handle"];
  description: string;
  metro_kind: MetroKind;
  imageUrls: string[];
  tiers: TierRow[];
};

const SIZE_VALUES = ["S", "M", "L", "XL", "XXL", "XXXL"] as const;

const METRO_PRODUCTS: MetroProductSeed[] = [
  {
    handle: "jersey-atasan",
    title: "Jersey Atasan",
    categoryHandle: "jersey-atasan",
    metro_kind: "jersey-top",
    description:
      "Produk utama: jersey bagian atas dengan tiga paket — Essential, Elite, dan Prime. Pilih kerah, ukuran, oversize, dan add-on; ringkasan bisa langsung dikirim ke WhatsApp.",
    imageUrls: [
      "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=900&q=80",
    ],
    tiers: [
      { id: "essential", name: "Essential", price: 60_000 },
      { id: "elite", name: "Elite", price: 90_000 },
      { id: "prime", name: "Prime", price: 110_000 },
    ],
  },
  {
    handle: "jersey-satu-set",
    title: "Jersey Satu Set",
    categoryHandle: "jersey-satu-set",
    metro_kind: "jersey-set",
    description:
      "Set lengkap atasan + celana: Regular (Basic), Standard (paling populer), Premium, dan Ultimate. Cocok untuk match day, liga, dan tim esports.",
    imageUrls: [
      "https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=900&q=80",
    ],
    tiers: [
      { id: "regular", name: "Regular (Basic)", price: 95_000 },
      { id: "standard", name: "Standard", price: 125_000 },
      { id: "premium", name: "Premium (Advanced)", price: 135_000 },
      {
        id: "ultimate",
        name: "Ultimate (Professional)",
        price: 170_000,
      },
    ],
  },
  {
    handle: "training-pants",
    title: "Training Pants",
    categoryHandle: "training-pants",
    metro_kind: "training-pants",
    description:
      "Celana training bahan Lotto: opsi full printing atau non printing. Pilih ukuran & add-on di bawah.",
    imageUrls: [
      "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=900&q=80",
    ],
    tiers: [
      { id: "tp-full", name: "Full printing", price: 95_000 },
      { id: "tp-non", name: "Non printing", price: 75_000 },
    ],
  },
  {
    handle: "jaket",
    title: "Jaket",
    categoryHandle: "jaket",
    metro_kind: "jacket",
    description:
      "Jaket bahan Lotto: varian printing atau non printing + bordir. Pilih paket, ukuran, dan opsi tambahan.",
    imageUrls: [
      "https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=900&q=80",
    ],
    tiers: [
      { id: "jk-print", name: "Printing", price: 175_000 },
      { id: "jk-non", name: "Non printing + bordir", price: 130_000 },
    ],
  },
  {
    handle: "short-pants",
    title: "Short Pants",
    categoryHandle: "short-pants",
    metro_kind: "short-pants",
    description: "Celana pendek Lotto: full printing atau print samping.",
    imageUrls: [
      "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=900&q=80",
    ],
    tiers: [
      { id: "sp-full", name: "Full printing", price: 60_000 },
      { id: "sp-side", name: "Print samping", price: 50_000 },
    ],
  },
  {
    handle: "polo",
    title: "Polo",
    categoryHandle: "polo",
    metro_kind: "polo",
    description:
      "Polo bordir material CVC 24S — untuk corporate, sekolah, dan komunitas.",
    imageUrls: [
      "https://images.unsplash.com/photo-1622445275571-3f7462c0068c?w=900&q=80",
    ],
    tiers: [{ id: "polo-bordir", name: "Polo bordir", price: 90_000 }],
  },
];

function buildVariants(product: MetroProductSeed): {
  title: string;
  sku: string;
  options: Record<string, string>;
  prices: { amount: number; currency_code: string }[];
}[] {
  return product.tiers.flatMap((tier) =>
    SIZE_VALUES.map((size) => ({
      title: `${tier.name} / ${size}`,
      sku: `${product.handle}-${tier.id}-${size}`.toUpperCase(),
      options: {
        Paket: tier.name,
        Ukuran: size,
      },
      prices: [{ amount: tier.price, currency_code: "idr" }],
    }))
  );
}

type RegionQueryRow = {
  id: string;
  countries?: { iso_2?: string | null }[] | null;
};

/** Negara hanya boleh satu region; seed bisa dijalankan ulang tanpa error duplikat. */
async function findRegionWithCountry(
  query: {
    graph: (args: {
      entity: string;
      fields: string[];
    }) => Promise<{ data?: RegionQueryRow[] | null }>;
  },
  iso2: string
): Promise<{ id: string } | null> {
  const { data: regions } = await query.graph({
    entity: "region",
    fields: ["id", "countries.iso_2"],
  });
  if (!regions?.length) return null;
  const want = iso2.toLowerCase();
  for (const r of regions) {
    const hit = r.countries?.some(
      (c) => c?.iso_2 && c.iso_2.toLowerCase() === want
    );
    if (hit) return { id: r.id };
  }
  return null;
}

type SalesChannelRow = { id: string; name?: string; description?: string | null };
type ApiKeyRow = { id: string; type?: string; title?: string };
type StockLocationRow = { id: string; name?: string };
type FulfillmentSetRow = {
  id: string;
  name?: string;
  service_zones?: { id: string; name?: string }[] | null;
};

export default async function initial_data_seed({
  container,
}: {
  container: MedusaContainer;
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const link = container.resolve(ContainerRegistrationKeys.LINK);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const fulfillmentModuleService = container.resolve(
    ModuleRegistrationName.FULFILLMENT
  );

  logger.info("Seeding Metro Apparel store data...");

  const { data: existingChannels } = await query.graph({
    entity: "sales_channel",
    fields: ["id", "name", "description"],
  });
  const channelRows = (existingChannels ?? []) as SalesChannelRow[];
  let defaultSalesChannel =
    channelRows.find((c) => c.name === METRO_SEED_SALES_CHANNEL_NAME) ??
    channelRows.find((c) => c.description === "Metro Apparel") ??
    null;

  if (!defaultSalesChannel) {
    const {
      result: [created],
    } = await createSalesChannelsWorkflow(container).run({
      input: {
        salesChannelsData: [
          {
            name: METRO_SEED_SALES_CHANNEL_NAME,
            description: "Metro Apparel",
          },
        ],
      },
    });
    defaultSalesChannel = created as SalesChannelRow;
    logger.info(`Sales channel dibuat: ${defaultSalesChannel.id}`);
  } else {
    logger.info(
      `Sales channel dipakai ulang: ${defaultSalesChannel.id} (${defaultSalesChannel.name})`
    );
  }

  const { data: existingKeys } = await query.graph({
    entity: "api_key",
    fields: ["id", "type", "title"],
  });
  const keyRows = (existingKeys ?? []) as ApiKeyRow[];
  let publishableApiKey = keyRows.find((k) => k.type === "publishable") ?? null;

  if (!publishableApiKey) {
    const {
      result: [createdKey],
    } = await createApiKeysWorkflow(container).run({
      input: {
        api_keys: [
          {
            title: "Default Publishable API Key",
            type: "publishable",
            created_by: "",
          },
        ],
      },
    });
    publishableApiKey = createdKey as ApiKeyRow;
    logger.info(`Publishable API key dibuat: ${publishableApiKey.id}`);
  } else {
    logger.info(
      `Publishable API key dipakai ulang: ${publishableApiKey.id} (${publishableApiKey.title})`
    );
  }

  try {
    await linkSalesChannelsToApiKeyWorkflow(container).run({
      input: {
        id: publishableApiKey.id,
        add: [defaultSalesChannel.id],
      },
    });
  } catch (e) {
    logger.warn(
      `linkSalesChannelsToApiKeyWorkflow: ${errorMessage(e)} (biasanya sudah terhubung)`
    );
  }

  const { data: existingStores } = await query.graph({
    entity: "store",
    fields: ["id", "name"],
  });
  const hasMetroStore = (existingStores ?? []).some(
    (s: { name?: string }) => s.name === METRO_STORE_NAME
  );

  if (!hasMetroStore) {
    await createStoresWorkflow(container).run({
      input: {
        stores: [
          {
            name: METRO_STORE_NAME,
            supported_currencies: [
              {
                currency_code: "idr",
                is_default: true,
              },
            ],
            default_sales_channel_id: defaultSalesChannel.id,
          },
        ],
      },
    });
    logger.info(`Store "${METRO_STORE_NAME}" dibuat.`);
  } else {
    logger.info(`Store "${METRO_STORE_NAME}" sudah ada; melewati createStoresWorkflow.`);
  }

  logger.info("Seeding region (Indonesia / IDR)...");
  let region = await findRegionWithCountry(query, COUNTRY_ID);
  if (region) {
    logger.info(
      `Region untuk negara "${COUNTRY_ID}" sudah ada (${region.id}); melewati createRegionsWorkflow.`
    );
  } else {
    const { result: regionResult } = await createRegionsWorkflow(container).run({
      input: {
        regions: [
          {
            name: "Indonesia",
            currency_code: "idr",
            countries: [COUNTRY_ID],
            payment_providers: ["pp_system_default"],
          },
        ],
      },
    });
    region = regionResult[0];
  }

  try {
    await createTaxRegionsWorkflow(container).run({
      input: [
        {
          country_code: COUNTRY_ID,
          provider_id: "tp_system",
        },
      ],
    });
  } catch (e) {
    logger.warn(
      `createTaxRegionsWorkflow dilewati atau gagal (biasanya tax region sudah ada): ${errorMessage(e)}`
    );
  }

  logger.info("Seeding stock location...");
  const { data: existingStockLocs } = await query.graph({
    entity: "stock_location",
    fields: ["id", "name"],
  });
  const locRows = (existingStockLocs ?? []) as StockLocationRow[];
  let stockLocationRow = locRows.find((l) => l.name === METRO_WORKSHOP_LOCATION_NAME);

  if (!stockLocationRow) {
    const { result: stockLocationResult } = await createStockLocationsWorkflow(
      container
    ).run({
      input: {
        locations: [
          {
            name: METRO_WORKSHOP_LOCATION_NAME,
            address: {
              city: "Tangerang Selatan",
              country_code: "ID",
              address_1: "Jl. Industri Raya No. 88",
            },
          },
        ],
      },
    });
    stockLocationRow = stockLocationResult[0] as StockLocationRow;
    logger.info(`Lokasi stok dibuat: ${stockLocationRow.id}`);
  } else {
    logger.info(`Lokasi stok dipakai ulang: ${stockLocationRow.id}`);
  }

  const stockLocation = { id: stockLocationRow.id };

  try {
    await link.create({
      [Modules.STOCK_LOCATION]: {
        stock_location_id: stockLocation.id,
      },
      [Modules.FULFILLMENT]: {
        fulfillment_provider_id: "manual_manual",
      },
    });
  } catch (e) {
    logger.warn(
      `Link stock_location ↔ fulfillment provider: ${errorMessage(e)} (biasanya sudah ada)`
    );
  }

  const { data: shippingProfileResult } = await query.graph({
    entity: "shipping_profile",
    fields: ["id"],
  });
  const shippingProfile = shippingProfileResult[0];

  const { data: existingFulfillmentSets } = await query.graph({
    entity: "fulfillment_set",
    fields: ["id", "name", "service_zones.id", "service_zones.name"],
  });
  const fsRows = (existingFulfillmentSets ?? []) as FulfillmentSetRow[];
  let fulfillmentSet = fsRows.find((f) => f.name === METRO_FULFILLMENT_SET_NAME);

  if (!fulfillmentSet) {
    const created = await fulfillmentModuleService.createFulfillmentSets({
      name: METRO_FULFILLMENT_SET_NAME,
      type: "shipping",
      service_zones: [
        {
          name: "Indonesia",
          geo_zones: [
            {
              country_code: COUNTRY_ID,
              type: "country",
            },
          ],
        },
      ],
    });
    fulfillmentSet = created as unknown as FulfillmentSetRow;
    logger.info(`Fulfillment set dibuat: ${fulfillmentSet.id}`);
  } else {
    logger.info(`Fulfillment set dipakai ulang: ${fulfillmentSet.id}`);
  }

  const serviceZoneId = fulfillmentSet.service_zones?.[0]?.id;
  if (!serviceZoneId) {
    throw new Error(
      `Fulfillment set "${METRO_FULFILLMENT_SET_NAME}" tidak punya service_zone; periksa data DB.`
    );
  }

  try {
    await link.create({
      [Modules.STOCK_LOCATION]: {
        stock_location_id: stockLocation.id,
      },
      [Modules.FULFILLMENT]: {
        fulfillment_set_id: fulfillmentSet.id,
      },
    });
  } catch (e) {
    logger.warn(
      `Link stock_location ↔ fulfillment_set: ${errorMessage(e)} (biasanya sudah ada)`
    );
  }

  try {
    await createShippingOptionsWorkflow(container).run({
      input: [
        {
          name: "Pengiriman reguler",
          price_type: "flat",
          provider_id: "manual_manual",
          service_zone_id: serviceZoneId,
          shipping_profile_id: shippingProfile.id,
          type: {
            label: "Reguler",
            description: "Kurir ke seluruh Indonesia.",
            code: "standard",
          },
          prices: [
            {
              currency_code: "idr",
              amount: 25_000,
            },
            {
              region_id: region.id,
              amount: 25_000,
            },
          ],
          rules: [
            {
              attribute: "enabled_in_store",
              value: "true",
              operator: "eq",
            },
            {
              attribute: "is_return",
              value: "false",
              operator: "eq",
            },
          ],
        },
      ],
    });
  } catch (e) {
    logger.warn(
      `createShippingOptionsWorkflow: ${errorMessage(e)} (biasanya opsi pengiriman sudah ada)`
    );
  }

  try {
    await linkSalesChannelsToStockLocationWorkflow(container).run({
      input: {
        id: stockLocation.id,
        add: [defaultSalesChannel.id],
      },
    });
  } catch (e) {
    logger.warn(
      `linkSalesChannelsToStockLocationWorkflow: ${errorMessage(e)} (biasanya sudah terhubung)`
    );
  }

  logger.info("Seeding product categories & Metro catalog...");

  type CatRow = { id: string; name?: string; handle?: string };
  const { data: existingCats } = await query.graph({
    entity: "product_category",
    fields: ["id", "handle", "name"],
  });

  const categoryByHandle = new Map<string, string>();
  for (const row of (existingCats ?? []) as CatRow[]) {
    const match = METRO_CATEGORIES.find(
      (mc) => mc.handle === row.handle || mc.name === row.name
    );
    if (match) categoryByHandle.set(match.handle, row.id);
  }

  const missingCategories = METRO_CATEGORIES.filter(
    (mc) => !categoryByHandle.has(mc.handle)
  );

  if (missingCategories.length > 0) {
    const { result: categoryResult } = await createProductCategoriesWorkflow(
      container
    ).run({
      input: {
        product_categories: missingCategories.map((c) => ({
          name: c.name,
          handle: c.handle,
          is_active: true,
        })),
      },
    });

    for (const c of categoryResult) {
      const row = c as CatRow;
      const match = METRO_CATEGORIES.find(
        (mc) => mc.handle === row.handle || mc.name === row.name
      );
      if (match) categoryByHandle.set(match.handle, row.id);
    }
  }

  const { data: existingProducts } = await query.graph({
    entity: "product",
    fields: ["handle"],
  });
  const existingHandles = new Set(
    (existingProducts ?? [])
      .map((p: { handle?: string }) => p.handle)
      .filter(Boolean)
  );

  const productsToSeed = METRO_PRODUCTS.filter((p) => !existingHandles.has(p.handle));

  if (productsToSeed.length === 0) {
    logger.info("Produk Metro sudah ada; melewati createProductsWorkflow.");
  } else {
    const productsInput = productsToSeed.map((p) => {
      const categoryId = categoryByHandle.get(p.categoryHandle);
      if (!categoryId) {
        throw new Error(`Missing category for handle ${p.categoryHandle}`);
      }

      const tierNames = p.tiers.map((t) => t.name);
      const variants = buildVariants(p);

      return {
        title: p.title,
        handle: p.handle,
        description: p.description,
        status: ProductStatus.PUBLISHED,
        weight: 400,
        shipping_profile_id: shippingProfile.id,
        category_ids: [categoryId],
        metadata: {
          metro_kind: p.metro_kind,
        },
        images: p.imageUrls.map((url) => ({ url })),
        options: [
          { title: "Paket", values: tierNames },
          { title: "Ukuran", values: [...SIZE_VALUES] },
        ],
        variants,
        sales_channels: [{ id: defaultSalesChannel.id }],
      };
    });

    await createProductsWorkflow(container).run({
      input: {
        products: productsInput,
      },
    });
  }

  logger.info("Seeding inventory levels...");

  const { data: inventoryItems } = await query.graph({
    entity: "inventory_item",
    fields: ["id"],
  });

  const { data: existingLevels } = await query.graph({
    entity: "inventory_level",
    fields: ["id", "inventory_item_id", "location_id"],
  });

  type InvLevelRow = {
    inventory_item_id?: string;
    location_id?: string;
  };
  const alreadyPaired = new Set(
    (existingLevels ?? [])
      .filter(
        (row: InvLevelRow) =>
          row.location_id === stockLocation.id && row.inventory_item_id
      )
      .map((row: InvLevelRow) => row.inventory_item_id as string)
  );

  const levelsToCreate = (inventoryItems ?? []).filter(
    (item: { id: string }) => !alreadyPaired.has(item.id)
  );

  if (levelsToCreate.length === 0) {
    logger.info(
      "Inventory level untuk lokasi Metro sudah lengkap; melewati createInventoryLevelsWorkflow."
    );
  } else {
    try {
      await createInventoryLevelsWorkflow(container).run({
        input: {
          inventory_levels: levelsToCreate.map((item: { id: string }) => ({
            location_id: stockLocation.id,
            stocked_quantity: 1_000_000,
            inventory_item_id: item.id,
          })),
        },
      });
    } catch (e) {
      logger.warn(
        `createInventoryLevelsWorkflow: ${errorMessage(e)} (race atau duplikat parsial)`
      );
    }
  }

  logger.info(
    `Metro seed complete. Publishable key id: ${publishableApiKey.id} (link in Admin API keys).`
  );
}
