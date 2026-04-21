import { GoogleGenAI, Type } from "@google/genai";
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { lead } = await request.json();

    if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
      return NextResponse.json({ error: 'Gemini API key not configured' }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });

    const prompt = `
      Draft a professional, friendly, and concise outreach email to a new lead for a screen printing and fulfillment business called "Prosper Manufacturing OS".
      
      Lead Information:
      - Company: ${lead.companyName || 'Unknown'}
      - Contact Name: ${lead.contactName || 'there'}
      - Order Type: ${lead.orderType || 'Screen Printing'}
      - Monthly Volume: ${lead.monthlyOrderVolume || 'Unknown'}
      - Notes: ${lead.notes || 'None'}
      
      The email should:
      1. Have a catchy subject line.
      2. Introduce Prosper Manufacturing OS.
      3. Reference their specific needs based on the notes and order type.
      4. Include a clear call to action (e.g., scheduling a quick call or getting a quote).
      5. Be ready to send (do not include placeholders like [Your Name], just sign off generically as "The Prosper Team" or leave it blank for the user to sign).
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            subject: {
              type: Type.STRING,
              description: "The subject line of the email",
            },
            body: {
              type: Type.STRING,
              description: "The body of the email",
            },
          },
          required: ["subject", "body"],
        },
      },
    });

    const jsonStr = response.text?.trim() || "{}";
    const data = JSON.parse(jsonStr);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error drafting email with AI:", error);
    return NextResponse.json({ error: 'Failed to draft email' }, { status: 500 });
  }
}
