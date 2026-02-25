import { Nunito } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const nunito = Nunito({ subsets: ["latin"], variable: '--font-nunito' });

export const metadata = {
  title: "SpaSmooth | Spa e Massoterapia em Aracaju",
  description: "SpaSmooth - Massoterapia profissional em Aracaju. Oferecemos massagem relaxante, terapêutica, drenagem linfática e reflexologia para o seu bem-estar.",
  keywords: ["massoterapia", "massagem", "spa", "aracaju", "relaxamento", "bem-estar", "massagem relaxante", "massagem terapêutica"],

  alternates: {
    canonical: 'https://spasmooth.vercel.app', // Domínio genérico, você pode trocar depois
  },

  robots: {
    index: true,
    follow: true,
  },

  openGraph: {
    title: "SpaSmooth | Massoterapia em Aracaju",
    description: "Recupere as suas energias. Oferecemos massagens terapêuticas e relaxantes no coração de Aracaju.",
    url: 'https://spasmooth.vercel.app',
    siteName: 'SpaSmooth',
    locale: 'pt_BR',
    type: 'website',
    images: [
      {
        url: '/images/ambiente.jpg',
        width: 1200,
        height: 630,
        alt: 'Ambiente relaxante do SpaSmooth',
      },
    ],
  },
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="pt-BR" className={nunito.variable}>
        <head>
          <link rel="icon" type="image/svg+xml" href="/assets/favicon.svg" />
          <script defer src="https://unpkg.com/lucide@latest"></script>
        </head>
        <body className="text-slate-600 bg-white selection:bg-cyan-100 selection:text-cyan-800 font-nunito">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
