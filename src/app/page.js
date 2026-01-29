'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase, getContacts, getMessages, sendWhatsAppMessage } from '@/lib/supabase'
import ContactList from '@/components/ContactList'
import ChatWindow from '@/components/ChatWindow'

export default function Home() {
  const [contacts, setContacts] = useState([])
  const [selectedContact, setSelectedContact] = useState(null)
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)

  // Cargar contactos al iniciar
  useEffect(() => {
    loadContacts()
  }, [])

  // Cargar mensajes cuando se selecciona un contacto
  useEffect(() => {
    if (selectedContact) {
      loadMessages(selectedContact.id)
      // Marcar como leídos (resetear contador)
      markAsRead(selectedContact.id)
    } else {
      setMessages([])
    }
  }, [selectedContact])

  // Suscripción a Realtime para mensajes nuevos
  useEffect(() => {
    const channel = supabase
      .channel('realtime-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          console.log('Nuevo mensaje recibido:', payload.new)
          handleNewMessage(payload.new)
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          console.log('Mensaje actualizado:', payload.new)
          handleMessageUpdate(payload.new)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [selectedContact])

  // Suscripción a Realtime para contactos (para actualizar la lista)
  useEffect(() => {
    const channel = supabase
      .channel('realtime-contacts')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'contacts',
        },
        () => {
          // Recargar la lista de contactos cuando haya cambios
          loadContacts()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  // Cargar contactos
  const loadContacts = async () => {
    setIsLoading(true)
    const data = await getContacts()
    setContacts(data)
    setIsLoading(false)
  }

  // Cargar mensajes de un contacto
  const loadMessages = async (contactId) => {
    const data = await getMessages(contactId)
    setMessages(data)
  }

  // Marcar mensajes como leídos
  const markAsRead = async (contactId) => {
    await supabase
      .from('contacts')
      .update({ unread_count: 0 })
      .eq('id', contactId)
  }

  // Manejar nuevo mensaje de Realtime
  const handleNewMessage = useCallback((newMessage) => {
    // Si el mensaje es del contacto seleccionado, añadirlo a la lista
    if (selectedContact && newMessage.contact_id === selectedContact.id) {
      setMessages((prev) => {
        // Evitar duplicados
        if (prev.some((m) => m.id === newMessage.id)) return prev
        return [...prev, newMessage]
      })
      // Marcar como leído inmediatamente
      markAsRead(selectedContact.id)
    }

    // Actualizar la lista de contactos para reflejar el nuevo mensaje
    loadContacts()
  }, [selectedContact])

  // Manejar actualización de mensaje (estado)
  const handleMessageUpdate = useCallback((updatedMessage) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === updatedMessage.id ? { ...m, ...updatedMessage } : m
      )
    )
  }, [])

  // Enviar mensaje
  const handleSendMessage = async (content) => {
    if (!selectedContact || !content.trim()) return

    setIsSending(true)

    try {
      await sendWhatsAppMessage(selectedContact.phone, content)
      // El mensaje se añadirá automáticamente via Realtime
    } catch (error) {
      console.error('Error enviando mensaje:', error)
      alert('Error al enviar el mensaje: ' + error.message)
    } finally {
      setIsSending(false)
    }
  }

  // Seleccionar contacto
  const handleSelectContact = (contact) => {
    setSelectedContact(contact)
  }

  return (
    <main className="flex h-screen w-screen overflow-hidden bg-whatsapp-bg">
      {/* Sidebar con lista de contactos */}
      <aside className="w-[30%] min-w-[320px] max-w-[420px] h-full border-r border-whatsapp-border flex flex-col bg-whatsapp-bg">
        <ContactList
          contacts={contacts}
          selectedContact={selectedContact}
          onSelectContact={handleSelectContact}
        />
      </aside>

      {/* Ventana de chat */}
      <section className="flex-1 h-full flex flex-col">
        <ChatWindow
          contact={selectedContact}
          messages={messages}
          onSendMessage={handleSendMessage}
          isLoading={isSending}
        />
      </section>
    </main>
  )
}
