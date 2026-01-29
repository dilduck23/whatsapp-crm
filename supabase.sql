-- =============================================
-- WHATSAPP CRM - ESQUEMA DE BASE DE DATOS
-- Ejecuta este SQL en el SQL Editor de Supabase
-- =============================================

-- Tabla de contactos
CREATE TABLE contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  phone VARCHAR(20) NOT NULL UNIQUE,
  name VARCHAR(255),
  profile_name VARCHAR(255),
  last_message TEXT,
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  unread_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de mensajes
CREATE TABLE messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  wamid VARCHAR(255) UNIQUE, -- WhatsApp Message ID
  content TEXT NOT NULL,
  message_type VARCHAR(50) DEFAULT 'text', -- text, image, audio, video, document
  direction VARCHAR(10) NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  status VARCHAR(20) DEFAULT 'sent', -- sent, delivered, read, failed
  media_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejorar el rendimiento
CREATE INDEX idx_messages_contact_id ON messages(contact_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX idx_contacts_last_message_at ON contacts(last_message_at DESC);
CREATE INDEX idx_contacts_phone ON contacts(phone);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar updated_at en contacts
CREATE TRIGGER update_contacts_updated_at
  BEFORE UPDATE ON contacts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- HABILITAR REALTIME
-- =============================================

-- Habilitar Realtime para la tabla messages
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- Habilitar Realtime para la tabla contacts
ALTER PUBLICATION supabase_realtime ADD TABLE contacts;

-- =============================================
-- POLÍTICAS DE SEGURIDAD (RLS)
-- =============================================

-- Habilitar RLS
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Política para permitir todas las operaciones (ajusta según tus necesidades de autenticación)
-- Para un CRM simple sin auth de usuarios, permitimos todo
CREATE POLICY "Allow all operations on contacts" ON contacts
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on messages" ON messages
  FOR ALL USING (true) WITH CHECK (true);

-- =============================================
-- DATOS DE PRUEBA (OPCIONAL - Comenta si no los necesitas)
-- =============================================

-- INSERT INTO contacts (phone, name, profile_name, last_message)
-- VALUES
--   ('+34612345678', 'Juan García', 'Juan', 'Hola, ¿cómo estás?'),
--   ('+34698765432', 'María López', 'María', '¿Podemos hablar mañana?');
