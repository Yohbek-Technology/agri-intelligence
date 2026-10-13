'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bot,
  X,
  Send,
  Mic,
  MessageSquare,
  Radio,
  Play,
  Square,
} from 'lucide-react'

interface Message {
  id: string
  sender: 'ai' | 'user'
  text: string
  timestamp: string
}


const AI_RESPONSES: Record<string, string> = {
  rust: 'Based on current micro-climate humidity (82%) in the East Shewa corridor, apply Triazole fungicide within the next 48 hours before predicted morning condensation spore bloom.',
  fertilizer: 'In Lume Woreda, forecast telemetry indicates convective rainfall tomorrow at 15:30. Apply top-dress urea between 07:00 and 12:00 to maximize nitrogen uptake by +40%.',
  price: 'Adama Central Grain Exchange reports Grade 1 Magna Teff at 9,450 ETB / Quintal (+2.7% weekly change). Wonji Secondary Depot is currently at 7,800 ETB / Q.',
  borer: 'Inspect lower stems for pinhole frass and central leaf "dead heart" wilt. If detected at threshold index >3%, apply targeted biological neem extract or dispatch Kebele DA for furrow inspection.',
  default: 'Recommendation processed: Telemetry confirms East Shewa Highland conditions are optimal for basal DAP integration. Ensure field furrows are cleared before seasonal rains.'
}

const VOICE_SAMPLES = [
  {
    language: 'Afan Oromo',
    transcript: '“Yeroo ammaa kana dhukkubni wajjoo (stripe rust) baay’ee waan jiruuf, dafanii qoricha farra fangasii biifaa.”',
    english: 'High stripe rust alert. Apply triazole fungicide within 48h before spore bloom.'
  },
  {
    language: 'Amharic (አማርኛ)',
    transcript: '“የስንዴ ቢጫ ዋግ በሽታ ስጋት ስላለ በ48 ሰዓታት ውስጥ የፈንገስ መከላከያ መድሃኒት ይርጩ።”',
    english: 'Wheat yellow rust risk detected. Spray prophylactic fungicide within 48 hours.'
  },
  {
    language: 'English',
    transcript: '“Lume Woreda convective rain forecasted at 15:30 tomorrow. Optimal nitrogen urea window opens at 07:00.”',
    english: 'Optimal nitrogen top-dressing window opens tomorrow at 07:00 AM.'
  }
]

