import {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} from "discord.js";

export async function vcPanelCommand(message) {

  const embed =
    new EmbedBuilder()
      .setColor("#a855f7")
      .setAuthor({
        name: "Lunaris Voice Interface",
        iconURL:
          message.client.user.displayAvatarURL()
      })
      .setTitle("🌙Voice Controls")
      .setDescription(
`Control your private voice channel using the buttons below.

  
      )
      .setThumbnail(
        message.client.user.displayAvatarURL()
      )
      .setFooter({
        text: "Lunaris Voice System"
      })
      .setTimestamp();

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
          .setEmoji("👀")
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
          .setCustomId("vc_kick")
          .setLabel("Kick User")
          .setEmoji("👢")
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
