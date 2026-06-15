import {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} from "discord.js";

export async function mstaffPanelCommand(
  message
) {

  const embed =
    new EmbedBuilder()
      .setColor("#a855f7")
      .setAuthor({
        name:
          "Lunaris Staff Interface",
        iconURL:
          message.client.user.displayAvatarURL()
      })
      .setTitle(
        "🌙 Staff Management"
      )
      .setDescription(
`Track your staff activity and duty status.

👤 Staff Features

🟢 Check In
📊 Statistics
📅 Daily Activity
🎮 Minecraft Linked

━━━━━━━━━━━━━━

Use the buttons below to manage your shift.

Powered by Lunaris Craft`
      )
      .setThumbnail(
        message.client.user.displayAvatarURL()
      )
      .setFooter({
        text:
          "Lunaris Staff System"
      })
      .setTimestamp();

  const row =
    new ActionRowBuilder()
      .addComponents(

        new ButtonBuilder()
          .setCustomId(
            "staff_checkin"
          )
          .setLabel(
            "Check In"
          )
          .setEmoji("🟢")
          .setStyle(
            ButtonStyle.Success
          ),

        new ButtonBuilder()
          .setCustomId(
            "staff_stats"
          )
          .setLabel(
            "Statistics"
          )
          .setEmoji("📊")
          .setStyle(
            ButtonStyle.Primary
          ),

        new ButtonBuilder()
          .setCustomId(
            "staff_activity"
          )
          .setLabel(
            "Activity"
          )
          .setEmoji("📅")
          .setStyle(
            ButtonStyle.Secondary
          )

      );

  await message.channel.send({
    embeds: [embed],
    components: [row]
  });

}
