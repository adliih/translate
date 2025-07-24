import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "AI Translator - Powered by Gemini",
  description: "Translate text and JSON objects using Google Gemini AI. Fast, accurate, and free translation service.",
  keywords: "translation, AI, Gemini, text translation, object translation, JSON translation",
  authors: [{ name: "AI Translator" }],
  openGraph: {
    title: "AI Translator - Powered by Gemini",
    description: "Translate text and JSON objects using Google Gemini AI",
    type: "website",
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
