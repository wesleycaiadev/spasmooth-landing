import { ClerkProvider } from "@clerk/nextjs";

export default function LoginLayout({ children }) {
    return (
        <ClerkProvider>
            {children}
        </ClerkProvider>
    );
}
