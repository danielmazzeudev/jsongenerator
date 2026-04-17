type JsonPrimitive = string | number | boolean | null;
type JsonValue = JsonPrimitive | JsonObject | JsonValue[];
type JsonObject = { [key: string]: JsonValue };

type FieldType = "string" | "number" | "boolean" | "date";

interface FieldDefinition {
  key: string;
  type: FieldType;
}

interface EntityPreset {
  match: RegExp;
  entity: string;
  fields: FieldDefinition[];
}

const DEFAULT_COUNT = 5;

const ENTITY_PRESETS: EntityPreset[] = [
  {
    match: /(pokemon|pok[eé]mon|pikachu|charizard|bulbasaur)/i,
    entity: "pokemons",
    fields: [
      { key: "id", type: "number" },
      { key: "nome", type: "string" },
      { key: "tipo", type: "string" },
      { key: "habilidade", type: "string" },
      { key: "evolui", type: "boolean" },
    ],
  },
  {
    match: /(usuario|usuarios|cliente|clientes|pessoa|pessoas|contato|contatos)/i,
    entity: "usuarios",
    fields: [
      { key: "id", type: "number" },
      { key: "nome", type: "string" },
      { key: "email", type: "string" },
      { key: "ativo", type: "boolean" },
      { key: "criadoEm", type: "date" },
    ],
  },
  {
    match: /(produto|produtos|item|itens|catalogo|cat[aá]logo)/i,
    entity: "produtos",
    fields: [
      { key: "id", type: "number" },
      { key: "nome", type: "string" },
      { key: "categoria", type: "string" },
      { key: "preco", type: "number" },
      { key: "emEstoque", type: "boolean" },
    ],
  },
  {
    match: /(planeta|planetas|astro|astros|sistema|sistemas)/i,
    entity: "planetas",
    fields: [
      { key: "id", type: "number" },
      { key: "nome", type: "string" },
      { key: "clima", type: "string" },
      { key: "diametroKm", type: "number" },
      { key: "habitavel", type: "boolean" },
    ],
  },
  {
    match: /(empresa|empresas|startup|startups|negocio|neg[oó]cio)/i,
    entity: "empresas",
    fields: [
      { key: "id", type: "number" },
      { key: "nome", type: "string" },
      { key: "segmento", type: "string" },
      { key: "funcionarios", type: "number" },
      { key: "fundadaEm", type: "date" },
    ],
  },
  {
    match: /(evento|eventos|agenda|reuniao|reuni[aã]o)/i,
    entity: "eventos",
    fields: [
      { key: "id", type: "number" },
      { key: "titulo", type: "string" },
      { key: "local", type: "string" },
      { key: "data", type: "date" },
      { key: "confirmado", type: "boolean" },
    ],
  },
];

const NAME_BANK = [
  "Aurora",
  "Vector",
  "Pulse",
  "Atlas",
  "Nexus",
  "Solaris",
  "Brisa",
  "Orion",
  "Prisma",
  "Laguna",
];

const POKEMON_NAMES = [
  "Voltiger",
  "Florash",
  "Aquaryx",
  "Pyronix",
  "Terradon",
  "Lumipaw",
  "Zephyro",
  "Cryon",
  "Mossaur",
  "Sparkit",
];

const POKEMON_TYPES = [
  "eletrico",
  "agua",
  "fogo",
  "grama",
  "pedra",
  "psiquico",
  "gelo",
  "voador",
];

const POKEMON_ABILITIES = [
  "choque rapido",
  "onda d'agua",
  "chama intensa",
  "folha navalha",
  "escudo mineral",
  "mente aguda",
  "vento cortante",
  "raio prismico",
];

const GENERIC_CATEGORIES = ["Premium", "Essencial", "Operacional", "Estrategico"];
const GENERIC_CLIMATES = ["temperado", "arido", "oceanico", "glacial"];
const GENERIC_SEGMENTS = ["SaaS", "Educacao", "Financas", "Logistica"];
const GENERIC_LOCATIONS = ["Sao Paulo", "Recife", "Lisboa", "Curitiba"];

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function inferCount(prompt: string) {
  const match = prompt.match(
    /(?:exatamente|com|gere|crie|lista de|retorne|monte)?\s*(\d{1,2})\s+(?:exemplos|itens|objetos|registros|pokemons|pokemon|planetas|usuarios|usuarios|produtos|eventos|empresas)/i,
  );
  if (!match) return DEFAULT_COUNT;
  const count = Number(match[1]);
  return Number.isFinite(count) ? Math.min(Math.max(count, 1), 12) : DEFAULT_COUNT;
}

function singularize(word: string) {
  if (word.endsWith("oes")) return `${word.slice(0, -3)}ao`;
  if (word.endsWith("aes")) return `${word.slice(0, -3)}ao`;
  if (word.endsWith("s") && word.length > 3) return word.slice(0, -1);
  return word;
}

function pluralize(word: string) {
  if (word.endsWith("s")) return word;
  if (word.endsWith("m")) return `${word.slice(0, -1)}ns`;
  return `${word}s`;
}

