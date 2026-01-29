import './globals.css'

export const metadata = {
  title: 'WhatsApp CRM',
  description: 'CRM para gestionar mensajes de WhatsApp Business API',
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
