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
const TICKET_CATEGORY = "1514630022336348251";
const STAFF_ROLE_ID = "PUT_STAFF_ROLE_ID_HERE";

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

  // MODAL SUBMITS
  if (interaction.isModalSubmit()) {
    return interaction.reply({
      content: "Modal received.",
      ephemeral: true
    });
  }

  // BUTTONS
  if (!interaction.isButton()) return;

  if (interaction.customId === "report") {
    // your report modal code here
  }

  if (interaction.customId === "purchase") {
    // your purchase modal code here
  }

  if (interaction.customId === "support") {
    // your support modal code here
  }

});

client.login(process.env.DISCORD_TOKEN);
