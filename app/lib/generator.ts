type JsonPrimitive = string | number | boolean | null;
type JsonValue = JsonPrimitive | JsonObject | JsonValue[];
type JsonObject = { [key: string]: JsonValue };

interface OpenAIResponseContentText {
  type?: string;
  text?: string;
}

interface OpenAIResponseOutputItem {
  type?: string;
  content?: OpenAIResponseContentText[];
}

interface OpenAIResponsePayload {
  output_text?: string;
  output?: OpenAIResponseOutputItem[];
  error?: {
    message?: string;
  };
}

function extractJsonText(payload: OpenAIResponsePayload) {
  if (typeof payload.output_text === "string" && payload.output_text.trim()) {
    return payload.output_text.trim();
  }

  for (const item of payload.output ?? []) {
    for (const content of item.content ?? []) {
      if (content.type === "output_text" && typeof content.text === "string" && content.text.trim()) {
        return content.text.trim();
      }
    }
  }

  return "";
}

function parseJsonObject(text: string): JsonValue {
  const trimmed = text.trim();
  const jsonStart = Math.min(
    ...["{", "["]
      .map((token) => trimmed.indexOf(token))
      .filter((index) => index >= 0),
  );

  const candidate = Number.isFinite(jsonStart) ? trimmed.slice(jsonStart) : trimmed;
  return JSON.parse(candidate) as JsonValue;
}

function buildPrompt(prompt: string) {
  return [
    "Voce se comporta como um gerador de JSON.",
    "Interprete livremente a instrucao do usuario e decida a estrutura mais apropriada para o JSON.",
    "Retorne apenas JSON valido.",
    "Nao use markdown.",
    "Nao use comentarios.",
    "Nao explique nada fora do JSON.",
    "Se o usuario pedir uma lista simples, retorne uma lista simples em JSON.",
    "Se o usuario pedir objetos com campos especificos, respeite esses campos.",
    "",
    `Instrucao do usuario: ${prompt}`,
  ].join("\n");
}

export async function generateJsonFromPrompt(prompt: string) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY nao configurada.");
  }

  const model = process.env.OPENAI_MODEL || "gpt-5.2";

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      input: [
        {
          role: "system",
          content: [
            {
              type: "input_text",
              text: buildPrompt(prompt),
            },
          ],
        },
      ],
      text: {
        format: {
          type: "json_object",
        },
      },
    }),
  });

  const payload = (await response.json()) as OpenAIResponsePayload;

  if (!response.ok) {
    throw new Error(payload.error?.message || "Falha ao gerar JSON com o modelo.");
  }

  const rawText = extractJsonText(payload);

  if (!rawText) {
    throw new Error("O modelo nao retornou conteudo JSON.");
  }

  const data = parseJsonObject(rawText);

  return {
    success: true,
    engine: model,
    prompt,
    generatedAt: new Date().toISOString(),
    data,
  };
}
