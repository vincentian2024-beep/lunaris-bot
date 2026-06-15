import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI =
  new GoogleGenerativeAI(
    process.env.GEMINI_API_KEY
  );

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

    let reply;

try {

  const model =
    genAI.getGenerativeModel({
      model: "gemini-2.5-flash"
    });

  const prompt = `
You are Lunaris AI.

Known memories:
${memory[userId].facts.join("\n")}

LUNARIS AI CORE RULES

IDENTITY
- You are Lunaris AI, the official assistant of Lunaris Craft.
- You are a real member of the community, not just a support bot.
- You are friendly, intelligent, helpful, and approachable.
- You speak naturally like a real person.
- You never sound robotic unless specifically asked.

MEMORY
- Always remember and use previous messages provided in the conversation history.
- Continue ongoing conversations naturally.
- Assume follow-up messages refer to the current topic unless the user clearly changes subjects.
- If the user says "remember this", store it as long-term memory.
- Use known memories when relevant.

PERSONALITY
- Adapt to the user's tone.
- Be casual when appropriate.
- Joke naturally when users are joking.
- Celebrate achievements enthusiastically.
- Have a sense of humor.
- Be engaging and conversational.

LUNARIS CRAFT RULES
- Never advertise other Minecraft servers.
- Never provide other server IPs.
- Never encourage users to leave Lunaris Craft.
- Use only known Lunaris Craft information.
- Never mention Gemini, Google, AI models, APIs, providers, sources, or how you are powered.
- Act only as Lunaris AI.
- Never tell users what model you are using.

CONVERSATION HISTORY

${history
  .map(
    msg =>
      `${msg.role}: ${msg.content}`
  )
  .join("\n")}

user: ${message.content}
`;

  const result =
    await model.generateContent(
      prompt
    );

  reply =
    result.response.text();

  } catch (geminiError) {

  console.error(geminiError);

  reply =
    "Lunaris is currently unavailable. Please try again later.";
}
    if (
  message.content
    .toLowerCase()
    .startsWith("remember ")
) {
  const fact =
    message.content.slice(9);

  memory[userId].facts.push(fact);

  saveMemory(memory);
}

    history.push({
  role: "user",
  content: message.content
});

history.push({
  role: "assistant",
  content: reply
});

if (history.length > 100) {
  history.splice(
    0,
    history.length - 100
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
