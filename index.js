```js
import {
  Client,
  GatewayIntentBits,
  PermissionsBitField
} from "discord.js";

import { pingCommand } from "./commands/ping.js";
import { addAutoRole } from "./systems/autorole.js";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const PREFIX = "?";

const WELCOME_CHANNEL = "1514594312166314145";

client.once("ready", () => {
  console.log(`${client.user.tag} is online!`);
});

client.on("guildMemberAdd", async (member) => {
  await addAutoRole(member);

  const channel = member.guild.channels.cache.get(WELCOME_CHANNEL);

  if (!channel) return;

  channel.send(`🌙 Welcome to **Lunaris Craft**, ${member}!`);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith(PREFIX)) return;

  const args = message.content.slice(PREFIX.length).trim().split(/ +/);
  const command = args.shift()?.toLowerCase();

  if (command === "testwelcome") {
    if (
      !message.member.permissions.has(
        PermissionsBitField.Flags.Administrator
      )
    ) {
      return message.reply("❌ You need Administrator permission.");
    }

    const user = message.mentions.users.first();

    if (!user) {
      return message.reply("Usage: `?testwelcome @user`");
    }

    const channel = message.guild.channels.cache.get(WELCOME_CHANNEL);

    if (!channel) {
      return message.reply("❌ Welcome channel not found.");
    }

    return channel.send(
      `🌙 Welcome to **Lunaris Craft**, <@${user.id}>!`
    );
  }

  if (command === "ping") {
    return pingCommand(message);
  }
});

client.login(process.env.DISCORD_TOKEN);
```
