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
      .setTitle("🌙 Lunaris Voice Interface")
      .setDescription(
`Manage your private voice channel using the controls below.

👑 **Owner:** ${member}
🎙️ **Channel:** ${channel.name}
👥 **Members:** 1 / Unlimited
🔒 **Privacy:** Unlocked
⚡ **Status:** Active`
      );

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
          .setEmoji("👁️‍🗨️")
          .setStyle(ButtonStyle.Secondary)
      );

  const row2 =
    new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId("vc_limit")
          .setLabel("Limit")
          .setEmoji("👥")
          .setStyle(ButtonStyle.Primary),

        new ButtonBuilder()
          .setCustomId("vc_invite")
          .setLabel("Invite")
          .setEmoji("➕")
          .setStyle(ButtonStyle.Primary),

        new ButtonBuilder()
          .setCustomId("vc_ban")
          .setLabel("Ban")
          .setEmoji("🚫")
          .setStyle(ButtonStyle.Danger),

        new ButtonBuilder()
          .setCustomId("vc_permit")
          .setLabel("Permit")
          .setEmoji("✅")
          .setStyle(ButtonStyle.Success)
      );

  const row3 =
    new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId("vc_rename")
          .setLabel("Rename")
          .setEmoji("✏️")
          .setStyle(ButtonStyle.Primary),

        new ButtonBuilder()
          .setCustomId("vc_transfer")
          .setLabel("Transfer")
          .setEmoji("👑")
          .setStyle(ButtonStyle.Primary),

        new ButtonBuilder()
          .setCustomId("vc_delete")
          .setLabel("Delete")
          .setEmoji("🗑️")
          .setStyle(ButtonStyle.Danger)
      );

  const interfaceChannel =
    newState.guild.channels.cache.get(
      VC_INTERFACE_CHANNEL
    );

  if (interfaceChannel) {
    await interfaceChannel.send({
      embeds: [panelEmbed],
      components: [row1, row2, row3]
    });
  }
}

export async function handleVCButtons(
  interaction
) {
  return;
}
