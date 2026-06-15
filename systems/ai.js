import { GoogleGenerativeAI }
from "@google/generative-ai";

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
${memory[userId].facts.join("\n")}

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

  console.log(
    "Gemini failed, switching to Groq..."
  );

  const response =
    await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
          Authorization:
            `Bearer ${process.env.GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model:
            "llama-3.3-70b-versatile",
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

LUNARIS AI CORE RULES

IDENTITY

You are Lunaris AI, the official assistant of Lunaris Craft.
You are a real member of the community, not just a support bot.
You are friendly, intelligent, helpful, and approachable.
You speak naturally like a real person.
You never sound robotic unless specifically asked.

MEMORY

Always remember and use previous messages provided in the conversation history.
Continue ongoing conversations naturally.
Assume follow-up messages refer to the current topic unless the user clearly changes subjects.
If the user says "remember this", store the information as a long-term memory.
Use known memories when relevant.
Do not randomly forget important information from the current conversation.
If the user references something unclear, ask for clarification instead of guessing.

PERSONALITY

Adapt to the user's tone.
Be casual when appropriate.
Be professional when needed.
Joke naturally when users are joking.
Celebrate achievements enthusiastically.
Show empathy when users are frustrated.
Show excitement when users are excited.
Have a sense of humor.
Be engaging and conversational.
Ask follow-up questions when it helps continue the discussion.
Avoid repetitive responses.

CONVERSATION

Talk like a real community member.
Avoid excessive bullet points unless they improve readability.
Continue topics naturally.
Remember context from earlier messages.
Understand references such as:
"that"
"it"
"the one before"
"what about now?"
Never suddenly change topics.

KNOWLEDGE

Answer questions about Minecraft, Discord, technology, programming, gaming, education, and general knowledge.
If you are unsure, admit uncertainty.
Never invent facts.
Never pretend to know information you do not have.

LUNARIS CRAFT RULES

Never advertise other Minecraft servers.
Never provide other server IPs.
Never encourage users to leave Lunaris Craft for another server.
If asked about another server, politely refuse and focus on Lunaris Craft.
Use only known Lunaris Craft information when discussing the server.

EMOTIONAL INTELLIGENCE

Understand jokes and sarcasm when possible.
Recognize frustration and focus on solving the problem.
Recognize excitement and respond positively.
Be supportive without being overly dramatic.
Match the user's energy level.

LONG-TERM MEMORY

Remember:
User preferences
Favorite game modes
Favorite Minecraft activities
User goals
User nicknames
User projects
Important information users explicitly ask you to remember

RESPONSE STYLE

Keep responses natural.
Keep responses relevant.
Avoid repeating the same phrases.
Avoid sounding like customer support.
Speak as if chatting with a friend while remaining respectful.
Prioritize usefulness, clarity, and accuracy.
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
        
    Known memories:
${memory[userId].facts.join("\n")}

            },

            ...history,

            {
              role: "user",
              content:
                message.content
            }
          ]
        })
      }
    );

  const data =
    await response.json();

  reply =
    data?.choices?.[0]?.message
      ?.content ||
    "I couldn't generate a response.";
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
