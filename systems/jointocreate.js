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
  return;
}
