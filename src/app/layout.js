export const metadata = {
  title: 'The Hardware Guru',
  description: 'Tech, Gaming & AI',
}

export default function RootLayout({ children }) {
  return (
    <html lang="cs">
      <body style={{ margin: 0, padding: 0, backgroundColor: '#0b0c10', color: '#c5c6c7' }}>
        {children}
      </body>
    </html>
  )
}
