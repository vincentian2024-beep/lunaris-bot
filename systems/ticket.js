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

let ticketCounter = 0;

export async function handleTicketModal(interaction) {
ticketCounter++;
const ticketNumber = ticketCounter;

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
  .setTitle(`🎫 Ticket #${ticketNumber}`)
  .setDescription(`Opened by ${interaction.user}`)
  .addFields(
    {
      name: "👤 User",
      value: `<@${interaction.user.id}>`,
      inline: true
    },
    {
      name: "🎮 IGN",
      value: ign,
      inline: true
    },
    {
      name: "💻 Platform",
      value: platform,
      inline: true
    }
  );

if (interaction.customId === "report_modal") {
  embed.addFields(
    {
      name: "🚨 Reported Player",
      value: interaction.fields.getTextInputValue("reported")
    },
    {
      name: "📝 Reason",
      value: interaction.fields.getTextInputValue("reason")
    }
  );
}

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
