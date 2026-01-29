# Guía de Configuración - WhatsApp CRM

## Estado Actual
- [x] Proyecto Next.js creado
- [x] Código del frontend y backend listo
- [ ] **Pendiente: Verificación de Business en Meta**
- [ ] Configurar variables de entorno
- [ ] Ejecutar SQL en Supabase
- [ ] Deploy en Vercel
- [ ] Conectar Webhook

---

## Paso 1: Supabase (Puedes hacerlo mientras esperas)

### 1.1 Crear proyecto en Supabase
1. Ve a [supabase.com](https://supabase.com) y crea una cuenta
2. Click en **New Project**
3. Elige un nombre y contraseña para la base de datos
4. Selecciona la región más cercana a ti

### 1.2 Ejecutar el SQL
1. En tu proyecto de Supabase, ve a **SQL Editor** (menú izquierdo)
2. Click en **New Query**
3. Copia todo el contenido del archivo `supabase.sql` de este proyecto
4. Click en **Run** (o Ctrl+Enter)
5. Deberías ver: "Success. No rows returned"

### 1.3 Obtener credenciales
1. Ve a **Settings** > **API** (menú izquierdo)
2. Copia estos valores:
   - **Project URL** → será tu `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → será tu `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 1.4 Verificar Realtime
1. Ve a **Database** > **Replication**
2. Asegúrate de que las tablas `contacts` y `messages` tienen Realtime habilitado
3. Si no aparecen, ejecuta de nuevo las líneas del SQL que dicen `ALTER PUBLICATION`

---

## Paso 2: Meta for Developers (Cuando la verificación esté lista)

### 2.1 Acceder a la configuración de WhatsApp
1. Ve a [developers.facebook.com](https://developers.facebook.com)
2. Accede a tu App
3. En el menú izquierdo: **WhatsApp** > **API Setup**

### 2.2 Obtener credenciales
Desde la página de API Setup, copia:

| Campo en Meta | Variable en .env.local |
|---------------|------------------------|
| **Phone number ID** | `WHATSAPP_PHONE_NUMBER_ID` |
| **Temporary access token** o **Permanent token** | `WHATSAPP_TOKEN` |

> **Nota:** El token temporal expira en 24h. Para producción necesitarás un token permanente (System User Token).

### 2.3 Crear tu token de verificación
Inventa un token secreto para verificar el webhook. Ejemplo:
```
mi_webhook_secreto_2024
```
Este será tu `WHATSAPP_VERIFY_TOKEN`

---

## Paso 3: Configurar Variables de Entorno

### 3.1 Crear archivo .env.local
```bash
cp .env.local.example .env.local
```

### 3.2 Editar .env.local
```env
# SUPABASE
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...

# WHATSAPP
WHATSAPP_TOKEN=EAAxxxxx...
WHATSAPP_PHONE_NUMBER_ID=123456789012345
WHATSAPP_VERIFY_TOKEN=mi_webhook_secreto_2024
```

---

## Paso 4: Probar Localmente

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

Deberías ver la interfaz del chat (vacía por ahora).

---

## Paso 5: Deploy en Vercel

### 5.1 Subir a GitHub (si no lo has hecho)
```bash
git init
git add .
git commit -m "Initial commit - WhatsApp CRM"
git remote add origin https://github.com/tu-usuario/whatsapp-crm.git
git push -u origin main
```

### 5.2 Conectar con Vercel
1. Ve a [vercel.com](https://vercel.com)
2. Click en **Add New** > **Project**
3. Importa tu repositorio de GitHub
4. **IMPORTANTE:** Antes de hacer deploy, añade las variables de entorno:
   - Click en **Environment Variables**
   - Añade todas las variables de tu `.env.local`
5. Click en **Deploy**

### 5.3 Obtener tu URL
Vercel te dará una URL como:
```
https://whatsapp-crm-xxxxx.vercel.app
```

---

## Paso 6: Conectar Webhook en Meta

### 6.1 Configurar el Webhook
1. Ve a Meta Developers > Tu App > **WhatsApp** > **Configuration**
2. En la sección **Webhook**, click en **Edit**
3. Completa:
   - **Callback URL:** `https://tu-app.vercel.app/api/webhook`
   - **Verify token:** El mismo que pusiste en `WHATSAPP_VERIFY_TOKEN`
4. Click en **Verify and Save**

### 6.2 Suscribirse a eventos
Después de verificar, activa estos campos de suscripción:
- [x] `messages` - Para recibir mensajes entrantes
- [x] `message_deliveries` - Para saber si se entregó (opcional)
- [x] `message_reads` - Para saber si se leyó (opcional)

---

## Paso 7: Probar

### Enviar mensaje de prueba
1. Desde Meta Developers > WhatsApp > API Setup
2. Usa la sección **Send Message** para enviar un mensaje a tu número
3. Responde al mensaje desde tu WhatsApp personal
4. El mensaje debería aparecer en tu CRM

---

## Troubleshooting

### El webhook no verifica
- Verifica que la URL sea exactamente `/api/webhook`
- Confirma que el `WHATSAPP_VERIFY_TOKEN` sea idéntico en ambos lados
- Revisa los logs en Vercel: **Deployments** > **Functions** > **api/webhook**

### No recibo mensajes
- Verifica que la suscripción a `messages` esté activa
- Revisa que Realtime esté habilitado en Supabase
- Mira los logs de Vercel para ver si llegan los webhooks

### Error al enviar mensajes
- Confirma que el token no haya expirado
- Verifica el Phone Number ID
- El número destino debe haber iniciado conversación primero (en sandbox)

---

## Recursos Útiles

- [Documentación WhatsApp Cloud API](https://developers.facebook.com/docs/whatsapp/cloud-api)
- [Documentación Supabase Realtime](https://supabase.com/docs/guides/realtime)
- [Logs de Vercel](https://vercel.com/docs/observability/runtime-logs)
