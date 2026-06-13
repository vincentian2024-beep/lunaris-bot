```js
import {
  Client,
  GatewayIntentBits,
  PermissionsBitField
} from "discord.js";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const PREFIX = "?";

// Lunaris Settings
const WELCOME_CHANNEL = "1514594312166314145";
const AUTO_ROLE = "1514629293576290415";

client.once("ready", () => {
  console.log(`${client.user.tag} is online!`);
});

// Welcome + Auto Role
client.on("guildMemberAdd", async (member) => {
  try {
    // Auto Role
    const role = member.guild.roles.cache.get(AUTO_ROLE);

    if (role) {
      await member.roles.add(role);
    }

    // Welcome Message
    const channel = member.guild.channels.cache.get(WELCOME_CHANNEL);

    if (!channel) return;

    await channel.send(
      `🌙 Welcome to **Lunaris Craft**, ${member}!`
    );
  } catch (error) {
    console.error("GuildMemberAdd Error:", error);
  }
});

// Commands
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (!message.guild) return;
  if (!message.content.startsWith(PREFIX)) return;

  const args = message.content.slice(PREFIX.length).trim().split(/ +/);
  const command = args.shift()?.toLowerCase();

  // ?testwelcome @user
  if (command === "testwelcome") {
    if (
      !message.member.permissions.has(
        PermissionsBitField.Flags.Administrator
      )
    ) {
      return message.reply(
        "❌ You need Administrator permission."
      );
    }

    const user = message.mentions.users.first();

    if (!user) {
      return message.reply(
        "Usage: ?testwelcome @user"
      );
    }

    const channel =
      message.guild.channels.cache.get(WELCOME_CHANNEL);

    if (!channel) {
      return message.reply(
        "❌ Welcome channel not found."
      );
    }

    return channel.send(
      `🌙 Welcome to **Lunaris Craft**, <@${user.id}>!`
    );
  }
});

client.login(process.env.DISCORD_TOKEN);
```
