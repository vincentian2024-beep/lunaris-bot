import { readFileSync } from "node:fs";
import { z } from "zod";
import { config } from "./config.js";
import type { Catalog } from "./types.js";

const deliverySchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("minecraft_command"), command: z.string().min(1) }),
  z.object({ type: z.literal("discord_role"), roleId: z.string().min(1) })
]);

const catalogSchema = z.object({
  categories: z.array(z.object({
    id: z.string().regex(/^[a-z0-9-]+$/),
    name: z.string().min(1).max(50),
    emoji: z.string().optional(),
    description: z.string().max(100)
  })),
  products: z.array(z.object({
    id: z.string().regex(/^[a-z0-9-]+$/),
    categoryId: z.string(),
    name: z.string().min(1).max(80),
    description: z.string().max(500),
    priceCentavos: z.number().int().positive(),
    enabled: z.boolean(),
    deliveries: z.array(deliverySchema).min(1)
  }))
});

export function loadCatalog(): Catalog {
  const parsed = catalogSchema.parse(
    JSON.parse(readFileSync(config.CATALOG_PATH, "utf8"))
  );
  const categoryIds = new Set(parsed.categories.map((category) => category.id));
  const ids = new Set<string>();

  for (const product of parsed.products) {
    if (!categoryIds.has(product.categoryId)) {
      throw new Error(`Product ${product.id} references missing category ${product.categoryId}`);
    }
    if (ids.has(product.id)) throw new Error(`Duplicate product ID: ${product.id}`);
    ids.add(product.id);
  }

  return parsed;
}
