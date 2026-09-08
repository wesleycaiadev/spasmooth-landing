import { ClerkProvider } from "@clerk/nextjs";

export const metadata = {
    title: 'Entrar',
    robots: { index: false, follow: false },
};

export default function EntrarLayout({ children }) {
    return (
        <ClerkProvider>
            {children}
        </ClerkProvider>
    );
}
