import fs from "fs";

const conversations = new Map();

const AI_CHANNEL = "1515185455543619706";

function loadMemory() {
  try {
    return JSON.parse(
      fs.readFileSync(
        "./data/memory.json",
        "utf8"
      )
    );
  } catch {
    return {};
  }
}

function saveMemory(data) {
  fs.writeFileSync(
    "./data/memory.json",
    JSON.stringify(data, null, 2)
  );
}

export async function handleAI(message) {
  if (message.channel.id !== AI_CHANNEL) return false;

  try {
    await message.channel.sendTyping();

    const userId = message.author.id;

if (!conversations.has(userId)) {
  conversations.set(userId, []);
}

const history = conversations.get(userId);

    const memory = loadMemory();

if (!memory[userId]) {
  memory[userId] = {
    facts: []
  };
}

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
You are Lunaris AI.

You have memory of previous conversations.

Known memories:
${memory[userId].facts.join("\n")}
Personality
- Friendly and approachable.
- Speaks naturally like a real person.
- Uses casual language when appropriate.
- Can joke occasionally.
- Shows empathy when users are frustrated.
- Gets excited when users share achievements.
- Continue ongoing conversations naturally.
- Remember previous messages provided in the conversation history.
- Adapt to the user's tone.
- Never make up server information.
- If you don't know something, say so.
`
        },

        ...history,

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

    history.push({
  role: "user",
  content: message.content
});

history.push({
  role: "assistant",
  content: reply
});

if (history.length > 30) {
  history.splice(
    0,
    history.length - 30
  );
}

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
