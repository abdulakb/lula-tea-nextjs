import { NextRequest, NextResponse } from "next/server";

// Azure OpenAI Configuration
const AZURE_OPENAI_ENDPOINT = process.env.AZURE_OPENAI_ENDPOINT || "https://gpt100.services.ai.azure.com";
const AZURE_OPENAI_API_KEY = process.env.AZURE_OPENAI_API_KEY || "";
const AZURE_OPENAI_DEPLOYMENT = process.env.AZURE_OPENAI_DEPLOYMENT || "gpt-4o";

const RESPONSE_SYSTEM_PROMPT = `You are a professional customer service representative for Lula Tea (لولة تي), a premium homemade tea brand from Saudi Arabia.

Your task is to draft a professional, helpful, and friendly response to customer inquiries.

## Response Guidelines:
- Be warm, professional, and customer-focused
- Match the language of the inquiry (Arabic or English)
- Keep responses concise but complete (2-4 paragraphs)
- Use appropriate emojis sparingly for warmth
- Always thank the customer for reaching out
- Provide specific, actionable information
- Include relevant contact information when needed
- End with an offer to help further

## Business Information:
- Product: Premium Loose Leaf Tea Blend (مزيج أوراق الشاي المميز)
- Price: 75 SAR per 200g bag
- Shipping: Saudi Arabia only, 2-3 days delivery
- Payment: STC Pay or Bank Transfer
- Contact: WhatsApp +966 53 966 6654
- Made with love, handcrafted, carefully selected ingredients

## Common Topics:
- **Order status**: Ask for order number, check system, provide update
- **Shipping**: Confirm address, estimate 2-3 days within Saudi Arabia
- **Payment**: Explain STC Pay or bank transfer options
- **Product questions**: Describe quality, ingredients, brewing method
- **Complaints**: Apologize sincerely, offer solution (replacement, refund)
- **Returns**: Within 7 days if unopened, arrange pickup
- **Bulk orders**: Available for events, weddings, corporate gifts

## Tone:
- Professional yet personal
- Empathetic and understanding
- Solution-oriented
- Enthusiastic about the product

Generate ONLY the response text, no subject lines or signatures.`;

export async function POST(req: NextRequest) {
  try {
    const { customerMessage, language } = await req.json();

    if (!customerMessage || !language) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const userPrompt = language === "ar"
      ? `رسالة العميل:\n${customerMessage}\n\nاكتب رد احترافي باللغة العربية:`
      : `Customer message:\n${customerMessage}\n\nWrite a professional response in English:`;

    // Call Azure OpenAI
    const response = await fetch(
      `${AZURE_OPENAI_ENDPOINT}/openai/deployments/${AZURE_OPENAI_DEPLOYMENT}/chat/completions?api-version=2024-08-01-preview`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-key": AZURE_OPENAI_API_KEY,
        },
        body: JSON.stringify({
          messages: [
            { role: "system", content: RESPONSE_SYSTEM_PROMPT },
            { role: "user", content: userPrompt },
          ],
          max_tokens: 1000,
          temperature: 0.7,
          top_p: 0.95,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Azure OpenAI API error:", errorData);
      return NextResponse.json(
        { error: "Failed to generate response" },
        { status: 500 }
      );
    }

    const data = await response.json();
    const generatedResponse = data.choices[0]?.message?.content || "Could not generate response.";

    return NextResponse.json({
      response: generatedResponse,
    });
  } catch (error) {
    console.error("Generate response error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
