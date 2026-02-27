"use client";

import { useState, useEffect } from "react";
import { Copy, CopyCheck, Clock, Download, FileCheck, Loader, WandSparkles, PencilLine, ClipboardCheck } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Nav } from "./components/Nav/Nav";
import { Main } from "./components/Main/Main";
import { Grid } from "./components/Grid/Grid";
import { Footer } from "./components/Footer/Footer";

export default function Home() {
    const [textarea, setTextarea] = useState("");
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [cooldown, setCooldown] = useState(0);
    const [error, setError] = useState("");
    const [copied, setCopied] = useState(false);
    const [downloaded, setDownloaded] = useState(false);
    const currentYear = new Date().getFullYear();

    useEffect(() => {
        if (cooldown > 0) {
            const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [cooldown]);

    const formatJson = (content: any): string => {
        if (!content) return "";
        
        const dataToDisplay = content.data !== undefined ? content.data : content;

        try {
            return JSON.stringify(dataToDisplay, null, 4);
        } catch {
            return String(dataToDisplay);
        }
    };

    const handleCopy = async () => {
        if (!result) return;
        await navigator.clipboard.writeText(formatJson(result));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = () => {
        if (!result) return;
        const blob = new Blob([formatJson(result)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "gerado.json";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        setDownloaded(true);
        setTimeout(() => setDownloaded(false), 2000);
    };

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!textarea.trim() || loading || cooldown > 0) return;

        setLoading(true);
        setError("");
        setResult(null); 

        try {
            const response = await fetch("https://json.danielmazzeu.com.br/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    instruction: "Você é um gerador de JSON profissional. Retorne um objeto JSON válido baseado na solicitação do usuário. Forneça exatamente 5 exemplos em uma lista.",
                    question: textarea 
                })
            });

            const data = await response.json();

            if (!response.ok || data.success === false) {
                throw new Error(data.error || "Erro ao gerar JSON");
            }

            setResult(data);
            setCooldown(10);
        } catch (err: any) {
            setError(err.message || "Falha na conexão. Por favor, tente novamente.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Nav>
                <h1>Gerador de <span>{`{Json}`}</span> IA</h1>
                <p>Geração de <strong>JSON</strong> rápida, gratuita e impecável. Apenas descreva o que você precisa e deixe a <strong>IA</strong> cuidar do resto.</p>
            </Nav>

            <Main>
                <form onSubmit={handleSubmit}>
                    <textarea
                        placeholder="Digite suas instruções aqui. (Exemplo: Crie uma lista de 3 planetas fictícios com seus diâmetros e climas)."
                        value={textarea}
                        onChange={(e) => {
                            setTextarea(e.target.value);
                            if (error) setError("");
                        }}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                handleSubmit();
                            }
                        }}
                    />
                    {error && <span style={{ color: "#ff4d4d", fontSize: "14px", marginTop: "10px", display: "block" }}>{error}</span>}
                    
                    <button type="submit" disabled={loading || !textarea.trim() || cooldown > 0}>
                        {loading ? (
                            <>
                                <Loader className="loading"/>
                                <span>Gerando...</span>
                            </>
                        ) : cooldown > 0 ? (
                            <>
                                <Clock />
                                <span>Aguarde {cooldown}s</span>
                            </>
                        ) : (
                            <>
                                <WandSparkles />
                                <span>Gerar com IA</span>
                            </>
                        )}
                    </button>
                </form>

                {result && !error && (
                    <section style={{ width: "100%" }}>
                        <SyntaxHighlighter
                            language="json"
                            style={vscDarkPlus}
                            showLineNumbers={true}
                            customStyle={{
                                margin: 0,
                                tabSize: 4,
                                fontSize: "15px",
                                borderRadius: "10px",
                                padding: "20px",
                                backgroundColor: "rgba(0,0,0,0.5)",
                                maxHeight: "450px",
                                overflow: "auto"
                            }}
                        >
                            {formatJson(result)}
                        </SyntaxHighlighter>
                        
                        <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
                            <button className="action-btn" type="button" onClick={handleCopy}>
                                {copied ? <><CopyCheck size={18} /> Copiado!</> : <><Copy size={18} /> Copiar</>}
                            </button>
                            <button className="action-btn" type="button" onClick={handleDownload}>
                                {downloaded ? <><FileCheck size={18} /> Baixado!</> : <><Download size={18} /> Baixar</>}
                            </button>
                        </div>
                    </section>
                )}
            </Main>

            <Grid columns={3}>
                <div>
                    <PencilLine />
                    <h3>Descreva</h3>
                    <p>Escreva que tipo de dados você precisa em português ou qualquer outro idioma.</p>
                </div>
                <div>
                    <WandSparkles />
                    <h3>Gere</h3>
                    <p>Nossa IA processa suas instruções e constrói um JSON estruturado.</p>
                </div>
                <div>
                    <ClipboardCheck />
                    <h3>Obtenha</h3>
                    <p>Copie ou baixe facilmente o arquivo JSON com apenas um clique.</p>
                </div>
            </Grid>

            <Footer>
                <small>Criado e desenvolvido por Daniel Mazzeu<br/>Todos os direitos reservados {currentYear}.</small>
            </Footer>
        </>
    );
}