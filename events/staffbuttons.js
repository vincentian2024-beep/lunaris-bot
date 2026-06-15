import fs from "fs";

const STAFF_FILE =
  "./data/staff.json";

function loadData() {
  try {
    return JSON.parse(
      fs.readFileSync(
        STAFF_FILE,
        "utf8"
      )
    );
  } catch {
    return {};
  }
}

function saveData(data) {
  fs.writeFileSync(
    STAFF_FILE,
    JSON.stringify(
      data,
      null,
      2
    )
  );
}

const STAFF_LOG_CHANNEL =
  "channelid";

export async function handleStaffButtons(
  interaction
) {

  if (
    !interaction.isButton()
  ) return;

  if (
    interaction.customId !==
    "staff_checkin"
  ) return;

  const data = loadData();

  const userId =
    interaction.user.id;

  if (
    data[userId]?.active
  ) {
    return interaction.reply({
      content:
        "❌ You are already checked in.",
      ephemeral: true
    });
  }

  data[userId] = {
    active: true,
    startTime: Date.now(),
    username:
      interaction.user.username
  };

  saveData(data);

  const channel =
    interaction.guild.channels.cache.get(
      STAFF_LOG_CHANNEL
    );

  if (channel) {

    await channel.send({
      embeds: [
        {
          color: 0x57f287,
          title:
            "🟢 Staff Check-In",
          fields: [
            {
              name:
                "Staff",
              value:
                `<@${interaction.user.id}>`
            },
            {
              name:
                "Started",
              value:
                `<t:${Math.floor(
                  Date.now() /
                  1000
                )}:F>`
            },
            {
              name:
                "Status",
              value:
                "🟢 On Duty"
            }
          ]
        }
      ]
    });

  }

  return interaction.reply({
    content:
      "✅ Shift started.",
    ephemeral: true
  });
}
