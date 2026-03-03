import { Nunito } from "next/font/google";
import { GoogleAnalytics } from '@next/third-parties/google';
import "./globals.css";
import { LocationProvider } from "@/components/LocationProvider";

const nunito = Nunito({ subsets: ["latin"], variable: '--font-nunito' });

export const metadata = {
  title: "SpaSmooth | Massoterapia em Aracaju - Relaxe e Regenere",
  description: "SpaSmooth - Massoterapia profissional em Aracaju. Oferecemos massagem relaxante, terapêutica, drenagem linfática e reflexologia para seu bem-estar.",
  keywords: "massoterapia, massagem, spa, aracaju, relaxamento, bem-estar, massagem relaxante, massagem terapêutica, drenagem linfática",
  metadataBase: new URL('https://spasmooth.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "SpaSmooth | Massoterapia e Spa em Aracaju",
    description: "Referência em massoterapia e bem-estar em Aracaju. Agende sua sessão e renove suas energias em um ambiente preparado para relaxar e regenerar a saúde.",
    url: 'https://spasmooth.vercel.app',
    siteName: 'SpaSmooth',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        width: 1200,
        height: 630,
        alt: 'Interior relaxante do SpaSmooth Aracaju',
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
  verification: {
    google: process.env.NEXT_PUBLIC_GSC_VERIFICATION || 'adicione-seu-codigo-google-search-console-aqui',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#ffffff',
};

const schemaData = {
  "@context": "https://schema.org",
  "@type": "HealthAndBeautyBusiness",
  "name": "SpaSmooth",
  "image": "https://spasmooth.vercel.app/assets/logo.png",
  "description": "A melhor experiência de spa e massoterapia de excelência localizada em Aracaju, oferecendo bem-estar físico e mental.",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Aracaju",
    "addressRegion": "SE",
    "addressCountry": "BR"
  },
  "priceRange": "$$"
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" className={nunito.variable}>
      <head>
        <link rel="icon" type="image/svg+xml" href="/assets/favicon.svg" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
        />
      </head>
      <body className="text-slate-600 bg-white selection:bg-cyan-100 selection:text-cyan-800 font-nunito">
        <LocationProvider>
          {children}
          {process.env.NEXT_PUBLIC_GA_ID && <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />}
        </LocationProvider>
      </body>
    </html>
  );
}
