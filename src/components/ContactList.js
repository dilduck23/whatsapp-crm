'use client'

import { formatDistanceToNow } from '@/lib/utils'

export default function ContactList({ contacts, selectedContact, onSelectContact }) {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 px-4 py-3 bg-whatsapp-bg-light border-b border-whatsapp-border">
        <h1 className="text-xl font-semibold text-whatsapp-text">Chats</h1>
      </div>

      {/* Search */}
      <div className="flex-shrink-0 p-2 bg-whatsapp-bg-light border-b border-whatsapp-border">
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar o iniciar un chat"
            className="w-full bg-whatsapp-bg py-2 pl-10 pr-4 rounded-lg text-sm text-whatsapp-text placeholder-whatsapp-text-secondary focus:outline-none"
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-whatsapp-text-secondary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Contact List */}
      <div className="flex-1 overflow-y-auto">
        {contacts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-whatsapp-text-secondary p-4">
            <svg className="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
            </svg>
            <p className="text-center text-sm">
              No hay conversaciones aun.
              <br />
              Los mensajes entrantes apareceran aqui.
            </p>
          </div>
        ) : (
          contacts.map((contact) => (
            <div
              key={contact.id}
              onClick={() => onSelectContact(contact)}
              className={`flex items-center gap-3 px-3 py-3 cursor-pointer hover:bg-whatsapp-bg-light/50 transition-colors border-b border-whatsapp-border/50 ${
                selectedContact?.id === contact.id ? 'bg-whatsapp-bg-light' : ''
              }`}
            >
              {/* Avatar */}
              <div className="w-12 h-12 rounded-full bg-whatsapp-border flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-whatsapp-text-secondary" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              </div>

              {/* Contact Info */}
              <div className="flex-1 min-w-0 overflow-hidden">
                <div className="flex justify-between items-center gap-2">
                  <h3 className="font-medium text-whatsapp-text truncate text-[15px]">
                    {contact.name || contact.phone}
                  </h3>
                  <span className="text-[11px] text-whatsapp-text-secondary flex-shrink-0">
                    {contact.last_message_at && formatDistanceToNow(contact.last_message_at)}
                  </span>
                </div>
                <div className="flex justify-between items-center gap-2 mt-0.5">
                  <p className="text-[13px] text-whatsapp-text-secondary truncate">
                    {contact.last_message || 'Sin mensajes'}
                  </p>
                  {contact.unread_count > 0 && (
                    <span className="bg-whatsapp-green text-whatsapp-bg text-[11px] font-medium rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5 flex-shrink-0">
                      {contact.unread_count}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
