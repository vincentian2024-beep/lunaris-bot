```js
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const AI_CHANNEL = "1515185455543619706";

export async function handleAI(message) {
  try {
    console.log("AI received:", message.content);

    if (message.channel.id !== AI_CHANNEL) return false;

    await message.channel.sendTyping();

    const response = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content: "You are Lunaris AI, a helpful assistant."
        },
        {
          role: "user",
          content: message.content
        }
      ]
    });

    const reply =
      response?.choices?.[0]?.message?.content ||
      "No response received.";

    await message.reply(reply);

    return true;
  } catch (error) {
    console.error("OPENAI ERROR:", error);

    await message.reply(
      "❌ AI Error. Check Railway logs."
    );

    return true;
  }
}
```
