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

    // Função corrigida para lidar com a nova estrutura do backend
    const formatJson = (content: any): string => {
        if (!content) return "";
        
        // Se o backend retornou { success: true, data: {...} }
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
                body: JSON.stringify({ 
                    // Enviamos os dois campos para evitar o erro de validação
                    instruction: "You are a professional JSON generator. Return a valid JSON object based on the user request.",
                    question: textarea 
                })
            });

            const data = await response.json();

            if (!response.ok || data.success === false) {
                throw new Error(data.error || "Error generating JSON");
            }

            setResult(data);
        } catch (err: any) {
            setError(err.message || "Connection failed. Please try again.");
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
                        placeholder="Enter your instructions here. (Example: Create a list of 3 fictional planets with their diameter and climate)."
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
                            <>
                                <Loader />
                                <span>Generating...</span>
                            </>
                        ) : (
                            <>
                                <WandSparkles />
                                <span>AI Generate</span>
                            </>
                        )}
                    </button>
                </form>

                {result && !error && (
                    <section style={{ marginTop: "20px", width: "100%" }}>
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
                                backgroundColor: "#1e1e1e",
                                maxHeight: "450px",
                                overflow: "auto",
                                border: "1px solid #333"
                            }}
                        >
                            {formatJson(result)}
                        </SyntaxHighlighter>
                        
                        <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
                            <button className="action-btn" type="button" onClick={handleCopy}>
                                {copied ? <><CopyCheck size={18} /> Copied!</> : <><Copy size={18} /> Copy JSON</>}
                            </button>
                            <button className="action-btn" type="button" onClick={handleDownload}>
                                <Download size={18} /> Download .json
                            </button>
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