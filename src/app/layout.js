import { Nunito } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const nunito = Nunito({ subsets: ["latin"], variable: '--font-nunito' });

export const metadata = {
  title: "SpaSmooth | Massoterapia em Aracaju - Relaxe e Regenere",
  description: "SpaSmooth - Massoterapia profissional em Aracaju. Oferecemos massagem relaxante, terapêutica, drenagem linfática e reflexologia para seu bem-estar.",
  keywords: "massoterapia, massagem, spa, aracaju, relaxamento, bem-estar, massagem relaxante, massagem terapêutica",
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
