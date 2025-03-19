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
    const topic = formData.get("topic") as string
    const context = (formData.get("context") as string) || ""
    const previousExchangesStr = (formData.get("previousExchanges") as string) || "[]"
    const previousExchanges = JSON.parse(previousExchangesStr)

    if (!audioFile || !topic) {
      return NextResponse.json({ error: "Audio file and topic are required" }, { status: 400 })
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
      Topic: ${topic}
      ${context ? `Context: ${context}\n` : ""}
      User's response: "${transcribedText}"

      You are an expert debate and speaking coach. Analyze the user's response to the topic.
      Provide detailed feedback on:
      1. Argument quality and logical structure
      2. Use of evidence and examples
      3. Persuasiveness and rhetoric
      4. Clarity and conciseness
      5. Potential counterarguments they should address

      Also provide a follow-up question or challenge to their position that would help them develop their argument further.

      Format the response as a JSON object with the following structure:
      {
        "transcribedText": "The user's transcribed text",
        "overallScore": number (0-100),
        "metrics": {
          "clarity": { "score": number, "details": string },
          "reasoning": { "score": number, "details": string },
          "vocabulary": { "score": number, "details": string },
          "persuasiveness": { "score": number, "details": string }
        },
        "feedback": string,
        "improvements": string[],
        "followUpQuestion": string
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

    return NextResponse.json(analysis)
  } catch (error: any) {
    console.error("AI feedback error:", error)
    return NextResponse.json({ error: error.message || "Failed to analyze response" }, { status: 500 })
  }
}

