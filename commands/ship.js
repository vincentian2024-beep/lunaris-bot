import {
  EmbedBuilder
} from "discord.js";

export async function shipCommand(
  message,
  args
) {

  const user1 =
    message.mentions.users.first();

  const user2 =
    message.mentions.users.last();

  if (
    !user1 ||
    !user2 ||
    user1.id === user2.id
  ) {
    return message.reply(
      "❌ Usage: ?ship @user @user"
    );
  }

  const embed =
    new EmbedBuilder()
      .setColor("#ff69b4")
      .setTitle("💖 Lunaris Ship Calculator 💖")
      .setDescription(
`💞 **Perfect Match Found!**

${user1} ❤️ ${user2}

━━━━━━━━━━━━━━

💘 Compatibility: **100%**
🌙 Soulmate Level: **MAX**
✨ Destiny: **Written in the stars**
💍 Marriage Chance: **100%**
👶 Future Kids: **12**

━━━━━━━━━━━━━━

*"Even the moon is jealous of this match."*`
      )
      .setThumbnail(
        user1.displayAvatarURL()
      )
      .setFooter({
        text:
          "Lunaris Matchmaking System"
      })
      .setTimestamp();

  return message.channel.send({
    embeds: [embed]
  });

}
