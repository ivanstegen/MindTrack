'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageCircle, Send, Loader2, Bot, User, Plus, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/lib/store/authStore'

interface Message {
  id?: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface Conversation {
  id: string
  title: string
  updated_at: string
}

interface JournalEntry {
  entry_date: string
  mood_label: string | null
  mood_score: number | null
}

interface Challenge {
  id: string
  description: string
}

interface ChatClientProps {
  recentJournal: JournalEntry[]
  activeChallenges: Challenge[]
}

export function ChatClient({ recentJournal, activeChallenges }: ChatClientProps) {
  const { user } = useAuthStore()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [currentConversation, setCurrentConversation] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingConversations, setLoadingConversations] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Load conversations on mount
  useEffect(() => {
    if (user) {
      loadConversations()
    }
  }, [user])

  const loadConversations = async () => {
    if (!user) return

    setLoadingConversations(true)
    const { data } = await supabase
      .from('chat_conversations')
      .select('*')
      .order('updated_at', { ascending: false })

    if (data && data.length > 0) {
      setConversations(data)
      // Load the most recent conversation
      loadConversation(data[0].id)
    } else {
      // Create first conversation
      createNewConversation()
    }
    setLoadingConversations(false)
  }

  const loadConversation = async (conversationId: string) => {
    setCurrentConversation(conversationId)
    
    const { data } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })

    if (data) {
      setMessages(data.map(msg => ({
        id: msg.id,
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
        timestamp: new Date(msg.created_at)
      })))
    } else {
      setMessages([{
        role: 'assistant',
        content: "Hello! I'm your mental wellness coach. How can I support you today?",
        timestamp: new Date(),
      }])
    }
  }

  const createNewConversation = async () => {
    if (!user) return

    const title = `Conversation ${new Date().toLocaleDateString()}`
    
    const { data, error } = await supabase
      .from('chat_conversations')
      .insert({ user_id: user.id, title })
      .select()
      .single()

    if (data && !error) {
      setConversations(prev => [data, ...prev])
      setCurrentConversation(data.id)
      setMessages([{
        role: 'assistant',
        content: "Hello! I'm your mental wellness coach. How can I support you today?",
        timestamp: new Date(),
      }])
      
      // Save initial message
      await supabase
        .from('chat_messages')
        .insert({
          conversation_id: data.id,
          role: 'assistant',
          content: "Hello! I'm your mental wellness coach. How can I support you today?"
        })
    }
  }

  const deleteConversation = async (conversationId: string) => {
    await supabase
      .from('chat_conversations')
      .delete()
      .eq('id', conversationId)

    setConversations(prev => prev.filter(c => c.id !== conversationId))
    
    if (currentConversation === conversationId) {
      const remaining = conversations.filter(c => c.id !== conversationId)
      if (remaining.length > 0) {
        loadConversation(remaining[0].id)
      } else {
        createNewConversation()
      }
    }
  }

  const saveMessage = async (role: 'user' | 'assistant', content: string) => {
    if (!currentConversation) return

    const { data } = await supabase
      .from('chat_messages')
      .insert({
        conversation_id: currentConversation,
        role,
        content
      })
      .select()
      .single()

    return data?.id
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || loading || !currentConversation) return

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    const userInput = input
    setInput('')
    setLoading(true)

    try {
      // Save user message
      await saveMessage('user', userInput)

      // Get conversation history (last 10 messages excluding the one we just added)
      const conversationHistory = messages.slice(-10).map(m => ({
        role: m.role,
        content: m.content
      }))

      const moodHistory = recentJournal.map(j => ({
        mood_label: j.mood_label,
        mood_score: j.mood_score,
      }))

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/chatCoach`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            message: userInput,
            conversationHistory,
            moodHistory,
            recentJournal,
            activeChallenges,
          }),
        }
      )

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Chat API error:', response.status, errorText)
        throw new Error(`Failed to get response: ${response.status} ${errorText}`)
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let assistantMessage = ''

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          const lines = chunk.split('\n')

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6)
              if (data === '[DONE]') continue

              try {
                const parsed = JSON.parse(data)
                const content = parsed.choices?.[0]?.delta?.content
                if (content) {
                  assistantMessage += content
                  setMessages(prev => {
                    const newMessages = [...prev]
                    const lastMessage = newMessages[newMessages.length - 1]
                    if (lastMessage && lastMessage.role === 'assistant' && !lastMessage.id) {
                      lastMessage.content = assistantMessage
                    } else {
                      newMessages.push({
                        role: 'assistant',
                        content: assistantMessage,
                        timestamp: new Date(),
                      })
                    }
                    return newMessages
                  })
                }
              } catch (e) {
                // Ignore parse errors for incomplete JSON
              }
            }
          }
        }
      }

      if (!assistantMessage) {
        throw new Error('No response received')
      }

      // Save assistant message
      await saveMessage('assistant', assistantMessage)
    } catch (error) {
      console.error('Chat error:', error)
      const errorMsg = {
        role: 'assistant' as const,
        content: "I'm sorry, I'm having trouble responding right now. Please try again in a moment.",
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, errorMsg])
      await saveMessage('assistant', errorMsg.content)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-12rem)] flex gap-4">
      {/* Conversations Sidebar */}
      <div className="w-64 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-900 dark:text-white">Conversations</h2>
          <button
            onClick={createNewConversation}
            className="p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            title="New conversation"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2">
          {loadingConversations ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
            </div>
          ) : conversations.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
              No conversations yet
            </p>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.id}
                className={`p-3 rounded-lg cursor-pointer transition-colors group ${
                  currentConversation === conv.id
                    ? 'bg-purple-100 dark:bg-purple-900/30'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div
                    onClick={() => loadConversation(conv.id)}
                    className="flex-1 min-w-0"
                  >
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {conv.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(conv.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteConversation(conv.id)
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-opacity"
                    title="Delete conversation"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-t-xl shadow-lg p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                AI Wellness Coach
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Get personalized guidance and support
              </p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 bg-white dark:bg-gray-800 shadow-lg overflow-y-auto p-6 space-y-4">
          {messages.map((message, index) => (
            <div
              key={message.id || index}
              className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.role === 'assistant' && (
                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
              )}
              <div
                className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
                <p className={`text-xs mt-1 ${
                  message.role === 'user' ? 'text-purple-200' : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              {message.role === 'user' && (
                <div className="flex-shrink-0 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl px-4 py-3">
                <Loader2 className="w-5 h-5 text-gray-600 dark:text-gray-400 animate-spin" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="bg-white dark:bg-gray-800 rounded-b-xl shadow-lg p-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              disabled={loading || !currentConversation}
            />
            <button
              type="submit"
              disabled={loading || !input.trim() || !currentConversation}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