function extractTopic(prompt: string) {
  const normalized = normalizeText(prompt);
  const words = normalized
    .split(/[^a-z0-9]+/)
    .filter(Boolean)
    .filter((word) => word.length > 2)
    .filter(
      (word) =>
        ![
          "crie",
          "gere",
          "lista",
          "dados",
          "json",
          "objeto",
          "objetos",
          "exemplos",
          "itens",
          "com",
          "para",
          "uma",
          "umas",
          "uns",
          "dos",
          "das",
          "que",
        ].includes(word),
    );

  return words[0] ?? "registro";
}

function inferPreset(prompt: string) {
  const detectedPreset = ENTITY_PRESETS.find((preset) => preset.match.test(prompt));

  if (detectedPreset) {
    return detectedPreset;
  }

  const topic = singularize(extractTopic(prompt));
  return {
    entity: pluralize(topic),
    fields: [
      { key: "id", type: "number" as const },
      { key: "nome", type: "string" as const },
      { key: "categoria", type: "string" as const },
      { key: "descricao", type: "string" as const },
      { key: "ativo", type: "boolean" as const },
    ],
  };
}

function titleCase(input: string) {
  return input
    .toLowerCase()
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function buildPromptTopic(prompt: string) {
  return prompt
    .split(/\s+/)
    .filter((word) => normalizeText(word).length > 3)
    .slice(0, 2)
    .map((word) => titleCase(normalizeText(word)))
    .join(" ");
}

function buildString(seed: number, key: string, prompt: string, entity: string) {
  const promptTopic = buildPromptTopic(prompt);
  const baseName = NAME_BANK[seed % NAME_BANK.length];

  if (entity === "pokemons") {
    if (/nome/i.test(key)) {
      return POKEMON_NAMES[seed % POKEMON_NAMES.length];
    }

    if (/tipo/i.test(key)) {
      return POKEMON_TYPES[seed % POKEMON_TYPES.length];
    }

    if (/habilidade/i.test(key)) {
      return POKEMON_ABILITIES[seed % POKEMON_ABILITIES.length];
    }
  }

  if (/email/i.test(key)) {
    return `contato${seed + 1}@exemplo.dev`;
  }

  if (/categoria/i.test(key)) {
    return GENERIC_CATEGORIES[seed % GENERIC_CATEGORIES.length];
  }

  if (/clima/i.test(key)) {
    return GENERIC_CLIMATES[seed % GENERIC_CLIMATES.length];
  }

  if (/segmento/i.test(key)) {
    return GENERIC_SEGMENTS[seed % GENERIC_SEGMENTS.length];
  }

  if (/local/i.test(key)) {
    return GENERIC_LOCATIONS[seed % GENERIC_LOCATIONS.length];
  }

  if (/descricao/i.test(key)) {
    return promptTopic
      ? `${titleCase(entity)} inspirado em ${promptTopic}`
      : `${titleCase(entity)} de exemplo para interface`;
  }

  return promptTopic ? `${baseName} ${promptTopic}` : `${baseName} ${titleCase(entity)}`;
}

function buildNumber(seed: number, key: string) {
  if (/preco/i.test(key)) {
    return Number((49.9 + seed * 17.35).toFixed(2));
  }

  if (/diametro/i.test(key)) {
    return 4000 + seed * 850;
  }

  if (/funcionarios/i.test(key)) {
    return 12 + seed * 8;
  }

  return seed + 1;
}

function buildBoolean(seed: number, key: string) {
  if (/evolui/i.test(key)) {
    return seed % 3 !== 0;
  }

  return seed % 2 === 0;
}

function buildDate(seed: number) {
  const date = new Date(Date.UTC(2024, seed % 12, 3 + seed, 12, 0, 0));
  return date.toISOString();
}

function buildValue(
  field: FieldDefinition,
  seed: number,
  prompt: string,
  entity: string,
): JsonValue {
  switch (field.type) {
    case "string":
      return buildString(seed, field.key, prompt, entity);
    case "number":
      return buildNumber(seed, field.key);
    case "boolean":
      return buildBoolean(seed, field.key);
    case "date":
      return buildDate(seed);
    default:
      return null;
  }
}

function buildItem(fields: FieldDefinition[], index: number, prompt: string, entity: string): JsonObject {
  return fields.reduce<JsonObject>((acc, field) => {
    acc[field.key] = buildValue(field, index, prompt, entity);
    return acc;
  }, {});
}

export function generateJsonFromPrompt(prompt: string) {
  const cleanPrompt = prompt.trim();
  const count = inferCount(cleanPrompt);
  const preset = inferPreset(cleanPrompt);
  const items = Array.from({ length: count }, (_, index) =>
    buildItem(preset.fields, index, cleanPrompt, preset.entity),
  );

  return {
    success: true,
    engine: "internal-mock-generator",
    prompt: cleanPrompt,
    generatedAt: new Date().toISOString(),
    summary: {
      entity: preset.entity,
      count,
      fields: preset.fields.map((field) => field.key),
    },
    data: {
      [preset.entity]: items,
    },
  };
}
