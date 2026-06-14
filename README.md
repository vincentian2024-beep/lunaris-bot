# Lunaris Bridge

Lunaris Bridge is a Discord wallet and storefront that delivers purchased products to
Minecraft through RCON and to Discord through roles. Every user-facing embed is branded
**Powered by Lunaris**.

## Features

- Private wallet, balance, and recent transaction views
- GCash and bank-to-GCash payment intents with unique references
- Signed, idempotent payment webhook
- Staff-only manual payment approval and wallet credit commands
- Categorized store configured through JSON
- Minecraft username linking with strict validation
- Minecraft RCON command and Discord role delivery
- Integer-centavo accounting and an immutable transaction ledger
- Automatic refund when fulfillment fails
- Audit-channel events and direct customer notifications
- SQLite WAL storage with transactional balance updates

## Important payment limitation

A Discord bot cannot legally or reliably inspect a personal GCash account by itself.
Automatic credit requires an authorized payment gateway or merchant integration that can
send a server-side webhook. Lunaris Bridge exposes a signed webhook endpoint for that
integration and includes `/payment approve` as the operational fallback.

Never automate payment matching by scraping SMS messages, sharing OTPs, or storing a
GCash password.

## Setup

1. Install Node.js 22 or newer.
2. Copy `.env.example` to `.env` and fill in every required value.
3. Update `config/catalog.json` with real products, Discord role IDs, and Minecraft
   console commands.
4. Enable RCON in `server.properties`:

   ```properties
   enable-rcon=true
   rcon.port=25575
   rcon.password=use-a-long-random-password
   ```

   Bind or firewall RCON so only the bridge host can access it.

5. Install and start:

   ```powershell
   npm install
   npm run build
   npm start
   ```

Guild slash commands are installed automatically when the bot starts.
After deployment, use `/panel type:Store` and `/panel type:Top up` in the desired
Discord channels to publish permanent customer panels like the screenshot examples.

## Deploy from GitHub to Railway

All required project files are already included. Put this entire folder in one GitHub
repository; do not upload `.env`, `data/`, `dist/`, or `node_modules/`.

1. Create a new GitHub repository and add every file from this project.
2. In Railway, choose **New Project → Deploy from GitHub repo** and select the repository.
3. Open the Railway service's **Variables** page and add each variable from
   `.env.example`. Do not add `PORT`; Railway supplies it.
4. Add a Railway Volume and mount it at `/data`.
5. Set `DATABASE_PATH=/data/lunaris.db`.
6. Generate a public Railway domain under **Settings → Networking**. Railway uses
   `/health` to verify the deployment.
7. Deploy. The included `Dockerfile` builds the TypeScript application and
   `railway.json` starts it.

The files that must exist in GitHub are:

```text
.dockerignore
.env.example
.gitignore
Dockerfile
README.md
package.json
railway.json
tsconfig.json
config/catalog.json
src/catalog.ts
src/commands.ts
src/config.ts
src/database.ts
src/fulfillment.ts
src/index.ts
src/money.test.ts
src/money.ts
src/types.ts
src/ui.ts
src/webhook.ts
```

Never put the Discord token, RCON password, GCash credentials, or webhook secret in
GitHub. They belong only in Railway Variables.

## Discord permissions

The bot needs:

- View Channels
- Send Messages
- Embed Links
- Use Application Commands
- Manage Roles, only if products deliver Discord roles

Place the bot's role above every product role it needs to assign. Set `ADMIN_ROLE_ID` to
the staff role allowed to approve payments or manually credit wallets.

## Customer flow

1. `/topup` creates a pending payment with a unique `LB-...` reference.
2. Staff verify the receipt/provider event and run:

   ```text
   /payment approve reference:LB-1234ABCD provider_reference:GCASH-RECEIPT-ID
   ```

3. The wallet is credited once. Replaying the same approval cannot duplicate credit.
4. The customer uses `/link`, then `/store`.
5. A purchase debits the wallet and starts delivery.
6. Successful delivery completes the order; failed delivery triggers an automatic refund.

## Payment webhook

The local endpoint is:

```text
POST /webhooks/payments
X-Lunaris-Signature: sha256=<HMAC-SHA256 hex digest of the raw body>
Content-Type: application/json
```

Example body:

```json
{
  "event": "payment.completed",
  "paymentReference": "LB-1234ABCD",
  "providerReference": "gateway-event-987",
  "amountCentavos": 50000
}
```

On Railway, the service listens on Railway's assigned `PORT` and HTTPS is terminated by
Railway's public domain. Validate the payment provider before translating its event into
this internal schema, and preserve the raw request body when calculating the signature.

Health check:

```text
GET /health
```

## Commands

- `/wallet` — balance and recent activity
- `/topup` — create GCash or bank transfer instructions
- `/store` — browse categories and buy products
- `/link username:<name>` — link a Minecraft account
- `/panel` — staff command that posts a permanent Store or Top-up panel
- `/payment approve` — staff payment approval
- `/credit` — staff emergency/manual credit with an audit reason

## Production checklist

- Use an authorized Philippine payment provider and HTTPS.
- Back up the `data/` directory.
- Keep `.env`, Discord tokens, RCON passwords, and webhook secrets out of source control.
- Use a dedicated Minecraft console account/network path where possible.
- Test every catalog command on a staging server.
- Restrict the staff role and audit all manual credits.
- Add provider reconciliation and database backups before handling meaningful volume.
