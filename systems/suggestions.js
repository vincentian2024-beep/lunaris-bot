import fs from "fs";

import {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} from "discord.js";

const SUGGESTIONS_FILE =
  "./data/suggestions.json";

function loadSuggestions() {
  return JSON.parse(
    fs.readFileSync(
      SUGGESTIONS_FILE,
      "utf8"
    )
  );
}

function saveSuggestions(data) {
  fs.writeFileSync(
    SUGGESTIONS_FILE,
    JSON.stringify(data, null, 2)
  );
}

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

  const row1 = new ActionRowBuilder()
.addComponents(
  new ButtonBuilder()
    .setCustomId("suggest_upvote")
    .setLabel("👍 0")
    .setStyle(ButtonStyle.Success),

  new ButtonBuilder()
    .setCustomId("suggest_downvote")
    .setLabel("👎 0")
    .setStyle(ButtonStyle.Danger)
);

const row2 = new ActionRowBuilder()
.addComponents(
  new ButtonBuilder()
    .setCustomId("suggest_accept")
    .setLabel("Accept")
    .setEmoji("✅")
    .setStyle(ButtonStyle.Success),

  new ButtonBuilder()
    .setCustomId("suggest_deny")
    .setLabel("Deny")
    .setEmoji("❌")
    .setStyle(ButtonStyle.Danger)
);

  return {
  embeds: [embed],
  components: [row1, row2]
};
}
