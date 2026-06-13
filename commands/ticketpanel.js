import {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} from "discord.js";

export async function ticketPanelCommand(message) {
  const embed = new EmbedBuilder()
    .setColor("#a855f7")
    .setTitle("Ticket")
    .setDescription(
      "🌙 Welcome to the Lunaris Craft Ticket Center\nNeed assistance? Open a ticket and our staff team will help you as soon as possible.\n\n**Lunaris Craft • Support System**"
    );

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("report")
      .setLabel("Player Report")
      .setEmoji("📌")
      .setStyle(ButtonStyle.Danger),

    new ButtonBuilder()
      .setCustomId("purchase")
      .setLabel("Purchase")
      .setEmoji("💳")
      .setStyle(ButtonStyle.Success),

    new ButtonBuilder()
      .setCustomId("support")
      .setLabel("Support")
      .setEmoji("🎫")
      .setStyle(ButtonStyle.Primary)
  );

  await message.channel.send({
    embeds: [embed],
    components: [row]
  });
}

