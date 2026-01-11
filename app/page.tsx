"use client";

import { useState } from "react";
import { Copy, CopyCheck, Download, Loader, WandSparkles, PencilLine, ClipboardCheck } from "lucide-react";
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
    const [error, setError] = useState("");
    const [copied, setCopied] = useState(false);
    const currentYear = new Date().getFullYear();

    const formatJson = (content: any): string => {
        return typeof content === "object" ? JSON.stringify(content, null, 2) : String(content);
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
        link.download = "generated_data.json";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!textarea.trim() || loading) return;

        setLoading(true);
        setError("");
        setResult(null); 

        try {
            const response = await fetch("https://json.danielmazzeu.com.br/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ question: textarea })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Erro ao gerar JSON");
            }

            setResult(data);
        } catch (err: any) {
            setError(err.message || "Falha na conexão com o servidor.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Nav>
                <h1>AI <span>{`{Json}`}</span> Generator</h1>
                <p>Fast, free, flawless <strong>JSON generation</strong>. Just describe what you need and let the <strong>AI</strong> handle the rest.</p>
            </Nav>

            <Main>
                <form onSubmit={handleSubmit}>
                    <textarea
                        placeholder="Enter your instructions here. (On Desktop press Shift + Enter to break line)."
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
                    
                    <button type="submit" disabled={loading || !textarea.trim()}>
                        {loading ? (
                            <><Loader style={{ animation: "spin 1s linear infinite" }} /> <span>Generating...</span></>
                        ) : (
                            <><WandSparkles /> <span>AI Generate</span></>
                        )}
                    </button>
                </form>

                {result && (
                    <section>
                        <SyntaxHighlighter 
                            language="json" 
                            style={vscDarkPlus} 
                            customStyle={{ 
                                borderRadius: "10px", 
                                padding: "15px", 
                                backgroundColor: "#222",
                                maxHeight: "400px" 
                            }}
                        >
                            {formatJson(result)}
                        </SyntaxHighlighter>
                        <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
                            <button type="button" onClick={handleCopy}>
                                {copied ? <><CopyCheck /> Copied!</> : <><Copy /> Copy</>}
                            </button>
                            <button type="button" onClick={handleDownload}><Download size={16} /> Download</button>
                        </div>
                    </section>
                )}
            </Main>

            <Grid columns={3}>
                <div>
                    <PencilLine />
                    <h3>Describe</h3>
                    <p>Write what kind of data you need in plain English or any language.</p>
                </div>
                <div>
                    <WandSparkles />
                    <h3>Generate</h3>
                    <p>Our AI processes your instructions and builds a structured JSON.</p>
                </div>
                <div>
                    <ClipboardCheck />
                    <h3>Get it</h3>
                    <p>Easily copy or download the JSON file with one click.</p>
                </div>
            </Grid>

            <Footer>
                <div>
                    <a href="#">Privacy Policy</a>
                    <a href="#">Terms of use</a>
                </div>
                <small>Created and developed by Daniel Mazzeu<br/>All rights reserved {currentYear}.</small>
            </Footer>
        </>
    );
}