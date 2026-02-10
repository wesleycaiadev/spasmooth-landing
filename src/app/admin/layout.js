"use client";
import { useEffect } from 'react';
import Link from 'next/link';
import { UserButton, useUser } from "@clerk/nextjs";
import { useRouter } from 'next/navigation';
import { LayoutDashboard, Users, Settings, Briefcase, Calendar } from 'lucide-react';

const sidebarItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/admin/dashboard' },
    { icon: Users, label: 'Gestão de Leads', href: '/admin/kanban' },
    { icon: Calendar, label: 'Agenda', href: '/admin/calendar' }, // Added Calendar
    { icon: Briefcase, label: 'Profissionais', href: '/admin/professionals' },
    { icon: Settings, label: 'Configurações', href: '/admin/settings' },
];

import AdminNotifications from '@/components/admin/AdminNotifications';

export default function AdminLayout({ children }) {
    const { user, isLoaded, isSignedIn } = useUser();
    const router = useRouter();

    const ALLOWED_EMAILS = ['wesleycaia.dev@gmail.com', 'Layararenata123@gmail.com'];

    useEffect(() => {
        if (isLoaded && !isSignedIn) {
            router.push('/entrar');
        } else if (isLoaded && isSignedIn) {
            const userEmail = user?.primaryEmailAddress?.emailAddress?.toLowerCase();
            const allowed = ALLOWED_EMAILS.map(e => e.toLowerCase());
            if (!allowed.includes(userEmail)) {
                router.push('/');
            }
        }
    }, [isLoaded, isSignedIn, user, router]);

    if (!isLoaded) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600"></div>
            </div>
        );
    }

    const userEmail = user?.primaryEmailAddress?.emailAddress?.toLowerCase();
    const isAuthorized = isSignedIn && ALLOWED_EMAILS.map(e => e.toLowerCase()).includes(userEmail);

    if (!isAuthorized) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600"></div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-cyan-50 via-white to-sky-50">
            <AdminNotifications />
            {/* Sidebar (Glassmorphism) */}
            <aside className="w-72 bg-white/80 backdrop-blur-lg border-r border-white/50 fixed h-full z-20 hidden md:block shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
                <div className="p-8 border-b border-slate-100/50 flex items-center justify-between">
                    <span className="font-serif font-bold text-slate-800 text-2xl tracking-tight">SpaSmooth</span>
                    <UserButton afterSignOutUrl="/entrar" />
                </div>

                <nav className="p-4 space-y-2 mt-4">
                    {sidebarItems.map((item) => (
                        <NavItem key={item.href} href={item.href} icon={<item.icon size={20} />} label={item.label} />
                    ))}
                </nav>

                {/* Decorative Bottom */}
                <div className="absolute bottom-0 left-0 right-0 p-8 opacity-50 pointer-events-none">
                    <div className="w-32 h-32 bg-cyan-200/30 rounded-full blur-3xl absolute -bottom-10 -left-10"></div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 md:ml-72 p-8 md:p-12 relative">
                {/* Decorative Background Blob */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-sky-200/20 rounded-full blur-[100px] pointer-events-none -z-10"></div>

                {children}
            </main>
        </div>
    );
}

function NavItem({ href, icon, label }) {
    const router = useRouter();
    // Simple check for active state could be added here if we had current path
    return (
        <Link href={href} className="flex items-center gap-3 px-5 py-3.5 text-slate-500 hover:text-cyan-700 hover:bg-gradient-to-r hover:from-cyan-50 hover:to-transparent rounded-xl transition-all duration-300 group font-medium relative overflow-hidden">
            <span className="relative z-10 group-hover:scale-110 transition-transform duration-300">{icon}</span>
            <span className="relative z-10">{label}</span>
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity rounded-r-full"></div>
        </Link>
    );
}
