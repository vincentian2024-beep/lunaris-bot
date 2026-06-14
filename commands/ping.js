import { EmbedBuilder } from "discord.js";

export async function pingCommand(message) {
  const sent = await message.reply(
    "🏓 Pinging..."
  );

  const ping =
    sent.createdTimestamp -
    message.createdTimestamp;

  const embed =
    new EmbedBuilder()
      .setColor("#a855f7")
      .setTitle("🏓 Lunaris Ping")
      .addFields(
        {
          name: "⚡ Latency",
          value: `${ping}ms`,
          inline: true
        },
        {
          name: "🤖 API",
          value: `${Math.round(
            message.client.ws.ping
          )}ms`,
          inline: true
        }
      )
      .setFooter({
        text: "Lunaris Craft"
      })
      .setTimestamp();

  await sent.edit({
    content: "",
    embeds: [embed]
  });
}
