import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next"
import "./globals.css";

export const metadata: Metadata = {
    title: "AI JSON Generator | Instant Data Structure Creation",
    description: "Generate complex JSON structures instantly using AI. The ultimate tool for developers to create mock data, schemas, and custom data structures with natural language.",
    keywords: [
        "AI JSON Generator",
        "JSON generator",
        "Artificial Intelligence",
        "Mock data generator",
        "JSON schema creator",
        "Web development tools",
        "Developer utility",
        "AI data generation",
        "API mocking",
        "Next.js tool"
    ],
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body>
                <Analytics/>
                {children}
            </body>
        </html>
    );
}
