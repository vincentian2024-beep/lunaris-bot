import "dotenv/config";
import { z } from "zod";

const schema = z.object({
  DISCORD_TOKEN: z.string().min(1),
  DISCORD_CLIENT_ID: z.string().min(1),
  DISCORD_GUILD_ID: z.string().min(1),
  ADMIN_ROLE_ID: z.string().min(1),
  AUDIT_CHANNEL_ID: z.string().optional(),
  BRAND_NAME: z.string().default("Lunaris Bridge"),
  BRAND_FOOTER: z.string().default("Powered by Lunaris"),
  BRAND_COLOR: z.string().regex(/^[0-9A-Fa-f]{6}$/).default("7C3AED"),
  STORE_SERVER_ADDRESS: z.string().default("play.example.net"),
  DATABASE_PATH: z.string().default("./data/lunaris.db"),
  CATALOG_PATH: z.string().default("./config/catalog.json"),
  GCASH_RECEIVER_NUMBER: z.string().min(1),
  PAYMENT_INSTRUCTIONS: z.string().default("Send the exact amount and keep your receipt."),
  PORT: z.coerce.number().int().min(1).max(65535).optional(),
  PAYMENT_WEBHOOK_PORT: z.coerce.number().int().min(1).max(65535).default(8787),
  PAYMENT_WEBHOOK_SECRET: z.string().min(24),
  RCON_HOST: z.string().default("127.0.0.1"),
  RCON_PORT: z.coerce.number().int().min(1).max(65535).default(25575),
  RCON_PASSWORD: z.string().optional()
});

export const config = schema.parse(process.env);
export const brandColor = Number.parseInt(config.BRAND_COLOR, 16);
export const servicePort = config.PORT ?? config.PAYMENT_WEBHOOK_PORT;
