import {openai} from "@/config/OpenAiModel";
import { sessionChatTable } from "@/config/schema";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/config/db";
import { eq } from "drizzle-orm";

const REPORT_GEN_PROMPT=`You are on MedVoice Nexus AI that just finished a voice conversation with a user. Based on doctor AI agent info and Conversation between AI medical Agent and user, generate a structured report with the following fields:

1. sessionId: unique session identifier
2. agent: the medical specialist name (e.g., "General Physician AI")
3. user: name of the patient if provided
4. dateTime: current date and time in ISO format
5. chiefComplaint: one-sentence summary of the main health concern
6. symptoms: list of symptoms mentioned by the user
7. duration: how long the user experienced the symptoms
8. severity: how severe the symptoms are
9. medicationsMentioned: list of any medicines mentioned
10. recommendations: list of recommendations (e.g., rest, see a doctor)
11. room: room or location if provided

Return the result in this JSON format:

{
  "sessionId": "string",
  "agent": "string",
  "user": "string",
  "dateTime": "ISO Date string",
  "chiefComplaint": "string",
  "symptoms": ["symptom1", "symptom2"],
  "duration": "string",
  "severity": "string",
  "medicationsMentioned": ["med1", "med2"],
  "recommendations": ["rec1", "rec2"]
}

Only include valid fields. Respond with nothing else.
`

export async function POST(req: NextRequest) {
  const { sessionId, sessionDetails, messages } = await req.json();

  try {
    console.log('Generating report for session:', sessionId);
    console.log('Messages count:', messages?.length);

    if (!sessionId || !messages || messages.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields: sessionId or messages' },
        { status: 400 }
      );
    }

    const UserInput = "AI Doctor Agent Info: " + JSON.stringify(sessionDetails) + 
                      ", Conversation: " + JSON.stringify(messages);

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: REPORT_GEN_PROMPT },
        { role: "user", content: UserInput }
      ]
    });

    const rawResp = completion.choices[0].message;
    //@ts-ignore
    const Resp = rawResp.content.trim().replace(/```json/g, '').replace(/```/g, '');
    console.log('AI Response:', Resp);

    const JSONResp = JSON.parse(Resp);
    console.log('Parsed report:', JSONResp);

    const result = await db.update(sessionChatTable)
      .set({
        report: JSONResp,
        conversation: messages
      })
      .where(eq(sessionChatTable.sessionId, sessionId));

    console.log('Database update result:', result);

    return NextResponse.json({ 
      success: true, 
      report: JSONResp 
    });

  } catch (e: any) {
    console.error('Error generating report:', e);
    return NextResponse.json(
      { error: e.message || 'Failed to generate report' },
      { status: 500 }
    );
  }
}