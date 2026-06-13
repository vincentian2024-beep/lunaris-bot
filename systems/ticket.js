import fs from "fs";

import {
  ChannelType,
  PermissionFlagsBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} from "discord.js";

const TICKET_CATEGORY = "1514630022336348251";
const STAFF_ROLE_ID = "1514593895877578852";

const DATA_FILE = "./data/tickets.json";

function loadData() {
  return JSON.parse(
    fs.readFileSync(DATA_FILE, "utf8")
  );
}

function saveData(data) {
  fs.writeFileSync(
    DATA_FILE,
    JSON.stringify(data, null, 2)
  );
}

const data = loadData();

export async function handleTicketModal(interaction) {
let ticketNumber;

  let ticketType = "ticket";

  if (interaction.customId === "report_modal") {
    ticketType = "report";
  }

  if (interaction.customId === "support_modal") {
    ticketType = "support";
  }

  if (interaction.customId === "purchase_modal") {
    ticketType = "purchase";
  }

const existingTicket = interaction.guild.channels.cache.find(
  channel =>
    channel.parentId === TICKET_CATEGORY &&
    channel.name.startsWith(ticketType) &&
    channel.permissionOverwrites.cache.has(interaction.user.id)
);

if (existingTicket) {
  return interaction.reply({
    content: `❌ You already have an open ${ticketType} ticket: ${existingTicket}`,
    ephemeral: true
  });
}

  if (interaction.customId === "report_modal") {
data.reportCounter++;
ticketNumber = data.reportCounter;
saveData(data);
}

if (interaction.customId === "support_modal") {
data.supportCounter++;
ticketNumber = data.supportCounter;
saveData(data);
}

if (interaction.customId === "purchase_modal") {
data.purchaseCounter++;
ticketNumber = data.purchaseCounter;
saveData(data);
}

  const channel = await interaction.guild.channels.create({
    name: `${ticketType}-${ticketNumber}`,
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
          PermissionFlagsBits.SendMessages,
          PermissionFlagsBits.ReadMessageHistory
        ]
      },
      {
        id: STAFF_ROLE_ID,
        allow: [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.SendMessages,
          PermissionFlagsBits.ReadMessageHistory
        ]
      }
    ]
  });

const ign = interaction.fields.getTextInputValue("ign");
const platform = interaction.fields.getTextInputValue("platform");

const embed = new EmbedBuilder()
  .setColor("#a855f7")
  .setTitle(
    `🎫 ${ticketType.toUpperCase()} TICKET #${ticketNumber}`
  )
  .setThumbnail(
    interaction.user.displayAvatarURL()
  )
  .addFields(
    {
      name: "👤 USER INFORMATION",
      value:
        `**Discord:** ${interaction.user}\n` +
        `**IGN:** ${ign}\n` +
        `**Platform:** ${platform}`
    }
  )
  .setFooter({
    text: "Lunaris Craft Support System"
  })
  .setTimestamp();

if (interaction.customId === "report_modal") {
  embed.addFields({
    name: "🚨 REPORT INFORMATION",
    value:
      `**Reported Player:** ${interaction.fields.getTextInputValue("reported")}\n` +
      `**Reason:** ${interaction.fields.getTextInputValue("reason")}`
  });
}

if (interaction.customId === "support_modal") {
  embed.addFields({
    name: "🛠️ SUPPORT INFORMATION",
    value:
      interaction.fields.getTextInputValue("issue")
  });
}

if (interaction.customId === "purchase_modal") {
  embed.addFields({
    name: "🛒 PURCHASE INFORMATION",
    value:
      `**Product:** ${interaction.fields.getTextInputValue("product")}\n` +
      `**Payment:** ${interaction.fields.getTextInputValue("payment")}`
  });
}

embed.addFields(
  {
    name: "📌 STAFF INFORMATION",
    value:
      `**Claimed By:** Unclaimed\n` +
      `**Status:** Open`,
    inline: true
  }
);

if (interaction.customId === "support_modal") {
  embed.addFields({
    name: "🛠️ Issue",
    value: interaction.fields.getTextInputValue("issue")
  });
}

if (interaction.customId === "purchase_modal") {
  embed.addFields(
    {
      name: "🛒 Product",
      value: interaction.fields.getTextInputValue("product")
    },
    {
      name: "💳 Payment Method",
      value: interaction.fields.getTextInputValue("payment")
    }
  );
}

const row = new ActionRowBuilder().addComponents(
  new ButtonBuilder()
    .setCustomId("claim_ticket")
    .setLabel("Claim Ticket")
    .setEmoji("📌")
    .setStyle(ButtonStyle.Primary),

  new ButtonBuilder()
    .setCustomId("resolve_ticket")
    .setLabel("Resolve Ticket")
    .setEmoji("✅")
    .setStyle(ButtonStyle.Success),

  new ButtonBuilder()
    .setCustomId("close_ticket")
    .setLabel("Close Ticket")
    .setEmoji("🔒")
    .setStyle(ButtonStyle.Danger)
);

  await channel.send({
    embeds: [embed],
    components: [row]
  });

  await interaction.reply({
    content: `✅ Ticket created: ${channel}`,
    ephemeral: true
  });
}
