'use client'

import { useEffect, useRef } from 'react'
import { formatTime } from '@/lib/utils'
import MessageInput from './MessageInput'

export default function ChatWindow({ contact, messages, onSendMessage, isLoading }) {
  const messagesEndRef = useRef(null)

  // Auto-scroll al último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Si no hay contacto seleccionado, mostrar pantalla de bienvenida
  if (!contact) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-whatsapp-bg-chat text-whatsapp-text-secondary">
        <div className="w-64 h-64 mb-6">
          <svg viewBox="0 0 303 172" className="w-full h-full opacity-30">
            <path fill="currentColor" d="M229.565 160.229c32.647-25.036 54.281-64.322 54.281-108.759C283.846 23.134 261.027 0 232.846 0H70.846C42.665 0 19.846 23.134 19.846 51.47c0 44.437 21.634 83.723 54.281 108.759C74.127 160.229 19.846 160.229 19.846 160.229v12H283.846v-12s-54.281 0-54.281 0z"/>
          </svg>
        </div>
        <h2 className="text-2xl font-light mb-2">WhatsApp CRM</h2>
        <p className="text-center max-w-md">
          Selecciona un chat de la lista para ver los mensajes.
          <br />
          Los nuevos mensajes aparecerán automáticamente.
        </p>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col bg-whatsapp-bg-chat">
      {/* Header del chat */}
      <div className="flex items-center gap-3 p-3 bg-whatsapp-bg-light border-b border-whatsapp-border">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-whatsapp-border flex items-center justify-center">
          <svg className="w-5 h-5 text-whatsapp-text-secondary" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
        </div>

        {/* Contact Info */}
        <div className="flex-1">
          <h2 className="font-medium text-whatsapp-text">
            {contact.name || contact.phone}
          </h2>
          <p className="text-xs text-whatsapp-text-secondary">
            {contact.phone}
          </p>
        </div>

        {/* Actions */}
        <button className="p-2 text-whatsapp-text-secondary hover:text-whatsapp-text transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </button>
      </div>

      {/* Área de mensajes */}
      <div
        className="flex-1 overflow-y-auto p-4 space-y-2"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      >
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="bg-whatsapp-bg-light rounded-lg px-4 py-2 text-center">
              <p className="text-sm text-whatsapp-text-secondary">
                No hay mensajes en esta conversación.
              </p>
            </div>
          </div>
        ) : (
          messages.map((message, index) => (
            <Message key={message.id || index} message={message} />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input de mensaje */}
      <MessageInput onSendMessage={onSendMessage} isLoading={isLoading} />
    </div>
  )
}

// Componente de mensaje individual
function Message({ message }) {
  const isOutbound = message.direction === 'outbound'

  return (
    <div className={`flex ${isOutbound ? 'justify-end' : 'justify-start'} message-enter`}>
      <div
        className={`max-w-[65%] rounded-lg px-3 py-2 shadow ${
          isOutbound
            ? 'bg-whatsapp-light-green text-gray-900'
            : 'bg-whatsapp-bg-light text-whatsapp-text'
        }`}
      >
        {/* Contenido del mensaje */}
        <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>

        {/* Footer: hora y estado */}
        <div className={`flex items-center justify-end gap-1 mt-1 ${isOutbound ? 'text-gray-600' : 'text-whatsapp-text-secondary'}`}>
          <span className="text-[11px]">
            {formatTime(message.created_at)}
          </span>
          {isOutbound && <MessageStatus status={message.status} />}
        </div>
      </div>
    </div>
  )
}

// Indicador de estado del mensaje
function MessageStatus({ status }) {
  switch (status) {
    case 'sent':
      return (
        <svg className="w-4 h-4" viewBox="0 0 16 15" fill="currentColor">
          <path d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-1.755-1.755a.365.365 0 0 0-.516 0l-.445.445a.365.365 0 0 0 0 .516l2.652 2.652a.365.365 0 0 0 .516 0l6.321-7.945a.365.365 0 0 0-.045-.509z" />
        </svg>
      )
    case 'delivered':
      return (
        <svg className="w-4 h-4" viewBox="0 0 16 15" fill="currentColor">
          <path d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-1.755-1.755a.365.365 0 0 0-.516 0l-.445.445a.365.365 0 0 0 0 .516l2.652 2.652a.365.365 0 0 0 .516 0l6.321-7.945a.365.365 0 0 0-.045-.509z" />
          <path d="M12.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L5.666 9.879a.32.32 0 0 1-.484.033l-1.755-1.755a.365.365 0 0 0-.516 0l-.445.445a.365.365 0 0 0 0 .516l2.652 2.652a.365.365 0 0 0 .516 0l6.321-7.945a.365.365 0 0 0-.045-.509z" />
        </svg>
      )
    case 'read':
      return (
        <svg className="w-4 h-4 text-blue-500" viewBox="0 0 16 15" fill="currentColor">
          <path d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-1.755-1.755a.365.365 0 0 0-.516 0l-.445.445a.365.365 0 0 0 0 .516l2.652 2.652a.365.365 0 0 0 .516 0l6.321-7.945a.365.365 0 0 0-.045-.509z" />
          <path d="M12.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L5.666 9.879a.32.32 0 0 1-.484.033l-1.755-1.755a.365.365 0 0 0-.516 0l-.445.445a.365.365 0 0 0 0 .516l2.652 2.652a.365.365 0 0 0 .516 0l6.321-7.945a.365.365 0 0 0-.045-.509z" />
        </svg>
      )
    case 'failed':
      return (
        <svg className="w-4 h-4 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <circle cx="12" cy="12" r="10" strokeWidth="2" />
          <path d="M15 9l-6 6M9 9l6 6" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )
    default:
      return null
  }
}
