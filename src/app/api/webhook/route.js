import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Crear cliente de Supabase de forma lazy
function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return null
  return createClient(url, key)
}

// =============================================
// GET - Verificación del Webhook de Meta
// =============================================
export async function GET(request) {
  const searchParams = request.nextUrl.searchParams

  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN

  // Verificar que el token coincida
  if (mode === 'subscribe' && token === verifyToken) {
    console.log('✅ Webhook verificado correctamente')
    return new Response(challenge, { status: 200 })
  } else {
    console.log('❌ Verificación de webhook fallida')
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
}

// =============================================
// POST - Recibir mensajes de WhatsApp
// =============================================
export async function POST(request) {
  try {
    const body = await request.json()

    console.log('📩 Webhook recibido:', JSON.stringify(body, null, 2))

    // Verificar que sea un mensaje de WhatsApp
    if (body.object !== 'whatsapp_business_account') {
      return NextResponse.json({ status: 'ignored' }, { status: 200 })
    }

    const supabase = getSupabase()
    if (!supabase) {
      console.error('Supabase no configurado')
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
    }

    // Procesar cada entrada
    const entries = body.entry || []

    for (const entry of entries) {
      const changes = entry.changes || []

      for (const change of changes) {
        if (change.field !== 'messages') continue

        const value = change.value
        const messages = value.messages || []
        const contacts = value.contacts || []

        // Procesar cada mensaje
        for (const message of messages) {
          await processIncomingMessage(supabase, message, contacts)
        }

        // Procesar actualizaciones de estado (delivered, read, etc.)
        const statuses = value.statuses || []
        for (const status of statuses) {
          await processStatusUpdate(supabase, status)
        }
      }
    }

    return NextResponse.json({ status: 'ok' }, { status: 200 })
  } catch (error) {
    console.error('❌ Error procesando webhook:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// =============================================
// Procesar mensaje entrante
// =============================================
async function processIncomingMessage(supabase, message, contacts) {
  try {
    const phone = message.from // Número del remitente
    const wamid = message.id // ID del mensaje de WhatsApp

    // Obtener nombre del perfil si está disponible
    const contactInfo = contacts.find(c => c.wa_id === phone)
    const profileName = contactInfo?.profile?.name || null

    // Determinar el contenido según el tipo de mensaje
    let content = ''
    let messageType = message.type || 'text'
    let mediaUrl = null

    switch (messageType) {
      case 'text':
        content = message.text?.body || ''
        break
      case 'image':
        content = message.image?.caption || '📷 Imagen'
        mediaUrl = message.image?.id
        break
      case 'audio':
        content = '🎵 Audio'
        mediaUrl = message.audio?.id
        break
      case 'video':
        content = message.video?.caption || '🎬 Video'
        mediaUrl = message.video?.id
        break
      case 'document':
        content = message.document?.filename || '📄 Documento'
        mediaUrl = message.document?.id
        break
      case 'sticker':
        content = '🏷️ Sticker'
        mediaUrl = message.sticker?.id
        break
      case 'location':
        content = `📍 Ubicación: ${message.location?.latitude}, ${message.location?.longitude}`
        break
      case 'contacts':
        content = '👤 Contacto compartido'
        break
      case 'button':
        content = message.button?.text || 'Botón presionado'
        break
      case 'interactive':
        content = message.interactive?.button_reply?.title ||
                  message.interactive?.list_reply?.title ||
                  'Respuesta interactiva'
        break
      default:
        content = `Mensaje de tipo: ${messageType}`
    }

    console.log(`📨 Mensaje de ${phone}: ${content}`)

    // Obtener o crear el contacto
    let { data: contact, error: contactError } = await supabase
      .from('contacts')
      .select('*')
      .eq('phone', phone)
      .single()

    if (contactError && contactError.code !== 'PGRST116') {
      console.error('Error buscando contacto:', contactError)
    }

    // Si no existe el contacto, crearlo
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
        console.error('Error creando contacto:', insertError)
        return
      }
      contact = newContact
      console.log(`✅ Nuevo contacto creado: ${phone}`)
    }

    // Guardar el mensaje
    const { error: messageError } = await supabase
      .from('messages')
      .insert({
        contact_id: contact.id,
        wamid,
        content,
        message_type: messageType,
        direction: 'inbound',
        media_url: mediaUrl,
      })

    if (messageError) {
      // Si el mensaje ya existe (wamid duplicado), ignorar
      if (messageError.code === '23505') {
        console.log('⚠️ Mensaje duplicado ignorado:', wamid)
        return
      }
      console.error('Error guardando mensaje:', messageError)
      return
    }

    // Actualizar el último mensaje del contacto
    await supabase
      .from('contacts')
      .update({
        last_message: content,
        last_message_at: new Date().toISOString(),
        unread_count: (contact.unread_count || 0) + 1,
      })
      .eq('id', contact.id)

    console.log(`✅ Mensaje guardado de ${phone}`)
  } catch (error) {
    console.error('Error procesando mensaje:', error)
  }
}

// =============================================
// Procesar actualizaciones de estado
// =============================================
async function processStatusUpdate(supabase, status) {
  try {
    const wamid = status.id
    const newStatus = status.status // sent, delivered, read, failed

    console.log(`📊 Estado actualizado: ${wamid} -> ${newStatus}`)

    // Actualizar el estado del mensaje en la base de datos
    const { error } = await supabase
      .from('messages')
      .update({ status: newStatus })
      .eq('wamid', wamid)

    if (error) {
      console.error('Error actualizando estado:', error)
    }
  } catch (error) {
    console.error('Error procesando estado:', error)
  }
}
