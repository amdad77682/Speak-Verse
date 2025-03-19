import type React from "react"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { GameProvider } from "@/context/game-context"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "SpeakVerse - AI-Powered Speaking Game",
  description: "Improve your speaking skills with AI-powered feedback and gamified learning",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <GameProvider>
            {children}
            <Toaster />
          </GameProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}



import './globals.css'