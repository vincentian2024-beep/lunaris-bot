import {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} from "discord.js";

export async function vcPanelCommand(
  message
) {
  const embed =
    new EmbedBuilder()
      .setColor("#a855f7")
      .setTitle(
        "🌙 Lunaris Voice Interface"
      )
      .setDescription(
`Control your private voice channel using the buttons below.

Only the owner of a Join-To-Create voice channel can use these controls.

━━━━━━━━━━━━━━━━━━

🔒 Lock / Unlock
👁️ Hide / Show
✏️ Rename
👥 User Limit
👑 Transfer Ownership
🗑️ Delete Channel

━━━━━━━━━━━━━━━━━━`
      );

  const row1 =
    new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId("vc_lock")
          .setLabel("Lock")
          .setEmoji("🔒")
          .setStyle(ButtonStyle.Secondary),

        new ButtonBuilder()
          .setCustomId("vc_unlock")
          .setLabel("Unlock")
          .setEmoji("🔓")
          .setStyle(ButtonStyle.Secondary),

        new ButtonBuilder()
          .setCustomId("vc_hide")
          .setLabel("Hide")
          .setEmoji("👁️")
          .setStyle(ButtonStyle.Secondary),

        new ButtonBuilder()
          .setCustomId("vc_show")
          .setLabel("Show")
          .setEmoji("👁️‍🗨️")
          .setStyle(ButtonStyle.Secondary)
      );

  const row2 =
    new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId("vc_rename")
          .setLabel("Rename")
          .setEmoji("✏️")
          .setStyle(ButtonStyle.Primary),

        new ButtonBuilder()
          .setCustomId("vc_limit")
          .setLabel("Limit")
          .setEmoji("👥")
          .setStyle(ButtonStyle.Primary),

        new ButtonBuilder()
          .setCustomId("vc_transfer")
          .setLabel("Transfer")
          .setEmoji("👑")
          .setStyle(ButtonStyle.Primary),

        new ButtonBuilder()
          .setCustomId("vc_delete")
          .setLabel("Delete")
          .setEmoji("🗑️")
          .setStyle(ButtonStyle.Danger)
      );

  await message.channel.send({
    embeds: [embed],
    components: [row1, row2]
  });

  await message.delete().catch(() => {});
}
