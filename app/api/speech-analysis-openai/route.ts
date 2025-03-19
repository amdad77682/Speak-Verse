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
    const expectedText = formData.get("expectedText") as string
    const type = (formData.get("type") as string) || "general"

    if (!audioFile || !expectedText) {
      return NextResponse.json({ error: "Audio file and expected text are required" }, { status: 400 })
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

    // Construct prompt based on analysis type
    let prompt = ""

    switch (type) {
      case "pronunciation":
        prompt = `
          Expected text: "${expectedText}"
          User's spoken text: "${transcribedText}"
          
          You are an expert pronunciation coach. Analyze the user's pronunciation by comparing their spoken text with the expected text.
          
          Provide detailed feedback on:
          1. Accuracy of pronunciation
          2. Specific sounds or words that were mispronounced
          3. Overall clarity
          
          Format the response as a JSON object with the following structure:
          {
            "transcribedText": "The user's transcribed text",
            "overallScore": number (0-100),
            "metrics": {
              "accuracy": { "score": number, "details": string },
              "clarity": { "score": number, "details": string },
              "intonation": { "score": number, "details": string }
            },
            "feedback": string,
            "improvements": string[]
          }
        `
        break

      case "intonation":
        prompt = `
          Expected text: "${expectedText}"
          User's spoken text: "${transcribedText}"
          
          You are an expert speech coach. Analyze the user's intonation and rhythm by comparing their spoken text with the expected text.
          
          Provide detailed feedback on:
          1. Intonation patterns
          2. Rhythm and stress
          3. Natural flow of speech
          
          Format the response as a JSON object with the following structure:
          {
            "transcribedText": "The user's transcribed text",
            "overallScore": number (0-100),
            "metrics": {
              "intonation": { "score": number, "details": string },
              "rhythm": { "score": number, "details": string },
              "naturalness": { "score": number, "details": string }
            },
            "feedback": string,
            "improvements": string[]
          }
        `
        break

      case "fluency":
        prompt = `
          Expected prompt: "${expectedText}"
          User's spoken response: "${transcribedText}"
          
          You are an expert fluency coach. Analyze the user's fluency in responding to the prompt.
          
          Provide detailed feedback on:
          1. Speaking pace
          2. Hesitations and filler words
          3. Sentence structure and complexity
          4. Vocabulary usage
          
          Format the response as a JSON object with the following structure:
          {
            "transcribedText": "The user's transcribed text",
            "overallScore": number (0-100),
            "metrics": {
              "pace": { "score": number, "details": string },
              "fluency": { "score": number, "details": string },
              "complexity": { "score": number, "details": string },
              "vocabulary": { "score": number, "details": string }
            },
            "feedback": string,
            "improvements": string[]
          }
        `
        break

      default: // general
        prompt = `
          Expected text: "${expectedText}"
          User's spoken text: "${transcribedText}"
          
          You are an expert speech coach. Analyze the user's speech by comparing their spoken text with the expected text.
          
          Provide detailed feedback on:
          1. Accuracy of pronunciation
          2. Clarity of speech
          3. Overall delivery
          
          Format the response as a JSON object with the following structure:
          {
            "transcribedText": "The user's transcribed text",
            "overallScore": number (0-100),
            "metrics": {
              "accuracy": { "score": number, "details": string },
              "clarity": { "score": number, "details": string },
              "delivery": { "score": number, "details": string }
            },
            "feedback": string,
            "improvements": string[]
          }
        `
    }

    // Use OpenAI to analyze the speech
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
    console.error("Speech analysis error:", error)
    return NextResponse.json({ error: error.message || "Failed to analyze speech" }, { status: 500 })
  }
}

