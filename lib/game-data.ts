export interface LevelType {
  id: number
  title: string
  description: string
  objective: string
  instructions: string[]
  successCriteria: string[]
  mission: string
}

export function getAllLevels(): LevelType[] {
  return [
    {
      id: 1,
      title: "The Echo Chamber",
      description: "Build a foundation in pronunciation and basic sentence structures",
      objective: "Learn to pronounce words clearly and accurately by repeating after the AI.",
      instructions: [
        "Listen to the AI pronounce a word",
        "Record yourself repeating the word",
        "AI will analyze your pronunciation accuracy",
        "Practice until you achieve clear pronunciation",
      ],
      successCriteria: ["Match AI's pronunciation for 5 words", "Achieve at least 70% accuracy in pronunciation"],
      mission: "Match AI's pronunciation for 5 words to unlock the next challenge!",
    },
    {
      id: 2,
      title: "Sound Match",
      description: "Improve pronunciation accuracy through AI-driven voice matching",
      objective: "Master intonation, stress patterns, and rhythm by matching phrases spoken by the AI.",
      instructions: [
        "Listen to the AI speak a phrase",
        "Record yourself matching the exact intonation and stress",
        "AI will score your similarity to the original",
        "Practice until you achieve high similarity scores",
      ],
      successCriteria: ["Score 85% or higher on 10 phrases", "Match intonation and stress patterns accurately"],
      mission: "Score 85% or higher on 10 phrases to move forward!",
    },
    {
      id: 3,
      title: "The Quick Thinker",
      description: "Train to speak without hesitation with timed prompts",
      objective: "Develop fluency and reduce hesitation when speaking spontaneously.",
      instructions: [
        "AI presents a random topic or question",
        "You have 20 seconds to respond",
        "Speak continuously without long pauses or filler words",
        "AI analyzes your fluency and hesitation",
      ],
      successCriteria: [
        "Answer 5 questions within 20 seconds each",
        "Have less than 3 hesitations per response",
        "Maintain a consistent speaking pace",
      ],
      mission: "Answer 5 questions within 20 seconds each, with less than 3 hesitations!",
    },
    {
      id: 4,
      title: "The Social Circle",
      description: "Learn from others through group speech activities",
      objective: "Practice giving and receiving feedback on speaking performance.",
      instructions: [
        "Listen to sample recordings from other learners",
        "Identify strengths and areas for improvement",
        "Provide constructive feedback with AI guidance",
        "AI evaluates the accuracy of your feedback",
      ],
      successCriteria: [
        "Give constructive feedback on 3 different aspects",
        "Identify at least 2 strengths and 2 weaknesses in each recording",
        "Provide specific suggestions for improvement",
      ],
      mission: "Give constructive feedback to a partner on 3 different aspects!",
    },
    {
      id: 5,
      title: "The Debate Arena",
      description: "Develop argumentation skills for discussions",
      objective: "Learn to present and defend opinions with logical reasoning.",
      instructions: [
        "AI presents a debate topic",
        "Present your argument clearly and persuasively",
        "AI challenges your points with follow-up questions",
        "Defend your position with strong reasoning",
      ],
      successCriteria: [
        "Present a clear, logical argument",
        "Respond effectively to follow-up challenges",
        "Use appropriate vocabulary and expressions for debates",
      ],
      mission: "Convince AI in a 3-minute debate and defend your viewpoint successfully!",
    },
    {
      id: 6,
      title: "The Storyteller's Quest",
      description: "Improve storytelling, coherence, and logical flow",
      objective: "Develop narrative skills and maintain coherence in extended speech.",
      instructions: [
        "AI gives a partial story prompt",
        "Continue the story logically for 2-3 minutes",
        "Use appropriate transitions and maintain narrative flow",
        "AI analyzes coherence, structure, and creativity",
      ],
      successCriteria: [
        "Create a coherent story with clear beginning, middle, and end",
        "Use at least 5 complex sentences",
        "Maintain logical flow throughout the narrative",
      ],
      mission: "Expand AI's story with at least 5 complex sentences and a clear ending!",
    },
    {
      id: 7,
      title: "The Guide",
      description: "Enhance teaching and mentorship skills",
      objective: "Practice explaining concepts clearly and helping others improve.",
      instructions: [
        "Review recordings from lower-level learners",
        "Identify specific pronunciation or grammar errors",
        "Record explanations and corrections",
        "AI evaluates the accuracy and helpfulness of your guidance",
      ],
      successCriteria: [
        "Correctly identify at least 3 errors in each recording",
        "Provide clear, helpful explanations",
        "Demonstrate patience and encouragement in your feedback",
      ],
      mission: "Help a Level 3 player correct 3 grammar mistakes in their speech!",
    },
    {
      id: 8,
      title: "The Adaptive Zone",
      description: "Learn based on your performance",
      objective: "Focus on improving your specific weak areas identified by AI analysis.",
      instructions: [
        "AI analyzes your past performance across all levels",
        "AI generates personalized challenges targeting your weak areas",
        "Complete targeted exercises to improve specific skills",
        "Track your improvement in previously challenging areas",
      ],
      successCriteria: [
        "Show improvement in at least 3 previously weak areas",
        "Complete all personalized challenges",
        "Achieve at least 80% accuracy in targeted exercises",
      ],
      mission: "Fix your 3 most common mistakes from past levels!",
    },
    {
      id: 9,
      title: "The World Explorer",
      description: "Practice real-world situations",
      objective: "Prepare for real-life conversations in various scenarios.",
      instructions: [
        "AI simulates real-world scenarios (ordering food, job interviews, etc.)",
        "Respond appropriately to each situation",
        "Use context-appropriate vocabulary and expressions",
        "AI evaluates naturalness and appropriateness of responses",
      ],
      successCriteria: [
        "Successfully complete 3 different role-play scenarios",
        "Use appropriate vocabulary for each context",
        "Demonstrate cultural awareness in your responses",
      ],
      mission: "Successfully complete 3 role-play scenarios with AI!",
    },
    {
      id: 10,
      title: "The Ultimate Speaker",
      description: "IELTS-Level Challenge",
      objective: "Demonstrate mastery of speaking skills in a full IELTS Speaking Test simulation.",
      instructions: [
        "Complete all three parts of the IELTS Speaking Test",
        "Part 1: Answer general questions about familiar topics",
        "Part 2: Give a 2-minute talk on a specific topic",
        "Part 3: Engage in an in-depth discussion on abstract topics",
      ],
      successCriteria: [
        "Score 7.5+ on the IELTS band scale",
        "Demonstrate fluency, coherence, vocabulary range, and grammatical accuracy",
        "Speak confidently on both concrete and abstract topics",
      ],
      mission: "Score 7.5+ in a full AI-graded IELTS Speaking simulation!",
    },
  ]
}

export function getLevelData(levelId: number): LevelType | undefined {
  return getAllLevels().find((level) => level.id === levelId)
}

