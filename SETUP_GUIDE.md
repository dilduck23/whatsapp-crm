# Guía de Configuración - WhatsApp CRM

## 🎯 Estado Actual del Proyecto

- [x] Proyecto Next.js creado
- [x] Código del frontend y backend completo
- [x] Tablas creadas en Supabase
- [x] Proyecto subido a GitHub
- [x] Deploy en Vercel completado
- [x] Variables de entorno de Supabase configuradas
- [x] Phone Number ID configurado
- [x] Token de verificación del webhook configurado
- [ ] **⏳ PENDIENTE: Obtener Token de WhatsApp de Meta (esperando verificación)**
- [ ] **⏳ PENDIENTE: Configurar webhook en Meta**

---

## 🔗 Enlaces del Proyecto

- **GitHub:** https://github.com/dilduck23/whatsapp-crm
- **Vercel Dashboard:** https://vercel.com/carlos-projects-a7fa7a21/whatsapp-crm
- **URL de Producción:** https://whatsapp-crm-red.vercel.app
- **URL del Webhook:** https://whatsapp-crm-red.vercel.app/api/webhook

---

## 📋 Próximos Pasos

### Paso 1: Obtener Token de WhatsApp (Cuando Meta apruebe)

Una vez que Meta apruebe tu verificación de Business:

1. **Ve a Meta Developers:**
   - URL: https://developers.facebook.com
   - Accede a tu App
   - Menu: **WhatsApp** > **API Setup**

2. **Obtener el Access Token:**
   - Busca la sección "Temporary access token" o "Access token"
   - Copia el token (empieza con `EAA...`)

   > ⚠️ **Nota:** El token temporal expira en 24h. Para producción necesitas crear un **System User Token** permanente desde **Business Settings**.

3. **Actualizar en Vercel:**

   Opción A - Desde CLI (recomendado):
   ```bash
   vercel env rm WHATSAPP_TOKEN production
   vercel env add WHATSAPP_TOKEN production
   # Pega tu token cuando te lo pida
   ```

   Opción B - Desde la web:
   - Ve a: https://vercel.com/carlos-projects-a7fa7a21/whatsapp-crm/settings/environment-variables
   - Busca `WHATSAPP_TOKEN`
   - Click en los tres puntos > **Edit**
   - Pega tu token nuevo
   - Click en **Save**

4. **Hacer Redeploy:**
   ```bash
   vercel --prod
   ```

---

### Paso 2: Configurar Webhook en Meta

1. **Ve a la configuración del Webhook:**
   - Meta Developers > Tu App > **WhatsApp** > **Configuration**
   - Busca la sección **Webhook**
   - Click en **Edit**

2. **Completa los campos:**
   - **Callback URL:** `https://whatsapp-crm-red.vercel.app/api/webhook`
   - **Verify token:** `webhook_secreto_2024`

3. **Verificar y guardar:**
   - Click en **Verify and Save**
   - Deberías ver un mensaje de éxito

4. **Suscribirse a eventos:**

   Activa estos campos (checkboxes):
   - ✅ `messages` - **OBLIGATORIO** (recibir mensajes)
   - ✅ `message_deliveries` - Opcional (estado de entrega)
   - ✅ `message_reads` - Opcional (estado de lectura)

---

### Paso 3: Probar el Sistema

#### 3.1 Probar recepción de mensajes

1. **Desde Meta Developers:**
   - Ve a WhatsApp > **API Setup**
   - Sección "Send and receive messages"
   - Envía un mensaje de prueba a tu número

2. **Responde desde WhatsApp:**
   - Abre WhatsApp en tu teléfono
   - Responde al mensaje que recibiste

3. **Verifica en tu CRM:**
   - Abre: https://whatsapp-crm-red.vercel.app
   - Deberías ver el contacto y el mensaje aparecer automáticamente

#### 3.2 Probar envío de mensajes

1. En tu CRM, selecciona un contacto
2. Escribe un mensaje en el input
3. Click en enviar
4. El mensaje debería aparecer en tu WhatsApp personal

#### 3.3 Ver logs (si algo falla)

```bash
vercel logs https://whatsapp-crm-red.vercel.app --follow
```

O desde la web:
- https://vercel.com/carlos-projects-a7fa7a21/whatsapp-crm/logs

---

