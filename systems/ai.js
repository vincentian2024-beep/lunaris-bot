```js
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const AI_CHANNEL = "1515185455543619706";

export async function handleAI(message) {
  if (message.channel.id !== AI_CHANNEL) return false;

  const response = await openai.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [
      {
        role: "system",
        content:
          "You are Lunaris AI, a helpful assistant inside a Minecraft Discord server."
      },
      {
        role: "user",
        content: message.content
      }
    ]
  });

  const reply =
    response.choices?.[0]?.message?.content ||
    "I couldn't generate a response.";

  await message.reply(reply);

  return true;
}
```
