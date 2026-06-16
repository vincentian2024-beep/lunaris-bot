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
      "❌ Usage: ?ship @user1 @user2"
    );
  }

  const results = [

`${user1} and ${user2} are destined to be together. The Lunaris stars aligned perfectly the moment they met. 💜`,

`${user1} and ${user2} share a connection so powerful that even the moon approves of this relationship. 🌙`,

`According to the Lunaris matchmaking system, ${user1} and ${user2} are the definition of soulmates. 💞`,

`${user1} accidentally stole ${user2}'s heart and never gave it back. 💘`,

`The universe calculated every possible outcome and still concluded that ${user1} belongs with ${user2}. ✨`,

`${user1} and ${user2} have been officially certified as the cutest duo in Lunaris Craft. 👑`,

`Scientists studied this pairing for years and discovered that ${user1} and ${user2} are a perfect match. 🔬❤️`,

`Even if destiny restarted a thousand times, ${user1} would always find their way back to ${user2}. 🌹`

  ];

  const result =
    results[
      Math.floor(
        Math.random() *
        results.length
      )
    ];

  const embed =
    new EmbedBuilder()
      .setColor("#ff69b4")
      .setTitle(
        "💕 Lunaris Ship Calculator 💕"
      )
      .setDescription(
`❤️ **Ship Result**

${user1} × ${user2}

━━━━━━━━━━━━━━

💘 Compatibility: **100%**
💍 Marriage Chance: **100%**
🌙 Soulmate Level: **MAX**

━━━━━━━━━━━━━━

${result}`
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
