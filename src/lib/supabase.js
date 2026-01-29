import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

const isConfigured = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!isConfigured && typeof window !== 'undefined') {
  console.warn('Supabase credentials not found. Please check your .env.local file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// =============================================
// FUNCIONES DE CONTACTOS
// =============================================

export async function getContacts() {
  if (!isConfigured) return []

  const { data, error } = await supabase
    .from('contacts')
    .select('*')
    .order('last_message_at', { ascending: false })

  if (error) {
    console.error('Error fetching contacts:', error)
    return []
  }
  return data || []
}

export async function getOrCreateContact(phone, profileName = null) {
  if (!isConfigured) return null

  // Primero intentamos obtener el contacto existente
  let { data: contact, error } = await supabase
    .from('contacts')
    .select('*')
    .eq('phone', phone)
    .single()

  if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
    console.error('Error fetching contact:', error)
    return null
  }

  // Si no existe, lo creamos
  if (!contact) {
    const { data: newContact, error: insertError } = await supabase
      .from('contacts')
      .insert({
        phone,
        name: profileName || phone,
        profile_name: profileName,
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating contact:', insertError)
      return null
    }
    contact = newContact
  }

  return contact
}

export async function updateContactLastMessage(contactId, lastMessage) {
  if (!isConfigured) return

  const { error } = await supabase
    .from('contacts')
    .update({
      last_message: lastMessage,
      last_message_at: new Date().toISOString(),
    })
    .eq('id', contactId)

  if (error) {
    console.error('Error updating contact:', error)
  }
}

// =============================================
// FUNCIONES DE MENSAJES
// =============================================

export async function getMessages(contactId) {
  if (!isConfigured) return []

  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('contact_id', contactId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching messages:', error)
    return []
  }
  return data || []
}

export async function saveMessage({ contactId, content, direction, wamid = null, messageType = 'text', mediaUrl = null }) {
  if (!isConfigured) return null

  const { data, error } = await supabase
    .from('messages')
    .insert({
      contact_id: contactId,
      content,
      direction,
      wamid,
      message_type: messageType,
      media_url: mediaUrl,
    })
    .select()
    .single()

  if (error) {
    console.error('Error saving message:', error)
    return null
  }

  // Actualizar el último mensaje del contacto
  await updateContactLastMessage(contactId, content)

  return data
}

// =============================================
// FUNCIONES DE WHATSAPP API
// =============================================

export async function sendWhatsAppMessage(phone, message) {
  const response = await fetch('/api/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ phone, message }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'Error sending message')
  }

  return data
}
