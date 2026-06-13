import {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} from "discord.js";

export async function createSuggestion(
  interaction,
  suggestion,
  reason
) {
  const embed = new EmbedBuilder()
    .setColor("#a855f7")
    .setTitle("💡 Suggestion")
    .addFields(
      {
        name: "Suggestion",
        value: suggestion
      },
      {
        name: "Reason",
        value: reason
      },
      {
        name: "📊 Status",
        value: "🌙 Pending Review"
      },
      {
        name: "📈 Votes",
        value: "👍 0 | 👎 0"
      },
      {
        name: "👤 Submitted By",
        value: `${interaction.user}`
      }
    )
    .setFooter({
      text: "Powered by Lunaris Craft"
    })
    .setTimestamp();

  const row = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId("suggest_upvote")
        .setLabel("Upvote (0)")
        .setEmoji("👍")
        .setStyle(ButtonStyle.Success),

      new ButtonBuilder()
        .setCustomId("suggest_downvote")
        .setLabel("Downvote (0)")
        .setEmoji("👎")
        .setStyle(ButtonStyle.Danger),

      new ButtonBuilder()
        .setCustomId("suggest_accept")
        .setLabel("Accept")
        .setEmoji("✅")
        .setStyle(ButtonStyle.Success),

      new ButtonBuilder()
        .setCustomId("suggest_deny")
        .setLabel("Deny")
        .setEmoji("❌")
        .setStyle(ButtonStyle.Danger),

      new ButtonBuilder()
        .setCustomId("suggest_implemented")
        .setLabel("Implement")
        .setEmoji("🚀")
        .setStyle(ButtonStyle.Primary)
    );

  return {
    embeds: [embed],
    components: [row]
  };
}
