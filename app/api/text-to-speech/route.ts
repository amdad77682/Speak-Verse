import { type NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"

export async function POST(request: NextRequest) {
    try {
        // Check if OpenAI API key is available
        if (!process.env.NEXT_PUBLIC_OPENAI_API_KEY) {
            return NextResponse.json(
                { error: "OpenAI API key is not configured. Please add it to your environment variables." },
                { status: 500 },
            )
        }

        // Initialize OpenAI client
        const openai = new OpenAI({
            apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
        })

        // Parse request body
        const { text, voice = "alloy" } = await request.json()

        if (!text) {
            return NextResponse.json({ error: "Text is required" }, { status: 400 })
        }

        // Call OpenAI TTS API
        const audioResponse = await openai.audio.speech.create({
            model: "tts-1",
            voice: voice, // Options: alloy, echo, fable, onyx, nova, shimmer
            input: text,
        })

        // Get audio data as buffer
        const buffer = Buffer.from(await audioResponse.arrayBuffer())

        // Return audio data with appropriate headers
        return new NextResponse(buffer, {
            headers: {
                "Content-Type": "audio/mpeg",
                "Content-Length": buffer.length.toString(),
            },
        })
    } catch (error: any) {
        console.error("Text-to-speech error:", error)
        return NextResponse.json({ error: error.message || "Failed to generate speech" }, { status: 500 })
    }
}

