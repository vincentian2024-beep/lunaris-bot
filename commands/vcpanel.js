const embed = new EmbedBuilder()
  .setColor("#a855f7")
  .setAuthor({
    name: "Lunaris Voice Interface",
    iconURL: message.client.user.displayAvatarURL()
  })
  .setDescription(
`> Voice Channel Management

Control your private voice channel using the interface below.`
  )
  .addFields(
    {
      name: "👑 Ownership",
      value: "Join-To-Create Owner",
      inline: true
    },
    {
      name: "🔊 Status",
      value: "Connected",
      inline: true
    },
    {
      name: "⚡ Access",
      value: "Full Control",
      inline: true
    },
    {
      name: "🔒 Privacy",
      value: "Manage Lock State",
      inline: true
    },
    {
      name: "👥 Members",
      value: "Manage User Limit",
      inline: true
    },
    {
      name: "🎨 Customization",
      value: "Rename & Transfer",
      inline: true
    }
  )
  .setThumbnail(
    message.client.user.displayAvatarURL()
  )
  .setImage(
    "https://i.imgur.com/yourBanner.png"
  )
  .setFooter({
    text: "Powered by Lunaris Craft"
  })
  .setTimestamp();
