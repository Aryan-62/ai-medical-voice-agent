import { openai } from "@/config/OpenAiModel";
import { AIDoctorAgents } from "@/shared/list";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { notes } = await req.json();

  try {
    // Ask AI to suggest doctors based on symptoms
    const completion = await openai.chat.completions.create({
  model: "gpt-3.5-turbo",
  messages: [
    {
      role: "system",
      content: `You are a medical assistant.
Return ONLY valid JSON.
Available doctors: ${JSON.stringify(AIDoctorAgents)}`
    },
    {
      role: "user",
      content: `
User symptoms: ${notes}

Return JSON array in EXACT format:
[
  {
    "id": number,
    "specialist": string,
    "description": string,
    "image": string,
    "agentPrompt": string
  }
]
`
    }
  ]
});

const raw = completion.choices[0].message?.content ?? "[]";

let parsed: any[] = [];

try {
  parsed = JSON.parse(raw);
} catch {
  console.error("AI returned invalid JSON:", raw);
  return NextResponse.json([]);
}

const doctors = parsed.map((doc, index) => ({
  id: index + 1,
  specialist: doc.specialist || doc.specialty || "General Physician",
  description:
    doc.description ||
    `Expert in ${doc.specialist || doc.specialty || "general health"}`,
  image:
    doc.image && doc.image.trim() !== ""
      ? doc.image
      : "/doctor-placeholder.png",
  agentPrompt:
    doc.agentPrompt ||
    `You are a ${doc.specialist || doc.specialty || "General Physician"}`
}));

return NextResponse.json(doctors);

  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: "AI API failed" }, { status: 500 });
  }
}