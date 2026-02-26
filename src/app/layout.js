export const metadata = {
  title: {
    default: 'The Hardware Guru | Tech, Gaming & AI',
    template: '%s | The Hardware Guru'
  },
  description: 'Exkluzivní novinky ze světa hardwaru, recenze her a streamy s unikátní AI. Tvůj průvodce moderní technologií.',
  keywords: ['hardware', 'gaming', 'AI', 'recenze', 'PC sestavy', 'The Hardware Guru', 'stream'],
  authors: [{ name: 'The Hardware Guru' }],
  creator: 'The Hardware Guru',
  metadataBase: new URL('https://www.thehardwareguru.cz'),
  
  // Tohle zajistí hezké náhledy na Facebooku, Discordu atd.
  openGraph: {
    title: 'The Hardware Guru | Tech, Gaming & AI',
    description: 'Hardware, gaming a tech novinky na jednom místě.',
    url: 'https://www.thehardwareguru.cz',
    siteName: 'The Hardware Guru',
    images: [
      {
        url: 'https://i.postimg.cc/QdWxszv3/bg-guru.png', // Náhledový obrázek webu
        width: 1200,
        height: 630,
        alt: 'The Hardware Guru Banner',
      },
    ],
    locale: 'cs_CZ',
    type: 'website',
  },
  
  // Tohle je pro zobrazení na Twitteru/X
  twitter: {
    card: 'summary_large_image',
    title: 'The Hardware Guru',
    description: 'Tech, Gaming & AI novinky.',
    images: ['https://i.postimg.cc/QdWxszv3/bg-guru.png'],
  },

  // Ikony (pokud máš faviconu, doplň cesty)
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="cs">
      <body style={{ 
        margin: 0, 
        padding: 0, 
        backgroundColor: '#0b0c10', 
        color: '#c5c6c7',
        minHeight: '100vh' 
      }}>
        {children}
      </body>
    </html>
  )
}
