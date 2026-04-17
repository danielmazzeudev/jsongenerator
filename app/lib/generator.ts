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
  defaultFields: FieldDefinition[];
  listValues?: string[];
}

const DEFAULT_COUNT = 5;

const ENTITY_PRESETS: EntityPreset[] = [
  {
    match: /(cor|cores|arco iris|arco-iris|rainbow|paleta)/i,
    entity: "cores",
    defaultFields: [{ key: "nome", type: "string" }],
    listValues: ["Vermelho", "Laranja", "Amarelo", "Verde", "Azul", "Anil", "Violeta"],
  },
  {
    match: /(pokemon|pok[eé]mon|pikachu|charizard|bulbasaur)/i,
    entity: "pokemons",
    defaultFields: [
      { key: "nome", type: "string" },
      { key: "tipo", type: "string" },
      { key: "habilidade", type: "string" },
    ],
  },
  {
    match: /(usuario|usuarios|cliente|clientes|pessoa|pessoas|contato|contatos)/i,
    entity: "usuarios",
    defaultFields: [
      { key: "nome", type: "string" },
      { key: "email", type: "string" },
    ],
  },
  {
    match: /(produto|produtos|item|itens|catalogo|catálogo|catalogo)/i,
    entity: "produtos",
    defaultFields: [
      { key: "nome", type: "string" },
      { key: "preco", type: "number" },
    ],
  },
  {
    match: /(planeta|planetas|astro|astros|sistema|sistemas)/i,
    entity: "planetas",
    defaultFields: [
      { key: "nome", type: "string" },
      { key: "clima", type: "string" },
    ],
  },
  {
    match: /(empresa|empresas|startup|startups|negocio|negócio|negocio)/i,
    entity: "empresas",
    defaultFields: [
      { key: "nome", type: "string" },
      { key: "segmento", type: "string" },
    ],
  },
  {
    match: /(evento|eventos|agenda|reuniao|reunião|reuniao)/i,
    entity: "eventos",
    defaultFields: [
      { key: "titulo", type: "string" },
      { key: "data", type: "date" },
    ],
  },
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

const POKEMON_TYPES = ["eletrico", "agua", "fogo", "grama", "pedra", "psiquico", "gelo", "voador"];
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

const GENERIC_NAMES = ["Alpha", "Beta", "Gamma", "Delta", "Sigma", "Atlas", "Nexus", "Pulse"];
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
    /(?:exatamente|com|gere|crie|lista de|retorne|monte)?\s*(\d{1,2})\s+(?:exemplos|itens|objetos|registros|pokemons|pokemon|planetas|usuarios|produtos|eventos|empresas|cores)/i,
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

function titleCase(input: string) {
  return input
    .toLowerCase()
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
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
          "contendo",
          "campos",
          "para",
          "uma",
          "umas",
          "uns",
          "dos",
          "das",
          "que",
          "de",
          "do",
        ].includes(word),
    );

  return words[0] ?? "registro";
}

function inferPreset(prompt: string) {
  return ENTITY_PRESETS.find((preset) => preset.match.test(prompt)) ?? null;
}

function inferEntity(prompt: string, preset: EntityPreset | null) {
  if (preset) return preset.entity;
  return pluralize(singularize(extractTopic(prompt)));
}

function normalizeFieldKey(rawField: string) {
  const normalized = normalizeText(rawField)
    .replace(/[^a-z0-9\s]/g, " ")
    .trim();

  const aliases: Record<string, string> = {
    name: "nome",
    nome: "nome",
    titulo: "titulo",
    title: "titulo",
    tipo: "tipo",
    habilidade: "habilidade",
    abilities: "habilidade",
    ability: "habilidade",
    preco: "preco",
    price: "preco",
    valor: "preco",
    email: "email",
    e_mail: "email",
    hex: "hex",
    rgb: "rgb",
    cor: "nome",
    cor_nome: "nome",
    clima: "clima",
    local: "local",
    data: "data",
    segmento: "segmento",
    descricao: "descricao",
    description: "descricao",
    estoque: "emEstoque",
    em_estoque: "emEstoque",
    ativo: "ativo",
    habitavel: "habitavel",
    fundada: "fundadaEm",
    fundacao: "fundadaEm",
    criado: "criadoEm",
    criado_em: "criadoEm",
  };

  const collapsed = normalized.replace(/\s+/g, "_");
  return aliases[collapsed] ?? aliases[normalized] ?? collapsed;
}

function inferFieldType(key: string): FieldType {
  if (/^(preco|ordem|quantidade|total|funcionarios|diametrokm|id)$/i.test(key)) {
    return "number";
  }

  if (/^(ativo|emestoque|emeestoque|habitavel|confirmado|evolui)$/i.test(key.replace(/[^a-z]/gi, ""))) {
    return "boolean";
  }

  if (/(data|fundadaem|criadoem)$/i.test(key)) {
    return "date";
  }

  return "string";
}

