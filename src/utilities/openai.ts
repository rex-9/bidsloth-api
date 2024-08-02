import { CONFIGS } from "@/configs";
import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: CONFIGS.OPENAI.API_KEY,
});

console.log("===>> OpenAI config detected");

async function generateIdea(creatorType: string, productType: string, uniqueness: number) {
  const prompt = `
    I am a ${creatorType}. I'd like to auction a ${productType} with a uniqueness of ${uniqueness}.
    Can you help me write the title and description for this item in the following parsable JSON object given an example below?

    {
      "title": "Title of an Idea of that ${productType} (short and catchy)",
      "description": "Description of an Idea of that ${productType} (well described)"
    }
  `;

  const completion = await openai.chat.completions.create({
    messages: [
      { role: "system", content: "You are an idea generator." },
      { role: "user", content: prompt },
      { role: "system", content: "You will brainstrom and generate the idea that the user wants." },      
    ],
    model: "gpt-3.5-turbo",
  });

  const idea = JSON.parse(completion.choices[0]?.message.content!);

  return idea;
}

export { generateIdea };

// generateIdea('Streamer', 'Product', 7);