export function AiAssistantPopup() {
  const [isOpen, setIsOpen] = useState(false)
  const [mode, setMode] = useState<'text' | 'voice'>('text') // Conditional mode
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)

  // Voice mode state
  const [isListening, setIsListening] = useState(true)
  const [voiceIndex, setVoiceIndex] = useState(0)
  const [isPlayingAudio, setIsPlayingAudio] = useState(false)

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: 'Selam! I am your AgriIntel Agronomic Copilot. Ask me about Highland crop disease diagnosis, 7-day spray timing, or market grain prices.',
      timestamp: 'Just now'
    }
  ])
  const chatBottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen && mode === 'text') {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isOpen, isTyping, mode])

  const handleSend = (textToSend?: string) => {
    const text = textToSend || inputValue.trim()
    if (!text) return

    const userMessage: Message = {
      id: String(Date.now()),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    setMessages((prev) => [...prev, userMessage])
    if (!textToSend) setInputValue('')
    setIsTyping(true)

    setTimeout(() => {
      let responseText = AI_RESPONSES.default!
      const lower = text.toLowerCase()
      if (lower.includes('rust') || lower.includes('fungicide') || lower.includes('spray')) {
        responseText = AI_RESPONSES.rust!
      } else if (lower.includes('fertilizer') || lower.includes('urea') || lower.includes('window') || lower.includes('lume')) {
        responseText = AI_RESPONSES.fertilizer!
      } else if (lower.includes('price') || lower.includes('teff') || lower.includes('market') || lower.includes('adama')) {
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
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ])
      setIsTyping(false)
    }, 600)
  }

  const currentVoiceSample = VOICE_SAMPLES[voiceIndex]!

  return (
    <>
      {/* Floating Trigger Button in Bottom-Right Corner */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle Agronomic AI Assistant"
          className="relative w-14 h-14 rounded-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer border-2 border-white/30 shadow-[0_4px_16px_rgba(0,0,0,0.15)] select-none"
        >
          {isOpen ? (
            <X className="w-6 h-6" />
          ) : (<Bot className="w-6 h-6" />)}
        </button>
      </div>

      {/* Thick Border, Very Little Shadow, Pure White Popup Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.96 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="fixed bottom-24 right-6 z-50 w-[380px] sm:w-[420px] max-w-[calc(100vw-2rem)] h-[550px] max-h-[82vh] bg-white rounded-3xl border-[3px] border-slate-300 shadow-[0_4px_22px_-4px_rgba(0,0,0,0.08)] flex flex-col overflow-hidden text-slate-900"
          >
            {/* Header: Mode Toggle + Close Button */}
            <div className="px-5 py-3.5 border-b-2 border-slate-200 bg-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-[var(--color-primary-light)] text-[var(--color-primary)] flex items-center justify-center border border-[var(--color-primary)]/20 font-bold">
                  {mode === 'voice' ? <Radio className="w-4 h-4 text-[var(--color-primary)] animate-pulse" /> : <Bot className="w-5 h-5" />}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-sm text-slate-900">AgriIntel Copilot</h3>
                    <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 block">
                    {mode === 'voice' ? 'Voice Telemetry Engine • Active' : 'Autonomous Agronomic Chat • Online'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="w-7 h-7 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                  aria-label="Close assistant"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* =========================================================================
                CONDITIONAL BODY CONTENT:
                - If mode === 'voice': Sound Wave Indicator Interface
                - If mode === 'text': Traditional Text Chat Conversation
                ========================================================================= */}
            {mode === 'voice' ? (
              /* VOICE SOUND INDICATOR MODE */
              <div className="flex-1 flex flex-col justify-between p-6 bg-white overflow-y-auto">
                {/* Top Status & Dialect Selection */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
                      Listening Mode Active
                    </span>

                    {/* Dialect Switcher */}
                    <div className="flex items-center gap-1">
                      {VOICE_SAMPLES.map((sample, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            setVoiceIndex(i)
                            setIsPlayingAudio(false)
                          }}
                          className={`px-2 py-0.5 rounded-full text-[10px] font-mono border transition-all cursor-pointer ${voiceIndex === i
                            ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)] font-bold'
                            : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                            }`}
                        >
                          {sample.language.split(' ')[0]}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Central Sound Waveform Indicator */}
                  <div className="bg-slate-50 rounded-2xl border-2 border-slate-200 p-6 flex flex-col items-center justify-center text-center space-y-4 relative overflow-hidden">
                    {/* Dancing Audio Frequency Wave Bars */}
                    <div className="flex items-center justify-center gap-1.5 h-20 w-full px-4">
                      {[35, 65, 90, 45, 80, 100, 60, 95, 40, 75, 90, 55, 75, 90, 45, 70, 85, 40, 60].map((height, idx) => (
                        <motion.span
                          key={idx}
                          animate={{
                            height: isPlayingAudio || isListening ? [`${height * 0.3}%`, `${height}%`, `${height * 0.4}%`] : '15%',
                            opacity: isPlayingAudio || isListening ? [0.6, 1, 0.7] : 0.3
                          }}
                          transition={{
                            duration: 0.6 + (idx % 4) * 0.15,
                            repeat: Infinity,
                            ease: 'easeInOut',
                            delay: (idx % 6) * 0.08
                          }}
                          className="flex-1 rounded-full bg-[var(--color-primary)] max-w-[5px]"
                        />
                      ))}
                    </div>

                    <div className="space-y-1">
                      <span className="text-xs font-bold text-slate-900 block font-mono">
                        {isPlayingAudio ? 'Broadcasting Audio Advice...' : 'Listening to Speech Input...'}
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono block">
                        Channel: Ethio Telecom Voice Bridge (Afan Oromo / Amharic / EN)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Voice Action Controls */}
                <div className="pt-2 flex items-center justify-between gap-3 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all shadow-xs"
                  >
                    {isPlayingAudio ? (
                      <>
                        <Square className="w-3.5 h-3.5 fill-current" />
                        <span>Stop Audio</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Play Advice Audio</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setMode('text')}
                    className="py-2.5 px-4 rounded-xl border-2 border-slate-200 hover:bg-slate-100 text-xs font-semibold text-slate-700 flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Chat Text</span>
                  </button>
                </div>
              </div>
            ) : (
              /* TRADITIONAL TEXT CHAT MODE */
              <div className="flex-1 flex flex-col justify-between overflow-hidden bg-white">
                {/* Chat Message List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-white text-xs">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[85%] px-4 py-2.5 rounded-2xl leading-relaxed ${msg.sender === 'user'
                          ? 'bg-[var(--color-primary)] text-white rounded-br-xs'
                          : 'bg-slate-50 border border-slate-200 text-slate-800 rounded-bl-xs'
                          }`}
                      >
                        {msg.text}
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono mt-1 px-1">
                        {msg.timestamp}
                      </span>
                    </div>
                  ))}

                  {isTyping && (
                    <div className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 w-fit text-slate-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)] animate-bounce" />
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)] animate-bounce [animation-delay:0.2s]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)] animate-bounce [animation-delay:0.4s]" />
                    </div>
                  )}
                  <div ref={chatBottomRef} />
                </div>

                {/* Text Input Bar with Mic Trigger */}
                <div className="p-3 border-t-2 border-slate-200 bg-white">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      handleSend()
                    }}
                    className="flex items-center gap-2"
                  >
                    {/* Voice mode quick toggle */}
                    <button
                      type="button"
                      onClick={() => {
                        setMode('voice')
                        setIsPlayingAudio(false)
                      }}
                      className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-[var(--color-primary-light)] text-slate-600 hover:text-[var(--color-primary)] border border-slate-200 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                      title="Switch to Voice Mode"
                    >
                      <Mic className="w-4 h-4" />
                    </button>

                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="Ask agronomic question or diagnostic query..."
                      className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[var(--color-primary)] text-xs bg-slate-50 text-slate-900 placeholder:text-slate-400"
                    />

                    <button
                      type="submit"
                      disabled={!inputValue.trim()}
                      className="w-9 h-9 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] disabled:opacity-40 text-white flex items-center justify-center transition-all cursor-pointer shrink-0"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
