```js
import {
  Client,
  GatewayIntentBits,
  PermissionsBitField,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  PermissionFlagsBits
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

// CHANGE THESE IDS
const WELCOME_CHANNEL = "1514594312166314145";
const TICKET_CATEGORY = "1514630022336348251";

client.once("ready", () => {
  console.log(`${client.user.tag} is online!`);
});

// Welcome System
client.on("guildMemberAdd", async (member) => {
  const channel = member.guild.channels.cache.get(WELCOME_CHANNEL);

  if (!channel) return;

  channel.send(`🌙 Welcome to **Lunaris Craft**, ${member}!`);
});

// Commands
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (!message.guild) return;
  if (!message.content.startsWith(PREFIX)) return;

  const args = message.content.slice(PREFIX.length).trim().split(/ +/);
  const command = args.shift()?.toLowerCase();

  // Test Welcome
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
      return message.reply("Usage: ?testwelcome @user");
    }

    const channel = message.guild.channels.cache.get(WELCOME_CHANNEL);

    if (!channel) {
      return message.reply("❌ Welcome channel not found.");
    }

    return channel.send(
      `🌙 Welcome to **Lunaris Craft**, <@${user.id}>!`
    );
  }

  // Ticket Panel
  if (command === "ticketpanel") {
    const embed = new EmbedBuilder()
      .setColor("#8b5cf6")
      .setTitle("🎫 Ticket")
      .setDescription(
        "🌙 Welcome to the Lunaris Craft Ticket Center\n\nNeed assistance? Open a ticket and our staff team will help you as soon as possible."
      )
      .setFooter({
        text: "Lunaris Craft • Support System"
      });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("report")
        .setLabel("Player Report")
        .setStyle(ButtonStyle.Danger),

      new ButtonBuilder()
        .setCustomId("purchase")
        .setLabel("Purchase")
        .setStyle(ButtonStyle.Success),

      new ButtonBuilder()
        .setCustomId("support")
        .setLabel("Support")
        .setStyle(ButtonStyle.Primary)
    );

    return message.channel.send({
      embeds: [embed],
      components: [row]
    });
  }
});

// Ticket Buttons
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isButton()) return;

  const ticketChannel = await interaction.guild.channels.create({
    name: `ticket-${interaction.user.username}`,
    type: ChannelType.GuildText,
    parent: TICKET_CATEGORY,
    permissionOverwrites: [
      {
        id: interaction.guild.id,
        deny: [PermissionFlagsBits.ViewChannel]
      },
      {
        id: interaction.user.id,
        allow: [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.SendMessages
        ]
      }
    ]
  });

  await ticketChannel.send({
    content: `🎫 Welcome ${interaction.user}! Please explain your issue.`
  });

  await interaction.reply({
    content: `✅ Ticket created: ${ticketChannel}`,
    ephemeral: true
  });
});

client.login(process.env.DISCORD_TOKEN);
```
