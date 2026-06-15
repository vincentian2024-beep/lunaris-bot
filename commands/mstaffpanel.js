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
      .setTitle(
        "🌙 Lunaris Staff Management"
      )
      .setDescription(
`Manage your staff duty session.

🟢 Start Shift
📊 Statistics

Your Minecraft account must be linked.`
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
            "Start Shift"
          )
          .setEmoji("🟢")
          .setStyle(
            ButtonStyle.Success
          )

      );

  await message.channel.send({
    embeds: [embed],
    components: [row]
  });

}
