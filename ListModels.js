import { GoogleGenerativeAI } from "@google/generative-ai";

const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function main() {
  try {
    const models = await client.listModels();
    console.log("Available models for your key:");
    models.forEach((m) => console.log(m.name));
  } catch (err) {
    console.error("Error listing models:", err);
  }
}

main();