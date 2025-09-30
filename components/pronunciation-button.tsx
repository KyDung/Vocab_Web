"use client"

import { Volume2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PronunciationButtonProps {
  text: string
  className?: string
}

export function PronunciationButton({ text, className = "" }: PronunciationButtonProps) {
  const speak = () => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = "en-US"
      utterance.rate = 0.8
      speechSynthesis.speak(utterance)
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={speak}
      className={`pronunciation-btn ${className}`}
      title={`Phát âm "${text}"`}
    >
      <Volume2 className="w-4 h-4" />
    </Button>
  )
}
