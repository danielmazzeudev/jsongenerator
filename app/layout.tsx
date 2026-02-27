import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next"
import "./globals.css";
import Background from "./components/Background/Background";
import Security from "./security";

export const viewport: Viewport = {
    colorScheme: 'light',
};

export const metadata: Metadata = {
    title: "AI JSON Generator",
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
    authors: [{ name: "Daniel Mazzeu" }],
    robots: {
        index: true,
        follow: true,
        googleBot: { 
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    icons: { 
        icon: "/favicon.ico",
        shortcut: "/favicon.ico",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" style={{ colorScheme: 'light' }}>
            <body suppressHydrationWarning={true}>
                <Security />
                <Background />
                <Analytics/>
                {children}
            </body>
        </html>
    );
}
