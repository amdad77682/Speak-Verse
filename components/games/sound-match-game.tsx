"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Mic, Square, RefreshCw, Volume2, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { LevelType } from "@/lib/game-data";
import { generateSpeech, analyzeSpeech } from "@/lib/speech-services";

interface SoundMatchGameProps {
  level: LevelType;
  onComplete: (score: number) => void;
}

export function SoundMatchGame({ level, onComplete }: SoundMatchGameProps) {
  const [status, setStatus] = useState<
    "idle" | "listening" | "recording" | "processing" | "feedback"
  >("idle");
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [ttsAudioUrl, setTtsAudioUrl] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<any>(null);
  const [completedPhrases, setCompletedPhrases] = useState(0);
  const [progress, setProgress] = useState(0);
  const [scores, setScores] = useState<number[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

  // Sample phrases for the Sound Match level
  const phrases = [
    { text: "How are you doing today?", difficulty: "easy" },
    {
      text: "Could you tell me the way to the nearest station?",
      difficulty: "medium",
    },
    {
      text: "I'm looking forward to meeting you tomorrow.",
      difficulty: "medium",
    },
    {
      text: "The weather has been quite unpredictable lately.",
      difficulty: "medium",
    },
    {
      text: "She's considering applying for a scholarship next year.",
      difficulty: "hard",
    },
    {
      text: "Would you mind if I borrowed your dictionary?",
      difficulty: "medium",
    },
    {
      text: "They've been renovating their house since last summer.",
      difficulty: "hard",
    },
    {
      text: "I'd appreciate it if you could help me with this task.",
      difficulty: "hard",
    },
    {
      text: "We should consider all the available options before deciding.",
      difficulty: "hard",
    },
    {
      text: "The conference has been postponed until further notice.",
      difficulty: "medium",
    },
  ];

  const currentPhrase = phrases[currentPhraseIndex];

  useEffect(() => {
    // Update progress when completedPhrases changes
    setProgress((completedPhrases / 10) * 100);

    // Check if level is complete (10 phrases with average score >= 85%)
    if (completedPhrases >= 10) {
      const averageScore =
        scores.reduce((sum, score) => sum + score, 0) / scores.length;
      if (averageScore >= 85) {
        onComplete(averageScore);
        toast({
          title: "Level Complete!",
          description: `You've successfully completed Level 2 with an average score of ${Math.round(
            averageScore
          )}%`,
        });
      } else {
        toast({
          title: "Almost there!",
          description: `Your average score is ${Math.round(
            averageScore
          )}%. You need 85% to complete this level.`,
        });
        // Reset for another attempt
        setCompletedPhrases(0);
        setScores([]);
        setProgress(0);
      }
    }
  }, [completedPhrases, scores, onComplete, toast]);

  // Generate TTS audio for the current phrase
  useEffect(() => {
    async function loadTtsAudio() {
      try {
        if (currentPhrase) {
          // Clear previous audio URL
          if (ttsAudioUrl) {
            URL.revokeObjectURL(ttsAudioUrl);
          }

          // Generate new audio
          const audioUrl = await generateSpeech(currentPhrase.text, "nova");
          setTtsAudioUrl(audioUrl);
        }
      } catch (error) {
        console.error("Failed to load TTS audio:", error);
        toast({
          variant: "destructive",
          title: "Audio Error",
          description: "Failed to generate speech. Please try again.",
        });
      }
    }

    loadTtsAudio();

    // Cleanup function
    return () => {
      if (ttsAudioUrl) {
        URL.revokeObjectURL(ttsAudioUrl);
      }
    };
  }, [currentPhrase, toast]);

  const playPhrase = () => {
    setStatus("listening");

    if (ttsAudioUrl) {
      const audio = new Audio(ttsAudioUrl);

      audio.onended = () => {
        // After the phrase is spoken, wait a moment before allowing recording
        setTimeout(() => {
          setStatus("idle");
        }, 500);
      };

      audio.onerror = () => {
        toast({
          variant: "destructive",
          title: "Audio Error",
          description: "Failed to play audio. Please try again.",
        });
        setStatus("idle");
      };

      audio.play().catch((error) => {
        console.error("Error playing audio:", error);
        setStatus("idle");
      });
    } else {
      // Fallback to browser TTS if OpenAI TTS fails
      const utterance = new SpeechSynthesisUtterance(currentPhrase.text);
      utterance.rate = 0.8; // Slightly slower for clarity
      utterance.onend = () => {
        // After the phrase is spoken, wait a moment before allowing recording
        setTimeout(() => {
          setStatus("idle");
        }, 500);
      };

      speechSynthesis.speak(utterance);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
        setAudioBlob(audioBlob);
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioUrl(audioUrl);
        setStatus("processing");
        processAudio(audioBlob);
      };

      mediaRecorder.start();
      setStatus("recording");

      // Automatically stop recording after 5 seconds
      setTimeout(() => {
        if (mediaRecorder.state !== "inactive") {
          stopRecording();
        }
      }, 5000);

      toast({
        title: "Recording started",
        description: "Match the phrase as closely as possible",
      });
    } catch (error) {
      console.error("Error accessing microphone:", error);
      toast({
        variant: "destructive",
        title: "Microphone access denied",
        description: "Please allow microphone access to use this feature",
      });
    }
  };

  const stopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();

      // Stop all audio tracks
      mediaRecorderRef.current.stream
        .getTracks()
        .forEach((track) => track.stop());
    }
  };

  const processAudio = async (blob: Blob) => {
    try {
      // Use our speech analysis service
      const result = await analyzeSpeech(
        blob,
        currentPhrase.text,
        "intonation"
      );

      // Add score to scores array
      setScores((prev) => [...prev, result.overallScore]);

      // Increment completed phrases counter
      setCompletedPhrases((prev) => prev + 1);

      setFeedback(result);
      setStatus("feedback");
    } catch (error) {
      console.error("Error processing audio:", error);
      toast({
        variant: "destructive",
        title: "Processing error",
        description: "There was an error analyzing your speech",
      });
      setStatus("idle");
    }
  };

  const nextPhrase = () => {
    // Move to next phrase or loop back to beginning if we've gone through all phrases
    setCurrentPhraseIndex((prev) => (prev + 1) % phrases.length);
    setStatus("idle");
    setAudioBlob(null);
    setAudioUrl(null);
    setFeedback(null);
  };

  const playAudio = () => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play();
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Level 2: Sound Match</CardTitle>
          {status === "recording" && (
            <Badge
              variant="outline"
              className="animate-pulse bg-red-500/10 text-red-500"
            >
              Recording
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              Progress: {completedPhrases}/10 phrases
            </span>
            <span className="text-sm font-medium">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Current Phrase */}
        <div className="rounded-lg border bg-muted/50 p-6 text-center">
          <h3 className="mb-2 font-medium">Match this phrase:</h3>
          <p className="text-xl font-medium">{currentPhrase.text}</p>
          <div className="mt-2 flex justify-center">
            <Badge variant="outline">
              {currentPhrase.difficulty === "easy"
                ? "Easy"
                : currentPhrase.difficulty === "medium"
                ? "Medium"
                : "Hard"}
            </Badge>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={playPhrase}
            disabled={
              status === "listening" ||
              status === "recording" ||
              status === "processing"
            }
          >
            <Volume2 className="mr-2 h-4 w-4" /> Listen
          </Button>
        </div>

        {/* Recording Visualization */}
        {status === "recording" && (
          <div className="flex h-20 items-center justify-center">
            <div className="flex items-end space-x-1">
              {Array.from({ length: 20 }).map((_, i) => (
                <div
                  key={i}
                  className="w-2 bg-primary"
                  style={{
                    height: `${Math.random() * 100}%`,
                    animation: "pulse 0.5s infinite",
                    animationDelay: `${i * 0.05}s`,
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Processing State */}
        {status === "processing" && (
          <div className="flex flex-col items-center justify-center space-y-4 py-8">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-center text-muted-foreground">
              Analyzing your speech pattern...
            </p>
          </div>
        )}

        {/* Feedback Section */}
        {status === "feedback" && feedback && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Your Recording</h3>
              <Button variant="outline" size="sm" onClick={playAudio}>
                <Volume2 className="mr-2 h-4 w-4" /> Play
              </Button>
            </div>

            <div className="rounded-lg border p-4">
              <div className="text-center mb-4">
                <h4 className="text-lg font-medium">
                  {feedback.overallScore >= 85
                    ? "Excellent Match!"
                    : "Good Attempt!"}
                </h4>
                <p className="text-muted-foreground">
                  {feedback.overallScore >= 85
                    ? "Your intonation and pronunciation were very close to the original."
                    : "Keep practicing to match the intonation pattern more closely."}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Similarity Score</span>
                  <Badge
                    variant={
                      feedback.overallScore >= 85 ? "default" : "outline"
                    }
                  >
                    {feedback.overallScore}%
                  </Badge>
                </div>
                <Progress
                  value={feedback.overallScore}
                  className={cn(
                    "h-2",
                    feedback.overallScore >= 85
                      ? "bg-green-500"
                      : feedback.overallScore >= 70
                      ? "bg-yellow-500"
                      : "bg-red-500"
                  )}
                />
              </div>

              <div className="grid gap-4 mt-4 sm:grid-cols-2">
                {Object.entries(feedback.metrics).map(
                  ([key, value]: [string, any]) => (
                    <div key={key}>
                      <div className="mb-1 flex items-center justify-between">
                        <span className="text-sm font-medium">{key}</span>
                        <Badge variant="outline">{value.score}%</Badge>
                      </div>
                      <Progress value={value.score} className="h-2" />
                    </div>
                  )
                )}
              </div>

              <div className="mt-4">
                <h4 className="mb-2 font-medium">Feedback</h4>
                <p className="text-muted-foreground">{feedback.feedback}</p>
              </div>

              {feedback.improvements && feedback.improvements.length > 0 && (
                <div className="mt-4">
                  <h4 className="mb-2 font-medium">Areas for Improvement</h4>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    {feedback.improvements.map(
                      (item: string, index: number) => (
                        <li key={index}>{item}</li>
                      )
                    )}
                  </ul>
                </div>
              )}

              {feedback.transcribedText && (
                <div className="mt-4">
                  <h4 className="mb-2 font-medium">What We Heard</h4>
                  <p className="text-sm text-muted-foreground italic">
                    "{feedback.transcribedText}"
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        {status === "idle" && (
          <>
            <Button variant="outline" onClick={playPhrase}>
              <Volume2 className="mr-2 h-4 w-4" /> Listen
            </Button>
            <Button onClick={startRecording} disabled={status === "listening"}>
              <Mic className="mr-2 h-4 w-4" /> Record
            </Button>
          </>
        )}
        {status === "recording" && (
          <Button
            variant="destructive"
            onClick={stopRecording}
            className="w-full"
          >
            <Square className="mr-2 h-4 w-4" /> Stop Recording
          </Button>
        )}
        {status === "feedback" && (
          <>
            <Button variant="outline" onClick={startRecording}>
              <RefreshCw className="mr-2 h-4 w-4" /> Try Again
            </Button>
            <Button onClick={nextPhrase}>
              Next Phrase <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
}
