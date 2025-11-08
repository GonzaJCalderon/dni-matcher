
export const metadata = {
  title: 'Matcher DNI',
  description: 'Aplicación para cruzar DNIs con datos en TXT o CSV',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
