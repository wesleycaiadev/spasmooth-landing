import { redirect } from 'next/navigation';
import { verifyAdmin } from '@/lib/auth';
import AdminShell from '@/components/admin/AdminShell';
export const dynamic = 'force-dynamic';
export const metadata = { robots: { index: false, follow: false } };
export default async function AdminLayout({ children }) {
    const result = await verifyAdmin();
    if (!result.success) redirect('/entrar');
    return <AdminShell>{children}</AdminShell>;
}
