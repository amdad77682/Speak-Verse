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
    const storyPrompt = formData.get("storyPrompt") as string
    const criteriaStr = (formData.get("criteria") as string) || "[]"
    const criteria = JSON.parse(criteriaStr)

    if (!audioFile || !storyPrompt) {
      return NextResponse.json({ error: "Audio file and story prompt are required" }, { status: 400 })
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

    // Default criteria if none provided
    const evaluationCriteria =
      criteria.length > 0
        ? criteria
        : [
          "Coherence and structure",
          "Creativity and originality",
          "Use of descriptive language",
          "Character development",
          "Narrative flow",
        ]

    // Use OpenAI to evaluate the story
    const prompt = `
      Story Prompt: "${storyPrompt}"
      
      User's Story: "${transcribedText}"

      You are an expert storytelling coach. Evaluate the user's story based on the following criteria:
      ${evaluationCriteria.map((criterion: string, index: number) => `${index + 1}. ${criterion}`).join("\n")}

      Format the response as a JSON object with the following structure:
      {
        "transcribedText": "The user's transcribed story",
        "overallScore": number (0-100),
        "metrics": {
          ${evaluationCriteria
        .map((criterion: string) => {
          const key = criterion.toLowerCase().replace(/\s+/g, "_")
          return `"${key}": { "score": number, "details": string }`
        })
        .join(",\n          ")}
        },
        "feedback": string,
        "improvements": string[],
        "strengths": string[]
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
    console.error("Story evaluation error:", error)
    return NextResponse.json({ error: error.message || "Failed to evaluate story" }, { status: 500 })
  }
}

