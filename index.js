import {
  Client,
  GatewayIntentBits,
  PermissionsBitField,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ChannelType,
  PermissionFlagsBits,
  Events
} from "discord.js";

import { pingCommand } from "./commands/ping.js";
import { addAutoRole } from "./systems/autorole.js";
import { handleAI } from "./systems/ai.js";
import { ticketPanelCommand } from "./commands/ticketpanel.js";

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
  await addAutoRole(member);

  const channel = member.guild.channels.cache.get(WELCOME_CHANNEL);

  if (!channel) return;

  channel.send(`🌙 Welcome to **Lunaris Craft**, ${member}!`);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  
  const aiHandled = await handleAI(message);

if (aiHandled) return;
  
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

  if (command === "ping") {
  return pingCommand(message);
}
  
  if (command === "ticketpanel") {
  return ticketPanelCommand(message);
}
});

client.on("interactionCreate", async (interaction) => {

  // MODAL SUBMIT
  if (interaction.isModalSubmit()) {
    console.log("Modal submitted:", interaction.customId);

    return interaction.reply({
      content: "✅ Modal received. Ticket creation coming next.",
      ephemeral: true
    });
  }

  if (!interaction.isButton()) return;

  // REPORT
  if (interaction.customId === "report") {
    const modal = new ModalBuilder()
      .setCustomId("report_modal")
      .setTitle("Player Report");

    const ign = new TextInputBuilder()
      .setCustomId("ign")
      .setLabel("Minecraft IGN")
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const platform = new TextInputBuilder()
      .setCustomId("platform")
      .setLabel("Java or Bedrock")
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const reported = new TextInputBuilder()
      .setCustomId("reported")
      .setLabel("Reported Player IGN")
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const reason = new TextInputBuilder()
      .setCustomId("reason")
      .setLabel("Reason")
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true);

    modal.addComponents(
      new ActionRowBuilder().addComponents(ign),
      new ActionRowBuilder().addComponents(platform),
      new ActionRowBuilder().addComponents(reported),
      new ActionRowBuilder().addComponents(reason)
    );

    return interaction.showModal(modal);
  }

  // PURCHASE
  if (interaction.customId === "purchase") {
    const modal = new ModalBuilder()
      .setCustomId("purchase_modal")
      .setTitle("Purchase Ticket");

    const ign = new TextInputBuilder()
      .setCustomId("ign")
      .setLabel("Minecraft IGN")
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const platform = new TextInputBuilder()
      .setCustomId("platform")
      .setLabel("Java or Bedrock")
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const product = new TextInputBuilder()
      .setCustomId("product")
      .setLabel("Product Wanted (Rank or Keys)")
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const payment = new TextInputBuilder()
      .setCustomId("payment")
      .setLabel("Payment Method (GCash or PayPal)")
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    modal.addComponents(
      new ActionRowBuilder().addComponents(ign),
      new ActionRowBuilder().addComponents(platform),
      new ActionRowBuilder().addComponents(product),
      new ActionRowBuilder().addComponents(payment)
    );

    return interaction.showModal(modal);
  }

  // SUPPORT
if (interaction.customId === "support") {
  const modal = new ModalBuilder()
    .setCustomId("support_modal")
    .setTitle("Support Ticket");

  const ign = new TextInputBuilder()
    .setCustomId("ign")
    .setLabel("Minecraft IGN")
    .setStyle(TextInputStyle.Short)
    .setRequired(true);

  const platform = new TextInputBuilder()
    .setCustomId("platform")
    .setLabel("Java or Bedrock")
    .setStyle(TextInputStyle.Short)
    .setRequired(true);

  const issue = new TextInputBuilder()
    .setCustomId("issue")
    .setLabel("Issue Description")
    .setStyle(TextInputStyle.Paragraph)
    .setRequired(true);

  modal.addComponents(
    new ActionRowBuilder().addComponents(ign),
    new ActionRowBuilder().addComponents(platform),
    new ActionRowBuilder().addComponents(issue)
  );

  return interaction.showModal(modal);
}

}); 

client.login(process.env.DISCORD_TOKEN);
