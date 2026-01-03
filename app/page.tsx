"use client";

import { useState } from "react";
import { ClipboardCheck, Loader, PencilLine, Sparkles } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Nav } from "./components/Nav/Nav";
import { Main } from "./components/Main/Main";
import { Grid } from "./components/Grid/Grid";
import { Footer } from "./components/Footer/Footer";

export default function Home() {
    const [textarea, setTextarea] = useState("");
    const [result, setResult] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const currentYear = new Date().getFullYear();

    const formatJson = (content: object | string): string => {
        if (typeof content === "object") return JSON.stringify(content, null, 2);
        try {
            return JSON.stringify(JSON.parse(content), null, 2);
        } catch {
            return content;
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(formatJson(result));
        alert("Copied to clipboard!");
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");

        if (!textarea.trim()) {
            setError("Please enter your instructions before generating.");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch("https://gptagent.danielmazzeu.com.br/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    instruction: "you are an agent that extrat information or get information to generate a json",
                    question: textarea,
                    jsonMode: true
                }),
            });

            const data = await response.json();
            setResult(data.response);
        } catch {
            setError("Failed to fetch response. Please try again.");
            setResult("");
            setResult("Failed to fetch response.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Nav>
                <h1>AI Json Generator</h1>
                <p>Fast, flawless <strong>JSON generation</strong>. Just describe what you need and let the <strong>AI</strong> handle the rest.</p>
            </Nav>
            <Main>
                <form onSubmit={handleSubmit}>
                    <textarea placeholder="Enter your instructions here..." value={textarea} onChange={(e) => {
                        setTextarea(e.target.value);
                        if (error) setError("");
                    }}/>
                    {error && <span>{error}</span>}
                    <button type="submit" disabled={loading}>
                        {loading ? (
                            <>
                                <Loader className="animate-spin" size={18} />
                                <span>Processing...</span>
                            </>
                        ) : (
                            "AI Generate Json"
                        )}
                    </button>
                </form>
                {result && !error && (
                    <section>
                        <SyntaxHighlighter language="json" style={vscDarkPlus} showLineNumbers={true} customStyle={{ margin: 0, tabSize: 4, fontSize: "16px", borderRadius: "10px", padding: "15px", backgroundColor: "#222", maxHeight: "300px", overflow: "auto" }}>
                            {formatJson(result)}
                        </SyntaxHighlighter>
                        <button type="button" onClick={handleCopy} className="copy-button">Copy Json</button>
                    </section>
                )}
            </Main>

            <Grid columns={3}>
                <div>
                    <PencilLine size={24} />
                    <h3>Describe</h3>
                    <p>Write what kind of data you need in plain English or any language.</p>
                </div>
                <div>
                    <Sparkles size={24} />
                    <h3>Generate</h3>
                    <p>Our AI processes your instructions and builds a structured JSON.</p>
                </div>
                <div>
                    <ClipboardCheck size={24} />
                    <h3>Copy & Use</h3>
                    <p>Copy the result with one click and paste it directly into your project.</p>
                </div>
            </Grid>
            
            <Footer>
                <small>Created and developed by Daniel Mazzeu<br/>All rights reserved {currentYear}.</small>
            </Footer>
        </>
    );
}