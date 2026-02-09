import { SignIn } from "@clerk/nextjs";

export default function LoginPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="max-w-md w-full p-6">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-slate-800">Admin Login</h1>
                    <p className="text-slate-500">Acesso via E-mail ou Google.</p>
                </div>
                <div className="flex justify-center">
                    <SignIn
                        routing="path"
                        path="/login"
                        appearance={{
                            elements: {
                                card: 'shadow-lg border-0',
                                rootBox: "w-full"
                            }
                        }}
                        forceRedirectUrl="/admin/kanban"
                    />
                </div>
            </div>
        </div>
    );
}
