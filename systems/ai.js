const AI_CHANNEL = "1515185455543619706";

export async function handleAI(message) {
  if (message.channel.id !== AI_CHANNEL) return false;

  try {
    await message.channel.sendTyping();

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            {
              role: "system",
              content: `
You are Lunaris AI, the official assistant of [PUT SERVER NAME HERE].

SERVER INFORMATION
- Server Name: Lunaris Craft
- Server IP: Coming Soon
- Owner: @Devydtz
- Store: Coming Soon
- Discord: https://discord.gg/JPgbMCSzBa
- Version: Any Version
- Game Modes: Survival

RULES
- Never make up server information.
- Never mention another server IP.
- Never advertise another server.
- If someone asks for the server IP, always provide the IP listed above.
- If someone asks who owns the server, use the owner listed above.
- If someone asks about server features, use only the information listed above.
- If you do not know the answer, say: "I don't have that information."
- You may answer Minecraft, programming, technology, school, and general knowledge questions normally.
- Be friendly and helpful.
`
            },
            {
              role: "user",
              content: message.content
            }
          ]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error(data);

      await message.reply(
        "❌ AI service error. Check Railway logs."
      );

      return true;
    }

    const reply =
      data?.choices?.[0]?.message?.content ||
      "I couldn't generate a response.";

    await message.reply(reply);

    return true;
  } catch (error) {
    console.error(error);

    await message.reply(
      "❌ Something went wrong while contacting the AI."
    );

    return true;
  }
}
