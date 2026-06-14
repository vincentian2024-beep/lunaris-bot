import type { GuildMember } from "discord.js";
import { Rcon } from "rcon-client";
import { config } from "./config.js";
import type { Delivery } from "./types.js";

export async function fulfill(
  deliveries: Delivery[],
  member: GuildMember,
  minecraftName: string | null
): Promise<void> {
  let rcon: Rcon | undefined;
  try {
    for (const delivery of deliveries) {
      if (delivery.type === "discord_role") {
        if (delivery.roleId === "REPLACE_WITH_ROLE_ID") {
          throw new Error("A Discord role ID has not been configured for this product.");
        }
        await member.roles.add(delivery.roleId, "Lunaris Bridge purchase");
        continue;
      }

      if (!minecraftName) throw new Error("A linked Minecraft account is required.");
      if (!config.RCON_PASSWORD) throw new Error("Minecraft RCON is not configured.");
      rcon ??= await Rcon.connect({
        host: config.RCON_HOST,
        port: config.RCON_PORT,
        password: config.RCON_PASSWORD
      });
      const safeName = validateMinecraftName(minecraftName);
      await rcon.send(delivery.command.replaceAll("{minecraft}", safeName));
    }
  } finally {
    if (rcon) await rcon.end().catch(() => undefined);
  }
}

function validateMinecraftName(name: string): string {
  if (!/^[A-Za-z0-9_]{3,16}$/.test(name)) throw new Error("Invalid linked Minecraft username.");
  return name;
}
