import './globals.css';
import Nav from '../components/Nav';

export const metadata = {
  title: 'Painel Rubens',
  description: 'Saúde, tarefas e notas num lugar só.',
  manifest: '/manifest.webmanifest',
  appleWebApp: { capable: true, title: 'Painel', statusBarStyle: 'black-translucent' },
  icons: { icon: '/icons/icon-192.png', apple: '/apple-touch-icon.png' }
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#0c0c0e'
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700&family=Barlow+Semi+Condensed:wght@500;600;700&display=swap"
        />
      </head>
      <body>
        {children}
        <Nav />
      </body>
    </html>
  );
}
