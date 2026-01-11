import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";
import rateLimit from "express-rate-limit";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// 1. CORS deve vir ANTES de tudo para lidar com OPTIONS
app.use(cors());

// 2. Parser de JSON com limite de 1MB
app.use(express.json({ limit: "1mb" }));

// 3. Rate Limit
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50,
    message: { error: "Muitas solicitações, tente novamente mais tarde." }
});
app.use(limiter);

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM_PROMPT = `Você é um gerador de JSON puro. 
Extraia ou gere dados com base na pergunta do usuário.
Sempre retorne um objeto JSON válido. 
Não inclua explicações ou markdown fora do JSON.`;

app.post("/", async (req, res) => {
    // LOG DE DEBUG: Verifique o terminal quando enviar a requisição
    console.log("Recebido:", req.body);

    const { question } = req.body;

    if (!question || typeof question !== "string") {
        return res.status(400).json({ 
            error: "O campo 'question' é obrigatório e deve ser uma string.",
            recebido: req.body // Retorna o que recebeu para ajudar a debugar
        });
    }

    try {
        const response = await client.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: SYSTEM_PROMPT },
                { role: "user", content: question }
            ],
            response_format: { type: "json_object" },
            temperature: 0.3
        });

        const content = JSON.parse(response.choices[0].message.content);
        return res.json(content);

    } catch (error) {
        console.error("Erro OpenAI:", error.message);
        return res.status(500).json({ error: "Erro interno ao gerar o JSON." });
    }
});

app.listen(PORT, () => console.log(`API rodando em http://localhost:${PORT}`));