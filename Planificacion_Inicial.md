Hola Claude. Quiero crear un clon de WhatsApp Web para gestionar mensajes de la WhatsApp Cloud API.

Mi Stack Tecnológico:

Framework: Next.js (App Router) deployado en Vercel.

Lenguaje: JavaScript.

Base de Datos y Realtime: Supabase.

Estilos: Tailwind CSS.

Arquitectura requerida:

Necesito una API Route en Next.js (/app/api/webhook/route.js) que sirva como Webhook.

Debe manejar el método GET para la verificación del token de Meta (hub.challenge).

Debe manejar el método POST para recibir mensajes entrantes. Cuando llegue un mensaje, debe guardarlo en la tabla 'messages' de Supabase y actualizar la tabla 'contacts'.

Necesito un Frontend (página principal):

Una barra lateral con la lista de contactos (ordenados por fecha).

Una ventana de chat principal.

Usar supabase.channel para escuchar cambios en tiempo real (Realtime) y actualizar el chat cuando entre un mensaje nuevo sin recargar la página.

Funcionalidad de Enviar Mensaje:

Un input que, al enviar, llame a una función que haga el POST a la Graph API de Meta y luego guarde el mensaje enviado en Supabase.

Por favor, dame:

El código SQL para crear las tablas en Supabase (contacts y messages).

El código completo de la ruta del Webhook.

El código del componente del Chat.

Las variables de entorno (.env) que necesitaré configurar."

Tu Plan de Acción Simplificado (Paso a Paso)
Si sigues este orden, tendrás el chat funcionando en una tarde:

Cuenta en Supabase (Gratis):

Crea un proyecto nuevo.

Ve al "SQL Editor" y pega el código SQL que te dará Claude para crear las tablas.

Cuenta en Meta Developers:

Crea la App y obtén el Token y el Phone Number ID.

Configura el proyecto en tu PC:

Instala Node.js.

Abre tu terminal y escribe: npx create-next-app@latest mi-whatsapp.

Instala la librería de Supabase: npm install @supabase/supabase-js.

Copia y Pega:

Pega los códigos que te genere Claude en los archivos correspondientes.

Sube a Vercel:

Crea una cuenta en Vercel, conecta tu repositorio de GitHub (o sube la carpeta usando vercel-cli).

Importante: En la configuración de Vercel, tendrás que poner las "Variables de Entorno" (Tus claves secretas de Meta y Supabase).

Conecta el Webhook:

Vercel te dará una URL (ej: https://mi-whatsapp.vercel.app).

Ve a Meta Developers > WhatsApp > Configuración.

En URL de devolución de llamada pon: https://mi-whatsapp.vercel.app/api/webhook.

En Token de verificación: El que tú inventes (y le digas a Claude).