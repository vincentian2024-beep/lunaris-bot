import fs from "fs";

import {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} from "discord.js";

export async function suggestionPanelCommand(message) {

  const embed = new EmbedBuilder()
    .setColor("#a855f7")
    .setTitle("💡 Lunaris Suggestions")
    .setDescription(
      "Have an idea for Lunaris Craft?\n\nClick the button below to submit a suggestion."
    )
    .setFooter({
      text: "Lunaris Craft Suggestion System"
    });

  const row = new ActionRowBuilder()
const panel = await message.channel.send({
  embeds: [embed],
  components: [row]
});

const panelData = {
  messageId: panel.id
};

fs.writeFileSync(
  "./data/panel.json",
  JSON.stringify(panelData, null, 2)
);

await message.delete().catch(() => {});
  
  const panelData = {
  messageId: panel.id
};

fs.writeFileSync(
  "./data/panel.json",
  JSON.stringify(panelData, null, 2)
);
    embeds: [embed],
    components: [row]
  });


  await message.delete().catch(() => {});
}
