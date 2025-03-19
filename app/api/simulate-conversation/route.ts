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

    // Initialize OpenAI client inside the handler function
    const openai = new OpenAI({
      apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
    })

    const formData = await request.formData()
    const audioFile = formData.get("audio") as File
    const scenario = formData.get("scenario") as string
    const role = formData.get("role") as string
    const previousExchangesStr = (formData.get("previousExchanges") as string) || "[]"
    const previousExchanges = JSON.parse(previousExchangesStr)

    if (!audioFile || !scenario || !role) {
      return NextResponse.json({ error: "Audio file, scenario, and role are required" }, { status: 400 })
    }

    // Convert audio to buffer
    const arrayBuffer = await audioFile.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Transcribe audio using OpenAI Whisper API
    const transcription = await openai.audio.transcriptions.create({
      file: new File([buffer], "audio.webm", { type: audioFile.type }),
      model: "whisper-1",
    })

    const transcribedText = transcription.text

    // Construct conversation history
    let conversationHistory = ""
    if (previousExchanges.length > 0) {
      conversationHistory = "Previous exchanges:\n"
      previousExchanges.forEach((exchange: string, index: number) => {
        conversationHistory += `${index + 1}. ${exchange}\n`
      })
      conversationHistory += "\n"
    }

    // Use OpenAI to analyze the response and provide feedback
    const prompt = `
      ${conversationHistory}
      Scenario: ${scenario}
      Your role: ${role}
      User's response: "${transcribedText}"

      You are an expert language and communication coach. Analyze the user's response in this real-world scenario.
      
      First, generate a natural response that a person in your role would give to the user's statement.
      
      Then, evaluate the user's communication based on:
      1. Appropriateness for the context
      2. Clarity and effectiveness
      3. Use of relevant vocabulary and expressions
      4. Cultural awareness and politeness
      5. Overall communication success

      Format the response as a JSON object with the following structure:
      {
        "transcribedText": "The user's transcribed text",
        "aiResponse": "Your natural response to the user",
        "overallScore": number (0-100),
        "metrics": {
          "appropriateness": { "score": number, "details": string },
          "clarity": { "score": number, "details": string },
          "vocabulary": { "score": number, "details": string },
          "cultural_awareness": { "score": number, "details": string }
        },
        "feedback": string,
        "improvements": string[],
        "alternativeResponses": string[]
      }
    `

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    })

    const analysisText = completion.choices[0].message.content
    let analysis

    try {
      analysis = JSON.parse(analysisText || "{}")
      analysis.transcribedText = transcribedText // Ensure the transcribed text is included
    } catch (e) {
      console.error("Error parsing AI response:", e)
      return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 })
    }

    // Generate speech for the AI response
    try {
      const aiResponseAudioUrl = await generateSpeech(analysis.aiResponse)
      analysis.aiResponseAudioUrl = aiResponseAudioUrl
    } catch (e) {
      console.error("Error generating speech for AI response:", e)
      // Continue without the audio URL
    }

    return NextResponse.json(analysis)
  } catch (error: any) {
    console.error("Conversation simulation error:", error)
    return NextResponse.json({ error: error.message || "Failed to simulate conversation" }, { status: 500 })
  }
}

// Helper function to generate speech
async function generateSpeech(text: string): Promise<string> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/text-to-speech`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text, voice: "alloy" }),
    })

    if (!response.ok) {
      throw new Error("Failed to generate speech")
    }

    // In a real implementation, we would return a URL to the generated audio
    // For this example, we'll just return a placeholder
    return "/api/text-to-speech?text=" + encodeURIComponent(text)
  } catch (error) {
    console.error("Error generating speech:", error)
    throw error
  }
}

