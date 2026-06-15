import fs from "fs";

import {
  ChannelType,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  StringSelectMenuBuilder
} from "discord.js";

const JTC_CHANNEL = "1514875884975423518";
const VC_CATEGORY = "1514630686630346945";
  
const DATA_FILE = "./data/voice.json";

function loadData() {
  return JSON.parse(
    fs.readFileSync(DATA_FILE, "utf8")
  );
}

function saveData(data) {
  fs.writeFileSync(
    DATA_FILE,
    JSON.stringify(data, null, 2)
  );
}

export async function handleJoinToCreate(
  oldState,
  newState
) {
  if (
    newState.channelId !== JTC_CHANNEL
  ) return;

  const member = newState.member;

  const channel =
    await newState.guild.channels.create({
      name: `🎙️ ${member.user.username}'s Room`,
      type: ChannelType.GuildVoice,
      parent: VC_CATEGORY
    });

  await member.voice.setChannel(
    channel
  );

const embed =
  new EmbedBuilder()
    .setColor("#a855f7")
    .setAuthor({
      name: "Lunaris Voice Interface",
      iconURL:
        member.client.user.displayAvatarURL()
    })
    .setTitle("🌙 Voice Controls")
    .setDescription(
`Welcome <@${member.id}>!

This is the control panel for your private voice channel.

🔒 Lock / Unlock
👁️ Hide / Show
✏️ Rename
👥 User Limit
👢 Kick User
🗑️ Delete Channel`
    )
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
        .setLabel("Kick")
        .setEmoji("👢")
        .setStyle(ButtonStyle.Danger),

      new ButtonBuilder()
        .setCustomId("vc_delete")
        .setLabel("Delete")
        .setEmoji("🗑️")
        .setStyle(ButtonStyle.Danger)
    );

await channel.send({
  content:
    `<@${member.id}>`,
  embeds: [embed],
  components: [row1, row2]
});

  const data = loadData();

  data[channel.id] = {
  owner: member.id
};

saveData(data);
}

export async function handleVCDelete(
  oldState,
  newState
) {

  console.log(
    "VC Delete Check:",
    oldState.channel?.name
  );

  if (!oldState.channel) return;

  const data = loadData();

  if (
    !data[oldState.channel.id]
  ) return;

  if (
    oldState.channel.members.size === 0
  ) {

    console.log(
      "Deleting:",
      oldState.channel.name
    );

    delete data[
      oldState.channel.id
    ];

    saveData(data);

    await oldState.channel
      .delete()
      .catch(console.error);
  }
}

export async function handleVCButtons(
  interaction
) {

if (
  interaction.customId ===
  "vc_limit"
) {

  const modal =
    new ModalBuilder()
      .setCustomId("limit_vc")
      .setTitle("User Limit");

  const input =
    new TextInputBuilder()
      .setCustomId("limit")
      .setLabel("Enter limit (0-99)")
      .setStyle(
        TextInputStyle.Short
      );

  modal.addComponents(
    new ActionRowBuilder()
      .addComponents(input)
  );

  return interaction.showModal(
    modal
  );
}

if (
  interaction.customId ===
  "vc_rename"
) {

  const modal =
    new ModalBuilder()
      
      .setCustomId(
        "rename_vc"
      )
      .setTitle(
        "Rename Voice Channel"
      );

  const input =
    new TextInputBuilder()
      .setCustomId(
        "new_name"
      )
      .setLabel(
        "New VC Name"
      )
      .setStyle(
        TextInputStyle.Short
      );

  modal.addComponents(
    new ActionRowBuilder()
      .addComponents(input)
  );

  return interaction.showModal(
    modal
  );
}
  

  if (!interaction.isButton())
    return;

  const data = loadData();

  const channel =
    interaction.member.voice.channel;

  if (!channel) {
    return interaction.reply({
      content:
        "❌ Join your voice channel first.",
      ephemeral: true
    });
  }

  if (
    !data[channel.id]
  ) {
    return interaction.reply({
      content:
        "❌ This is not a Join-To-Create channel.",
      ephemeral: true
    });
  }

  if (
    data[channel.id].owner !==
    interaction.user.id
  ) {
    return interaction.reply({
      content:
        "❌ You are not the owner of this VC.",
      ephemeral: true
    });
  }

  if (
  interaction.customId ===
  "vc_kick"
) {

  const members =
    [...channel.members.values()]
      .filter(
        m =>
          m.id !==
          interaction.user.id
      );

  if (
    members.length === 0
  ) {
    return interaction.reply({
      content:
        "❌ Nobody else is in the VC.",
      ephemeral: true
    });
  }

  const menu =
    new StringSelectMenuBuilder()
      .setCustomId(
        "kick_user"
      )
      .setPlaceholder(
        "Select a user to kick"
      )
      .addOptions(
        members.map(m => ({
          label:
            m.user.username,
          value: m.id
        }))
      );

  const row =
    new ActionRowBuilder()
      .addComponents(menu);

  return interaction.reply({
    content:
      "👢 Select a user to kick:",
    components: [row],
    ephemeral: true
  });
}

  // LOCK

  if (
    interaction.customId ===
    "vc_lock"
  ) {

    await channel.permissionOverwrites.edit(
      interaction.guild.roles.everyone,
      {
        Connect: false
      }
    );

    return interaction.reply({
      content:
        "🔒 Voice channel locked.",
      ephemeral: true
    });
  }

  // UNLOCK

  if (
    interaction.customId ===
    "vc_unlock"
  ) {

    await channel.permissionOverwrites.edit(
      interaction.guild.roles.everyone,
      {
        Connect: null
      }
    );

    return interaction.reply({
      content:
        "🔓 Voice channel unlocked.",
      ephemeral: true
    });
  }

  // HIDE

  if (
    interaction.customId ===
    "vc_hide"
  ) {

    await channel.permissionOverwrites.edit(
      interaction.guild.roles.everyone,
      {
        ViewChannel: false
      }
    );

    return interaction.reply({
      content:
        "👁️ Voice channel hidden.",
      ephemeral: true
    });
  }

  // SHOW

  if (
    interaction.customId ===
    "vc_show"
  ) {

    await channel.permissionOverwrites.edit(
      interaction.guild.roles.everyone,
      {
        ViewChannel: null
      }
    );

    return interaction.reply({
      content:
        "👀 Voice channel visible.",
      ephemeral: true
    });
  }

  // DELETE

 if (
  interaction.customId ===
  "vc_delete"
) {

  if (
    data[channel.id].owner !==
    interaction.user.id
  ) {
    return interaction.reply({
      content:
        "❌ Only the VC owner can delete this VC.",
      ephemeral: true
    });
  }

  delete data[channel.id];

  saveData(data);

 await interaction.reply({
  content:
    "🗑️ Deleting VC...",
    ephemeral: true
  });

return channel.delete();

  }
}
