import { NextRequest, NextResponse } from "next/server";
import { generateJsonFromPrompt } from "@/app/lib/generator";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { prompt?: string };
    const prompt = body.prompt?.trim();

    if (!prompt) {
      return NextResponse.json(
        { success: false, error: "Informe uma descrição para gerar o JSON." },
        { status: 400 },
      );
    }

    if (prompt.length > 600) {
      return NextResponse.json(
        { success: false, error: "Use no máximo 600 caracteres." },
        { status: 400 },
      );
    }

    const payload = generateJsonFromPrompt(prompt);
    return NextResponse.json(payload);
  } catch {
    return NextResponse.json(
      { success: false, error: "Não foi possível processar a solicitação." },
      { status: 500 },
    );
  }
}
