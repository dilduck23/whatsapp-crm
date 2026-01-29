'use client'

import { useState } from 'react'

export default function MessageInput({ onSendMessage, isLoading }) {
  const [message, setMessage] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()

    const trimmedMessage = message.trim()
    if (!trimmedMessage || isLoading) return

    onSendMessage(trimmedMessage)
    setMessage('')
  }

  const handleKeyDown = (e) => {
    // Enviar con Enter (sin Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-2 p-3 bg-whatsapp-bg-light border-t border-whatsapp-border"
    >
      {/* Botón de adjuntar */}
      <button
        type="button"
        className="p-2 text-whatsapp-text-secondary hover:text-whatsapp-text transition-colors"
        title="Adjuntar archivo (próximamente)"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
        </svg>
      </button>

      {/* Input de texto */}
      <div className="flex-1 relative">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Escribe un mensaje"
          disabled={isLoading}
          rows={1}
          className="w-full bg-whatsapp-bg rounded-lg px-4 py-3 text-sm text-whatsapp-text placeholder-whatsapp-text-secondary resize-none focus:outline-none disabled:opacity-50"
          style={{
            maxHeight: '120px',
            minHeight: '44px',
          }}
        />
      </div>

      {/* Botón de enviar */}
      <button
        type="submit"
        disabled={!message.trim() || isLoading}
        className="p-3 bg-whatsapp-green rounded-full text-white hover:bg-whatsapp-dark-green transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
        )}
      </button>
    </form>
  )
}
