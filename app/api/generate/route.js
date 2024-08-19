import { NextResponse } from "next/server"; //  used to send JSON responses in API routes.
import OpenAI from "openai";

// instructions for the AI model.
const systemPrompt = `
You are a flashcard creator. Your task is to generate concise and effective flashcards based on the provided topic or content. Follow these guidelines:

1. Craft clear and straightforward questions for the front of each flashcard.
2. Provide accurate and informative answers for the back of each flashcard.
3. Ensure that each flashcard focuses on a single concept or piece of information.
4. Use simple language to make the flashcards accessible to a broad range of learners.
5. Incorporate various question types, such as definitions, examples, comparisons, and applications.
6. Avoid complex or ambiguous phrasing in both questions and answers.
7. Where appropriate, include mnemonics or memory aids to reinforce learning.
8. Adjust the difficulty level of the flashcards according to the user's specified preferences.
9. If provided with a text, extract the most important and relevant information for the flashcards.
10. Aim to create a balanced set of flashcards that comprehensively covers the topic.
11. Only generate 10 flashcards. 
Remember, the goal is to enhance learning and retention through these flashcards.

Return in the following JSON format

{
    "flashcards":[{
        "front": str,
        "back": str
    }]
}`;

// we are making one api call to openai

export async function POST(req) {
  const openai = new OpenAI();
  const data = await req.text();

  const completion = await openai.chat.completions.create({
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: data },
    ],
    model: "gpt-4o",
    response_format: {
      type: "json_object",
    },
  });

  const flashcard = JSON.parse(completion.choices[0].message.content);
  return NextResponse.json(flashcards.flashcards);
}
