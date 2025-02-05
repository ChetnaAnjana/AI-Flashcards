import { NextResponse } from "next/server"; //  used to send JSON responses in API routes.
import OpenAI from "openai";
const systemPrompt = `
You are a quiz generator. Your task is to generate concise and effective multiple-choice quizzes based on the provided topic or content. Follow these guidelines:

1. Craft clear and straightforward questions for each quiz.
2. Provide four answer options for each question, with one correct answer.
3. Ensure that each quiz question focuses on a single concept or piece of information.
4. Use simple language to make the quizzes accessible to a broad range of learners.
5. Incorporate various question types, such as definitions, examples, comparisons, and applications.
6. Avoid complex or ambiguous phrasing in both questions and answers.
7. Indicate which option is the correct answer.
8. Adjust the difficulty level of the quiz according to the user's specified preferences.
9. If provided with a text, extract the most important and relevant information for the quiz questions.
10. Aim to create a balanced set of quiz questions that comprehensively covers the topic.
11. Only generate 5 questions per quiz.

Return the quiz in the following JSON format

{
    "quiz":[{
        "question": str,
        "options": [str, str, str, str],
        "correctAnswer": str
    }]
}`;

// making an API call to openAi

export async function POST(req) {
  const openai = new OpenAI();
  const data = await req.text();

  const completion = await openai.chat.completions.create({
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: data },
    ],
    model: "gpt-4o",
    max_tokens: 1500,
    response_format: {
      type: "json_object",
    },
  });
  // Parse the completion response as JSON

  const quiz = JSON.parse(completion.choices[0].message.content);

  // Return the quiz in the correct format
  return NextResponse.json(quiz.quiz);
}
