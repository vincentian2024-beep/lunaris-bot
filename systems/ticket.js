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

export async function handleTicketModal(interaction) {
  const ticketNumber = Date.now().toString().slice(-6);

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

  const embed = new EmbedBuilder()
    .setColor("#a855f7")
    .setTitle(`Ticket #${ticketNumber}`)
    .setDescription(`Opened by ${interaction.user}`);

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
