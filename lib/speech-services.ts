// Function to generate speech from text using OpenAI TTS
export async function generateSpeech(text: string, voice = "alloy"): Promise<string> {
  try {
    const response = await fetch("/api/text-to-speech", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text, voice }),
    })

    if (!response.ok) {
      throw new Error("Failed to generate speech")
    }

    // Create a blob URL from the audio data
    const audioBlob = await response.blob()
    return URL.createObjectURL(audioBlob)
  } catch (error) {
    console.error("Error generating speech:", error)
    throw error
  }
}

// Function to analyze speech recording using OpenAI
export async function analyzeSpeech(audioBlob: Blob, expectedText: string, type = "general"): Promise<any> {
  try {
    const formData = new FormData()
    formData.append("audio", audioBlob)
    formData.append("expectedText", expectedText)
    formData.append("type", type)

    const response = await fetch("/api/speech-analysis-openai", {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      throw new Error("Failed to analyze speech")
    }

    return await response.json()
  } catch (error) {
    console.error("Error analyzing speech:", error)
    throw error
  }
}

// Function to get AI feedback on a debate or discussion
export async function getAIFeedback(
  audioBlob: Blob,
  topic: string,
  context = "",
  previousExchanges: string[] = [],
): Promise<any> {
  try {
    const formData = new FormData()
    formData.append("audio", audioBlob)
    formData.append("topic", topic)
    formData.append("context", context)

    if (previousExchanges.length > 0) {
      formData.append("previousExchanges", JSON.stringify(previousExchanges))
    }

    const response = await fetch("/api/ai-feedback", {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      throw new Error("Failed to get AI feedback")
    }

    return await response.json()
  } catch (error) {
    console.error("Error getting AI feedback:", error)
    throw error
  }
}

// Function to evaluate storytelling
export async function evaluateStory(audioBlob: Blob, storyPrompt: string, criteria: string[] = []): Promise<any> {
  try {
    const formData = new FormData()
    formData.append("audio", audioBlob)
    formData.append("storyPrompt", storyPrompt)

    if (criteria.length > 0) {
      formData.append("criteria", JSON.stringify(criteria))
    }

    const response = await fetch("/api/evaluate-story", {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      throw new Error("Failed to evaluate story")
    }

    return await response.json()
  } catch (error) {
    console.error("Error evaluating story:", error)
    throw error
  }
}

// Function to simulate real-world conversation
export async function simulateConversation(
  audioBlob: Blob,
  scenario: string,
  role: string,
  previousExchanges: string[] = [],
): Promise<any> {
  try {
    const formData = new FormData()
    formData.append("audio", audioBlob)
    formData.append("scenario", scenario)
    formData.append("role", role)

    if (previousExchanges.length > 0) {
      formData.append("previousExchanges", JSON.stringify(previousExchanges))
    }

    const response = await fetch("/api/simulate-conversation", {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      throw new Error("Failed to simulate conversation")
    }

    return await response.json()
  } catch (error) {
    console.error("Error simulating conversation:", error)
    throw error
  }
}

