'use client'

import { useState, useEffect } from 'react'
import { Card } from "@/components/ui/card"
import { MessageBubble } from './message-bubble'
import { MessageInput } from './message-input'

interface Message {
    id: string
    content: string
    role: 'user' | 'assistant'
}

interface ChatInterfaceProps {
    topic: string
}

export function ChatInterface({ topic }: ChatInterfaceProps) {
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        if (topic) {
            const initialMessage: Message = {
                id: Date.now().toString(),
                content: `Welcome! Let's talk about ${topic}.`,
                role: 'assistant',
            }
            setMessages([initialMessage])
        }
    }, [topic])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!input.trim() || isLoading) return

        const userMessage: Message = {
            id: Date.now().toString(),
            content: input,
            role: 'user',
        }

        setMessages((prev) => [...prev, userMessage])
        setInput('')
        setIsLoading(true)

        try {
            const response = await fetch('/api/ai', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    inputText: `Please focus on ${topic} while discussing: ${input}`,
                }),
            })

            const data = await response.json()

            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                content: data.message || "I couldn't process your request. Please try again.",
                role: 'assistant',
            }

            setMessages((prev) => [...prev, assistantMessage])
        } catch (error) {
            console.error('Error:', error)
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                content: "I'm sorry, there was an error processing your request.",
                role: 'assistant',
            }
            setMessages((prev) => [...prev, errorMessage])
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Card className="flex flex-col h-[calc(100vh-140px)] bg-white/80 backdrop-blur-sm border-pink-200">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                    <MessageBubble key={message.id} content={message.content} role={message.role} />
                ))}
                {isLoading && (
                    <div className="flex items-center space-x-2">
                        <div className="animate-pulse h-2 w-2 rounded-full bg-pink-400" />
                        <div className="animate-pulse h-2 w-2 rounded-full bg-pink-400 animation-delay-200" />
                        <div className="animate-pulse h-2 w-2 rounded-full bg-pink-400 animation-delay-400" />
                    </div>
                )}
            </div>
            <MessageInput
                input={input}
                isLoading={isLoading}
                onSubmit={handleSubmit}
                onInputChange={(e) => setInput(e.target.value)}
            />
        </Card>
    )
}