## 🛠️ Configuración Local (Opcional)

Si quieres probar en tu máquina local:

### 1. Clonar el repositorio
```bash
git clone https://github.com/dilduck23/whatsapp-crm.git
cd whatsapp-crm
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
El archivo `.env.local` ya existe con tus credenciales. Si no existe:
```bash
cp .env.local.example .env.local
# Edita .env.local con tus credenciales
```

### 4. Ejecutar en desarrollo
```bash
npm run dev
```

Abre http://localhost:3000

---

## 🔐 Variables de Entorno Configuradas

| Variable | Estado | Ubicación |
|----------|--------|-----------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ Configurada | Vercel + Local |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ Configurada | Vercel + Local |
| `WHATSAPP_PHONE_NUMBER_ID` | ✅ Configurada | Vercel + Local |
| `WHATSAPP_VERIFY_TOKEN` | ✅ Configurada (`webhook_secreto_2024`) | Vercel + Local |
| `WHATSAPP_TOKEN` | ⚠️ Placeholder | **Pendiente actualizar** |

---

## 🐛 Troubleshooting

### El webhook no verifica
**Síntomas:** Error al configurar el webhook en Meta

**Soluciones:**
- Verifica que la URL sea exactamente: `https://whatsapp-crm-red.vercel.app/api/webhook`
- Confirma que el token sea: `webhook_secreto_2024`
- Revisa los logs: `vercel logs https://whatsapp-crm-red.vercel.app/api/webhook`

### No recibo mensajes en el CRM
**Síntomas:** Respondes en WhatsApp pero no aparece en el CRM

**Soluciones:**
1. Verifica que la suscripción a `messages` esté activa en Meta
2. Revisa que Realtime esté habilitado en Supabase:
   - Supabase Dashboard > Database > Replication
   - Tablas `contacts` y `messages` deben estar en la lista
3. Mira los logs del webhook:
   ```bash
   vercel logs --follow
   ```

### Error al enviar mensajes
**Síntomas:** "Error sending message" o "WhatsApp API not configured"

**Soluciones:**
- Confirma que `WHATSAPP_TOKEN` esté configurado correctamente
- Verifica que el token no haya expirado (tokens temporales duran 24h)
- Confirma el `WHATSAPP_PHONE_NUMBER_ID`
- **Importante:** En modo sandbox, el número destino debe haber iniciado la conversación primero

### La página carga pero no muestra contactos
**Síntomas:** Interfaz carga pero lista de contactos vacía

**Soluciones:**
1. Verifica las credenciales de Supabase en Vercel
2. Abre la consola del navegador (F12) y busca errores
3. Verifica que las tablas existan en Supabase:
   ```sql
   SELECT * FROM contacts;
   SELECT * FROM messages;
   ```

---

## 📚 Recursos Útiles

### Documentación Oficial
- [WhatsApp Cloud API](https://developers.facebook.com/docs/whatsapp/cloud-api)
- [Supabase Realtime](https://supabase.com/docs/guides/realtime)
- [Next.js App Router](https://nextjs.org/docs/app)
- [Vercel Deployments](https://vercel.com/docs)

### Herramientas de Desarrollo
- [Vercel CLI Docs](https://vercel.com/docs/cli)
- [GitHub CLI Docs](https://cli.github.com/)

### Gestión de Tokens
- [System User Tokens (Meta)](https://developers.facebook.com/docs/development/create-an-app/app-dashboard/system-users/)
- [Supabase API Keys](https://supabase.com/docs/guides/api#api-keys)

---

## 🚀 Siguientes Mejoras (Futuras)

- [ ] Soporte para imágenes y archivos multimedia
- [ ] Notificaciones de escritorio
- [ ] Búsqueda de mensajes
- [ ] Filtros por estado (leídos/no leídos)
- [ ] Exportar conversaciones
- [ ] Respuestas rápidas
- [ ] Múltiples usuarios (autenticación)
- [ ] Plantillas de mensajes
- [ ] Estadísticas y analytics

---

## 📞 Soporte

Si encuentras algún problema:
1. Revisa los logs de Vercel
2. Verifica la configuración en Meta Developers
3. Consulta la documentación oficial de WhatsApp Cloud API
4. Abre un issue en GitHub: https://github.com/dilduck23/whatsapp-crm/issues
