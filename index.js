import {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  PermissionFlagsBits,
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

// CHANGE THIS TO YOUR WELCOME CHANNEL ID
const WELCOME_CHANNEL = "1514594312166314145";

client.once("ready", () => {
  console.log(`${client.user.tag} is online!`);
});

client.on("guildMemberAdd", async (member) => {
  const channel = member.guild.channels.cache.get(WELCOME_CHANNEL);

  if (!channel) return;

  channel.send(`🌙 Welcome to **Lunaris Craft**, ${member}!`);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
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

    channel.send(`🌙 Welcome to **Lunaris Craft**, <@${user.id}>!`);
  }
});

if (command === "ticketpanel") {
  const embed = new EmbedBuilder()
    .setColor("#a855f7")
    .setTitle("🎫 Ticket")
    .setDescription(
      "🌙 Welcome to the Lunaris Craft Ticket Center\nNeed assistance? Open a ticket and our staff team will help you as soon as possible."
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

client.on("interactionCreate", async interaction => {
  if (!interaction.isButton()) return;

  const categoryId = "1514630022336348251";

  const channel = await interaction.guild.channels.create({
    name: `ticket-${interaction.user.username}`,
    type: ChannelType.GuildText,
    parent: categoryId,
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

  await channel.send(
    `🎫 Welcome ${interaction.user}, please explain your issue.`
  );

  await interaction.reply({
    content: `✅ Ticket created: ${channel}`,
    ephemeral: true
  });
});

client.login(process.env.DISCORD_TOKEN);
