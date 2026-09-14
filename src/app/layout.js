import { Nunito } from "next/font/google";
import PrivacyProvider from '@/components/PrivacyProvider';
import "./globals.css";
import { LocationProvider } from "@/components/LocationProvider";

const nunito = Nunito({ subsets: ["latin"], variable: '--font-nunito' });

export const metadata = {
  title: {
    default: 'SpaSmooth | Spa e Massoterapia em Aracaju, Maceió e Recife',
    template: '%s | SpaSmooth',
  },
  description: 'Spa e massoterapia profissional em Aracaju, Maceió e Recife. Massagem relaxante, terapêutica, day spa e bronzeamento em ambiente de alto padrão. Agende sua sessão.',
  metadataBase: new URL('https://spasmooth.com.br'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'SpaSmooth | Spa e Massoterapia em Aracaju, Maceió e Recife',
    description: 'Referência em massoterapia e bem-estar em Aracaju, Maceió e Recife. Agende sua sessão e renove suas energias em um ambiente preparado para relaxar.',
    url: 'https://spasmooth.com.br',
    siteName: 'SpaSmooth',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        width: 1200,
        height: 630,
        alt: 'Ambiente de relaxamento do SpaSmooth',
      }
    ],
    locale: 'pt_BR',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
    },
  },
  ...(process.env.NEXT_PUBLIC_GSC_VERIFICATION
    ? { verification: { google: process.env.NEXT_PUBLIC_GSC_VERIFICATION } }
    : {}),
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#ffffff',
};

const schemaData = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "SpaSmooth",
  "url": "https://spasmooth.com.br",
  "description": "Rede de spas e massoterapia com unidades em Aracaju, Maceió e Recife, oferecendo bem-estar físico e mental.",
  "sameAs": [
    "https://www.instagram.com/spa_smooth/"
  ]
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" className={nunito.variable}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
        />
      </head>
      <body className="text-slate-600 bg-white selection:bg-cyan-100 selection:text-cyan-800 font-nunito">
        <PrivacyProvider><LocationProvider>
          {children}
        </LocationProvider></PrivacyProvider>
      </body>
    </html>
  );
}
