import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import Database from "better-sqlite3";
import { config } from "./config.js";
import type { PaymentIntent } from "./types.js";

mkdirSync(dirname(config.DATABASE_PATH), { recursive: true });
const db = new Database(config.DATABASE_PATH);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");
db.pragma("busy_timeout = 5000");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    discord_id TEXT PRIMARY KEY,
    minecraft_name TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS wallets (
    user_id TEXT PRIMARY KEY REFERENCES users(discord_id),
    balance_centavos INTEGER NOT NULL DEFAULT 0 CHECK(balance_centavos >= 0),
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS ledger (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL REFERENCES users(discord_id),
    delta_centavos INTEGER NOT NULL,
    balance_after_centavos INTEGER NOT NULL,
    kind TEXT NOT NULL,
    reference TEXT NOT NULL UNIQUE,
    note TEXT,
    actor_id TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS payment_intents (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(discord_id),
    amount_centavos INTEGER NOT NULL CHECK(amount_centavos > 0),
    sender_phone TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','credited','cancelled')),
    provider_reference TEXT UNIQUE,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    credited_at TEXT
  );

  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(discord_id),
    product_id TEXT NOT NULL,
    product_name TEXT NOT NULL,
    amount_centavos INTEGER NOT NULL,
    minecraft_name TEXT,
    status TEXT NOT NULL CHECK(status IN ('processing','completed','refunded','failed')),
    failure_reason TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TEXT
  );

  CREATE INDEX IF NOT EXISTS idx_ledger_user ON ledger(user_id, id DESC);
  CREATE INDEX IF NOT EXISTS idx_payment_status ON payment_intents(status, created_at);
  CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id, created_at DESC);
`);

function ensureUser(userId: string): void {
  db.prepare("INSERT OR IGNORE INTO users(discord_id) VALUES (?)").run(userId);
  db.prepare("INSERT OR IGNORE INTO wallets(user_id) VALUES (?)").run(userId);
}

export function getBalance(userId: string): number {
  ensureUser(userId);
  return (db.prepare("SELECT balance_centavos FROM wallets WHERE user_id = ?")
    .get(userId) as { balance_centavos: number }).balance_centavos;
}

export function setMinecraftName(userId: string, name: string): void {
  ensureUser(userId);
  db.prepare(`
    UPDATE users SET minecraft_name = ?, updated_at = CURRENT_TIMESTAMP
    WHERE discord_id = ?
  `).run(name, userId);
}

export function getMinecraftName(userId: string): string | null {
  ensureUser(userId);
  const row = db.prepare("SELECT minecraft_name FROM users WHERE discord_id = ?")
    .get(userId) as { minecraft_name: string | null };
  return row.minecraft_name;
}

const applyCredit = db.transaction((
  userId: string,
  delta: number,
  kind: string,
  reference: string,
  note?: string,
  actorId?: string
) => {
  ensureUser(userId);
  const existing = db.prepare("SELECT balance_after_centavos FROM ledger WHERE reference = ?")
    .get(reference) as { balance_after_centavos: number } | undefined;
  if (existing) return existing.balance_after_centavos;

  const current = getBalance(userId);
  const next = current + delta;
  if (next < 0) throw new Error("Insufficient wallet balance.");

  db.prepare(`
    UPDATE wallets SET balance_centavos = ?, updated_at = CURRENT_TIMESTAMP
    WHERE user_id = ?
  `).run(next, userId);
  db.prepare(`
    INSERT INTO ledger(user_id, delta_centavos, balance_after_centavos, kind, reference, note, actor_id)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(userId, delta, next, kind, reference, note ?? null, actorId ?? null);
  return next;
});

export function creditWallet(
  userId: string,
  amount: number,
  reference: string,
  note?: string,
  actorId?: string
): number {
  if (!Number.isSafeInteger(amount) || amount <= 0) throw new Error("Invalid credit amount.");
  return applyCredit(userId, amount, "credit", reference, note, actorId);
}

export function createPaymentIntent(
  id: string,
  userId: string,
  amount: number,
  phone?: string
): void {
  ensureUser(userId);
  db.prepare(`
    INSERT INTO payment_intents(id, user_id, amount_centavos, sender_phone)
    VALUES (?, ?, ?, ?)
  `).run(id, userId, amount, phone ?? null);
}

export function getPaymentIntent(id: string): PaymentIntent | undefined {
  return db.prepare(`
    SELECT id, user_id, amount_centavos, sender_phone, status, created_at
    FROM payment_intents WHERE id = ?
  `).get(id) as PaymentIntent | undefined;
}

const approvePaymentTx = db.transaction((
  id: string,
  providerReference: string,
  actorId?: string
) => {
  const payment = getPaymentIntent(id);
  if (!payment) throw new Error("Payment reference not found.");
  if (payment.status === "cancelled") throw new Error("This payment was cancelled.");

  const balance = creditWallet(
    payment.user_id,
    payment.amount_centavos,
    `payment:${id}`,
    `Top-up ${providerReference}`,
    actorId
  );
  db.prepare(`
    UPDATE payment_intents
    SET status = 'credited', provider_reference = COALESCE(provider_reference, ?),
        credited_at = COALESCE(credited_at, CURRENT_TIMESTAMP)
    WHERE id = ?
  `).run(providerReference, id);
  return { payment, balance };
});

export const approvePayment = approvePaymentTx;

export interface OrderInput {
  id: string;
  userId: string;
  productId: string;
  productName: string;
  amount: number;
  minecraftName: string | null;
}

export const beginOrder = db.transaction((order: OrderInput) => {
  const existing = db.prepare("SELECT id FROM orders WHERE id = ?").get(order.id);
  if (existing) throw new Error("This order has already been submitted.");

  applyCredit(
    order.userId,
    -order.amount,
    "purchase",
    `order:${order.id}`,
    order.productName
  );
  db.prepare(`
    INSERT INTO orders(id, user_id, product_id, product_name, amount_centavos, minecraft_name, status)
    VALUES (?, ?, ?, ?, ?, ?, 'processing')
  `).run(
    order.id,
    order.userId,
    order.productId,
    order.productName,
    order.amount,
    order.minecraftName
  );
});

export function completeOrder(id: string): void {
  db.prepare(`
    UPDATE orders SET status = 'completed', completed_at = CURRENT_TIMESTAMP WHERE id = ?
  `).run(id);
}

export const refundOrder = db.transaction((
  id: string,
  userId: string,
  amount: number,
  reason: string
) => {
  creditWallet(userId, amount, `refund:${id}`, `Automatic refund: ${reason}`);
  db.prepare(`
    UPDATE orders SET status = 'refunded', failure_reason = ? WHERE id = ?
  `).run(reason.slice(0, 500), id);
});

export function recentLedger(userId: string, limit = 5): Array<{
  delta_centavos: number;
  kind: string;
  note: string | null;
  created_at: string;
}> {
  ensureUser(userId);
  return db.prepare(`
    SELECT delta_centavos, kind, note, created_at FROM ledger
    WHERE user_id = ? ORDER BY id DESC LIMIT ?
  `).all(userId, limit) as Array<{
    delta_centavos: number;
    kind: string;
    note: string | null;
    created_at: string;
  }>;
}
