import '../styles/globals.css';

export const viewport = {
  themeColor: '#060b12',
};

export const metadata = {
  title: 'DevOps Disaster Simulator',
  description: 'Simulador de desastres DevOps. Gestiona servidores, resuelve incidencias, mantén el SLA y haz crecer tu empresa de hosting. Juega gratis en el navegador.',
  openGraph: {
    type: 'website',
    title: 'DevOps Disaster Simulator',
    description: 'Gestiona servidores, resuelve incidencias en tiempo real, mantén el SLA y haz crecer tu empresa de hosting. Juega gratis.',
    siteName: 'DevOps Disaster Simulator',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DevOps Disaster Simulator',
    description: 'Simulador de desastres DevOps. Gestiona servidores, resuelve incidencias y mantén el SLA.',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
