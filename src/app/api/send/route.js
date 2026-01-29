import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Crear cliente de Supabase de forma lazy
function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return null
  return createClient(url, key)
}

const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID
const GRAPH_API_VERSION = process.env.GRAPH_API_VERSION || 'v18.0'

export async function POST(request) {
  try {
    const { phone, message } = await request.json()

    if (!phone || !message) {
      return NextResponse.json(
        { error: 'Phone and message are required' },
        { status: 400 }
      )
    }

    if (!WHATSAPP_TOKEN || !PHONE_NUMBER_ID) {
      console.error('WhatsApp credentials not configured')
      return NextResponse.json(
        { error: 'WhatsApp API not configured' },
        { status: 500 }
      )
    }

    // Limpiar el número de teléfono (quitar espacios, guiones, etc.)
    const cleanPhone = phone.replace(/[^0-9]/g, '')

    console.log(`📤 Enviando mensaje a ${cleanPhone}: ${message}`)

    // Enviar mensaje a la Graph API de Meta
    const graphResponse = await fetch(
      `https://graph.facebook.com/${GRAPH_API_VERSION}/${PHONE_NUMBER_ID}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: cleanPhone,
          type: 'text',
          text: {
            preview_url: true,
            body: message,
          },
        }),
      }
    )

    const graphData = await graphResponse.json()

    if (!graphResponse.ok) {
      console.error('❌ Error de WhatsApp API:', graphData)
      return NextResponse.json(
        {
          error: 'Failed to send message',
          details: graphData.error?.message || 'Unknown error'
        },
        { status: graphResponse.status }
      )
    }

    console.log('✅ Respuesta de WhatsApp:', graphData)

    // Obtener el WAMID del mensaje enviado
    const wamid = graphData.messages?.[0]?.id

    // Guardar en Supabase si está configurado
    const supabase = getSupabase()
    if (supabase) {
      // Obtener o crear el contacto en la base de datos
      let { data: contact, error: contactError } = await supabase
        .from('contacts')
        .select('*')
        .eq('phone', cleanPhone)
        .single()

      if (contactError && contactError.code !== 'PGRST116') {
        console.error('Error buscando contacto:', contactError)
      }

      // Si no existe el contacto, crearlo
      if (!contact) {
        const { data: newContact, error: insertError } = await supabase
          .from('contacts')
          .insert({
            phone: cleanPhone,
            name: cleanPhone,
          })
          .select()
          .single()

        if (insertError) {
          console.error('Error creando contacto:', insertError)
        } else {
          contact = newContact
        }
      }

      // Guardar el mensaje enviado en la base de datos
      if (contact) {
        const { error: messageError } = await supabase
          .from('messages')
          .insert({
            contact_id: contact.id,
            wamid,
            content: message,
            message_type: 'text',
            direction: 'outbound',
            status: 'sent',
          })

        if (messageError) {
          console.error('Error guardando mensaje:', messageError)
        }

        // Actualizar el último mensaje del contacto
        await supabase
          .from('contacts')
          .update({
            last_message: message,
            last_message_at: new Date().toISOString(),
          })
          .eq('id', contact.id)
      }
    }

    return NextResponse.json({
      success: true,
      messageId: wamid,
    })
  } catch (error) {
    console.error('❌ Error enviando mensaje:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
