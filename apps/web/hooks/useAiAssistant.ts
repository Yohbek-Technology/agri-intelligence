'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useTranslations } from 'next-intl'

export interface Message {
  id: string
  sender: 'ai' | 'user'
  text: string
  timestamp: string
}

export interface VoiceSample {
  language: string
  transcript: string
}

export const AI_RESPONSES: Record<string, string> = {
  rust: 'Based on current micro-climate humidity (82%) in the East Shewa corridor, apply Triazole fungicide within the next 48 hours before predicted morning condensation spore bloom.',
  fertilizer: 'In Lume Woreda, forecast telemetry indicates convective rainfall tomorrow at 15:30. Apply top-dress urea between 07:00 and 12:00 to maximize nitrogen uptake by +40%.',
  price: 'Adama Central Grain Exchange reports Grade 1 Magna Teff at 9,450 ETB / Quintal (+2.7% weekly change). Wonji Secondary Depot is currently at 7,800 ETB / Q.',
  borer: 'Inspect lower stems for pinhole frass and central leaf "dead heart" wilt. If detected at threshold index >3%, apply targeted biological neem extract or dispatch Kebele DA for furrow inspection.',
  default: 'Recommendation processed: Telemetry confirms East Shewa Highland conditions are optimal for basal DAP integration. Ensure field furrows are cleared before seasonal rains.',
}

export const VOICE_SAMPLES: VoiceSample[] = [
  {
    language: 'Afan Oromo',
    transcript: '“Yeroo ammaa kana dhukkubni wajjoo (stripe rust) baay’ee waan jiruuf, dafanii qoricha farra fangasii biifaa.”',
  },
  {
    language: 'Amharic',
    transcript: '“የስንዴ ቢጫ ዋግ በሽታ ስጋት ስላለ በ48 ሰዓታት ውስጥ የፈንገስ መከላከያ መድሃኒት ይርጩ።”',
  },
  {
    language: 'English',
    transcript: '“Optimal nitrogen top-dressing window opens tomorrow at 07:00 AM in Lume Woreda.”',
  },
]

export function useAiAssistant() {
  const t = useTranslations('AiAssistant')

  const [isOpen, setIsOpen] = useState(false)
  const [mode, setMode] = useState<'text' | 'voice'>('text')
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isListening] = useState(true)
  const [voiceIndex, setVoiceIndex] = useState(0)
  const [isPlayingAudio, setIsPlayingAudio] = useState(false)

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: t('welcomeMessage'),
      timestamp: 'Just now',
    },
  ])

  const chatBottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen && mode === 'text') {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isOpen, isTyping, mode])

  const handleSend = useCallback(
    (textToSend?: string) => {
      const text = textToSend || inputValue.trim()
      if (!text) return

      const userMessage: Message = {
        id: String(Date.now()),
        sender: 'user',
        text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
      setMessages((prev) => [...prev, userMessage])
      if (!textToSend) setInputValue('')
      setIsTyping(true)

      setTimeout(() => {
        const lower = text.toLowerCase()
        let responseText = AI_RESPONSES.default!
        if (lower.includes('rust') || lower.includes('fungicide') || lower.includes('spray')) {
          responseText = AI_RESPONSES.rust!
        } else if (lower.includes('fertilizer') || lower.includes('urea') || lower.includes('lume')) {
          responseText = AI_RESPONSES.fertilizer!
        } else if (lower.includes('price') || lower.includes('teff') || lower.includes('market')) {
          responseText = AI_RESPONSES.price!
        } else if (lower.includes('borer') || lower.includes('pest') || lower.includes('stem')) {
          responseText = AI_RESPONSES.borer!
        }

        setMessages((prev) => [
          ...prev,
          {
            id: String(Date.now() + 1),
            sender: 'ai',
            text: responseText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ])
        setIsTyping(false)
      }, 600)
    },
    [inputValue]
  )

  const toggleVoiceMode = useCallback(() => {
    setMode((prev) => (prev === 'text' ? 'voice' : 'text'))
    setIsPlayingAudio(false)
  }, [])

  const selectVoiceSample = useCallback((idx: number) => {
    setVoiceIndex(idx)
    setIsPlayingAudio(false)
  }, [])

  const toggleAudio = useCallback(() => {
    setIsPlayingAudio((prev) => !prev)
  }, [])

  const currentVoiceSample = VOICE_SAMPLES[voiceIndex]!

  return {
    isOpen,
    setIsOpen,
    mode,
    setMode,
    inputValue,
    setInputValue,
    isTyping,
    isListening,
    voiceIndex,
    isPlayingAudio,
    messages,
    chatBottomRef,
    currentVoiceSample,
    handleSend,
    toggleVoiceMode,
    selectVoiceSample,
    toggleAudio,
  }
}
