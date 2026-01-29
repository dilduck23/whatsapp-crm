-- =============================================
-- DATOS DE DEMOSTRACIÓN - WhatsApp CRM
-- Ejecuta esto en Supabase SQL Editor
-- =============================================

-- PASO 1: Limpiar datos anteriores (opcional)
DELETE FROM messages;
DELETE FROM contacts;

-- PASO 2: Insertar contactos (los IDs se generan automáticamente)
INSERT INTO contacts (phone, name, profile_name, last_message, last_message_at, unread_count)
VALUES
  ('+34612345678', 'Juan García', 'Juan', 'Perfecto, nos vemos mañana entonces!', NOW() - INTERVAL '5 minutes', 2),
  ('+34698765432', 'María López', 'María', 'Gracias por tu ayuda', NOW() - INTERVAL '1 hour', 0),
  ('+51987654321', 'Pedro Martínez', 'Pedro', 'Ok, entendido', NOW() - INTERVAL '3 hours', 1),
  ('+52556677889', 'Ana Torres', 'Ana', '¿Tienes el reporte?', NOW() - INTERVAL '1 day', 0);

-- PASO 3: Insertar mensajes de Juan García
INSERT INTO messages (contact_id, content, direction, message_type, status, created_at)
SELECT
  c.id,
  m.content,
  m.direction,
  'text',
  m.status,
  m.created_at
FROM contacts c
CROSS JOIN (
  VALUES
    ('Hola, buenos días!', 'inbound', 'read', NOW() - INTERVAL '2 hours'),
    ('Hola Juan! ¿Cómo estás?', 'outbound', 'read', NOW() - INTERVAL '2 hours' + INTERVAL '2 minutes'),
    ('Todo bien, gracias. Quería consultarte sobre el proyecto', 'inbound', 'read', NOW() - INTERVAL '2 hours' + INTERVAL '5 minutes'),
    ('Claro, dime en qué te puedo ayudar', 'outbound', 'read', NOW() - INTERVAL '2 hours' + INTERVAL '6 minutes'),
    ('¿Podemos agendar una reunión para mañana?', 'inbound', 'read', NOW() - INTERVAL '10 minutes'),
    ('Por supuesto, ¿a qué hora te viene bien?', 'outbound', 'delivered', NOW() - INTERVAL '8 minutes'),
    ('A las 10am estaría perfecto', 'inbound', 'read', NOW() - INTERVAL '6 minutes'),
    ('Perfecto, nos vemos mañana entonces!', 'inbound', 'read', NOW() - INTERVAL '5 minutes')
) AS m(content, direction, status, created_at)
WHERE c.phone = '+34612345678';

-- PASO 4: Insertar mensajes de María López
INSERT INTO messages (contact_id, content, direction, message_type, status, created_at)
SELECT
  c.id,
  m.content,
  m.direction,
  'text',
  m.status,
  m.created_at
FROM contacts c
CROSS JOIN (
  VALUES
    ('Hola! Necesito ayuda con el sistema', 'inbound', 'read', NOW() - INTERVAL '1 day'),
    ('Hola María, claro. ¿Qué necesitas?', 'outbound', 'read', NOW() - INTERVAL '1 day' + INTERVAL '5 minutes'),
    ('No puedo acceder a mi cuenta', 'inbound', 'read', NOW() - INTERVAL '1 day' + INTERVAL '7 minutes'),
    ('Déjame revisar. ¿Cuál es tu usuario?', 'outbound', 'read', NOW() - INTERVAL '1 day' + INTERVAL '10 minutes'),
    ('maria.lopez@empresa.com', 'inbound', 'read', NOW() - INTERVAL '1 day' + INTERVAL '12 minutes'),
    ('Ya lo revisé, tu cuenta estaba bloqueada. Ya la activé', 'outbound', 'read', NOW() - INTERVAL '1 day' + INTERVAL '15 minutes'),
    ('Gracias por tu ayuda', 'inbound', 'read', NOW() - INTERVAL '1 hour')
) AS m(content, direction, status, created_at)
WHERE c.phone = '+34698765432';

-- PASO 5: Insertar mensajes de Pedro Martínez
INSERT INTO messages (contact_id, content, direction, message_type, status, created_at)
SELECT
  c.id,
  m.content,
  m.direction,
  'text',
  m.status,
  m.created_at
FROM contacts c
CROSS JOIN (
  VALUES
    ('Hey, te envié el documento por email', 'inbound', 'read', NOW() - INTERVAL '5 hours'),
    ('Perfecto, lo reviso y te comento', 'outbound', 'read', NOW() - INTERVAL '4 hours'),
    ('Ok, entendido', 'inbound', 'read', NOW() - INTERVAL '3 hours')
) AS m(content, direction, status, created_at)
WHERE c.phone = '+51987654321';

-- PASO 6: Insertar mensajes de Ana Torres
INSERT INTO messages (contact_id, content, direction, message_type, status, created_at)
SELECT
  c.id,
  m.content,
  m.direction,
  'text',
  m.status,
  m.created_at
FROM contacts c
CROSS JOIN (
  VALUES
    ('¿Tienes el reporte?', 'inbound', 'read', NOW() - INTERVAL '1 day'),
    ('Sí, te lo envío en un momento', 'outbound', 'delivered', NOW() - INTERVAL '1 day' + INTERVAL '30 minutes')
) AS m(content, direction, status, created_at)
WHERE c.phone = '+52556677889';

-- PASO 7: Verificar datos
SELECT 'Contactos:' as tabla, COUNT(*) as total FROM contacts
UNION ALL
SELECT 'Mensajes:', COUNT(*) FROM messages;
