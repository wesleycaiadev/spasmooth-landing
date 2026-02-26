import { ClerkProvider } from "@clerk/nextjs";

export default function EntrarLayout({ children }) {
    return (
        <ClerkProvider>
            {children}
        </ClerkProvider>
    );
}