function inferRequestedFields(prompt: string) {
  const match = prompt.match(
    /(?:com|contendo|incluindo|campos?|atributos?)\s+(.+)$/i,
  );

  if (!match) return [];

  const raw = match[1]
    .split(/[.;]/)[0]
    .replace(/\be\b/gi, ",");

  const fields = raw
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .map(normalizeFieldKey)
    .filter((value, index, array) => value && array.indexOf(value) === index)
    .map((key) => ({ key, type: inferFieldType(key) }));

  return fields;
}

function shouldReturnPrimitiveList(prompt: string, preset: EntityPreset | null, fields: FieldDefinition[]) {
  if (!preset?.listValues) return false;
  if (fields.length > 1) return false;
  const normalized = normalizeText(prompt);
  return /lista/.test(normalized) && !/(com|contendo|incluindo|campos?|atributos?)/.test(normalized);
}

function buildTopicLabel(prompt: string, entity: string) {
  const topic = extractTopic(prompt);
  if (topic === "registro") {
    return titleCase(singularize(entity));
  }

  return titleCase(topic);
}

function buildString(seed: number, key: string, prompt: string, entity: string) {
  const topicLabel = buildTopicLabel(prompt, entity);

  if (entity === "pokemons") {
    if (/nome/i.test(key)) return POKEMON_NAMES[seed % POKEMON_NAMES.length];
    if (/tipo/i.test(key)) return POKEMON_TYPES[seed % POKEMON_TYPES.length];
    if (/habilidade/i.test(key)) return POKEMON_ABILITIES[seed % POKEMON_ABILITIES.length];
  }

  if (/email/i.test(key)) return `contato${seed + 1}@exemplo.dev`;
  if (/hex/i.test(key)) {
    const values = ["#FF0000", "#FF7F00", "#FFFF00", "#00A651", "#007FFF", "#4B0082", "#8F00FF"];
    return values[seed % values.length];
  }
  if (/rgb/i.test(key)) {
    const values = ["255, 0, 0", "255, 127, 0", "255, 255, 0", "0, 166, 81", "0, 127, 255", "75, 0, 130", "143, 0, 255"];
    return values[seed % values.length];
  }
  if (/categoria/i.test(key)) return GENERIC_CATEGORIES[seed % GENERIC_CATEGORIES.length];
  if (/clima/i.test(key)) return GENERIC_CLIMATES[seed % GENERIC_CLIMATES.length];
  if (/segmento/i.test(key)) return GENERIC_SEGMENTS[seed % GENERIC_SEGMENTS.length];
  if (/local/i.test(key)) return GENERIC_LOCATIONS[seed % GENERIC_LOCATIONS.length];
  if (/descricao/i.test(key)) return `${topicLabel} relacionado ao pedido informado`;
  if (/nome|titulo/i.test(key)) return `${topicLabel} ${seed + 1}`;

  return `${titleCase(key)} ${seed + 1} de ${topicLabel}`;
}

function buildNumber(seed: number, key: string) {
  if (/preco/i.test(key)) return Number((49.9 + seed * 17.35).toFixed(2));
  if (/diametro/i.test(key)) return 4000 + seed * 850;
  if (/funcionarios/i.test(key)) return 12 + seed * 8;
  if (/ordem/i.test(key)) return seed + 1;
  return seed + 1;
}

function buildBoolean(seed: number, key: string) {
  if (/evolui/i.test(key)) return seed % 3 !== 0;
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
  const preset = inferPreset(cleanPrompt);
  const entity = inferEntity(cleanPrompt, preset);
  const requestedFields = inferRequestedFields(cleanPrompt);
  const fields =
    requestedFields.length > 0
      ? requestedFields
      : preset?.defaultFields ?? [{ key: "nome", type: "string" as const }];

  const requestedCount = inferCount(cleanPrompt);
  const count = preset?.listValues ? Math.min(requestedCount, preset.listValues.length) : requestedCount;

  const items: JsonValue[] = shouldReturnPrimitiveList(cleanPrompt, preset, fields)
    ? (preset?.listValues?.slice(0, count) ?? [])
    : Array.from({ length: count }, (_, index) => buildItem(fields, index, cleanPrompt, entity));

  return {
    success: true,
    engine: "internal-mock-generator",
    prompt: cleanPrompt,
    generatedAt: new Date().toISOString(),
    summary: {
      entity,
      count,
      fields: fields.map((field) => field.key),
    },
    data: {
      [entity]: items,
    },
  };
}
