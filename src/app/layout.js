import { Nunito } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

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
    <ClerkProvider>
      <html lang="pt-BR" className={nunito.variable}>
        <head>
          <link rel="icon" type="image/svg+xml" href="/assets/favicon.svg" />
          <script defer src="https://unpkg.com/lucide@latest"></script>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
          />
        </head>
        <body className="text-slate-600 bg-white selection:bg-cyan-100 selection:text-cyan-800 font-nunito">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
