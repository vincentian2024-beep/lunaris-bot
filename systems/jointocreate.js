import fs from "fs";

import {
  ChannelType,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
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

  const data = loadData();

  data[channel.id] = {
    owner: member.id
  };

    saveData(data);

  const panelEmbed =
    new EmbedBuilder()
      .setColor("#a855f7")
      .setDescription(
`# 🌙 Lunaris Voice Controls

> Manage your private voice channel using the controls below.

👑 **Owner**
${member}

🎙️ **Channel**
${channel.name}

━━━━━━━━━━━━━━━━━━`
      );

  const row1 =
    new ActionRowBuilder()
      .addComponents(

        new ButtonBuilder()
          .setCustomId("vc_lock")
          .setEmoji("🔒")
          .setStyle(ButtonStyle.Secondary),

        new ButtonBuilder()
          .setCustomId("vc_unlock")
          .setEmoji("🔓")
          .setStyle(ButtonStyle.Secondary),

        new ButtonBuilder()
          .setCustomId("vc_rename")
          .setEmoji("✏️")
          .setStyle(ButtonStyle.Primary),

        new ButtonBuilder()
          .setCustomId("vc_limit")
          .setEmoji("👥")
          .setStyle(ButtonStyle.Primary),

        new ButtonBuilder()
          .setCustomId("vc_delete")
          .setEmoji("🗑️")
          .setStyle(ButtonStyle.Danger)
      );

  await channel.send({
    embeds: [panelEmbed],
    components: [row1]
  });
}

export async function handleVCButtons(
  interaction
) {
  return;
}
