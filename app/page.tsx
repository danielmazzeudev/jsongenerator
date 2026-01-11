"use client";

import { useState } from "react";
import { ClipboardCheck, Copy, CopyCheck, Download, Loader, WandSparkles, PencilLine } from "lucide-react";
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
        try {
            return JSON.stringify(content, null, 2);
        } catch {
            return String(content);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(formatJson(result));
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
    };

    const handleDownload = () => {
        const jsonString = formatJson(result);
        const blob = new Blob([jsonString], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "generated.json";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey && !loading) {
            e.preventDefault();
            const form = e.currentTarget.form;
            if (form) form.requestSubmit();
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");
        setResult(null);

        if (!textarea.trim()) {
            setError("Please enter your instructions.");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch("https://json.danielmazzeu.com.br/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    question: textarea
                }),
            });

            if (!response.ok) {
                throw new Error("Request failed");
            }

            const data = await response.json();
            setResult(data);

        } catch (err) {
            console.error(err);
            setError("Failed to fetch response. Please try again.");
            setResult(null);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Nav>
                <h1>AI <span>&#123;Json&#125;</span> Generator</h1>
                <p>Fast, free, flawless <strong>JSON generation</strong>. Just describe what you need and let the <strong>AI</strong> handle the rest.</p>
            </Nav>

            <Main>
                <form onSubmit={handleSubmit}>
                    <textarea
                        placeholder="Enter your instructions here. (On Desktop press Shift + Enter to break line)."
                        value={textarea}
                        onKeyDown={handleKeyDown}
                        onChange={(e) => {
                            setTextarea(e.target.value);
                            if (error) setError("");
                        }}
                    />
                    {error && <span>{error}</span>}
                    <button type="submit" className="loading" disabled={loading}>
                        {loading ? (
                            <>
                                <Loader />
                                <span>Generating...</span>
                            </>
                        ) : (
                            <>
                                <WandSparkles style={{ animation: "none"}} />
                                <span>AI Generate</span>
                            </>
                        )}
                    </button>
                </form>

                {result && !error && (
                    <section>
                        <SyntaxHighlighter
                            language="json"
                            style={vscDarkPlus}
                            showLineNumbers={true}
                            customStyle={{
                                margin: 0,
                                tabSize: 4,
                                fontSize: "16px",
                                borderRadius: "10px",
                                padding: "15px",
                                backgroundColor: "#222",
                                maxHeight: "300px",
                                overflow: "auto"
                            }}
                        >
                            {formatJson(result)}
                        </SyntaxHighlighter>
                        <div style={{ display: "flex", gap: "10px" }}>
                            <button type="button" onClick={handleCopy}>
                                {copied ? (
                                    <>
                                        <CopyCheck />
                                        <span>Copied!</span>
                                    </>
                                ) : (
                                    <>
                                        <Copy />
                                        <span>Copy</span>
                                    </>
                                )}
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
