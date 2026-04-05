import { listBookings } from "@/services/admin/bookings";
import { getProfessionals } from "@/services/admin/professionals";
import BookingsTable from "@/components/admin/BookingsTable";
import WeeklyCalendar from "@/components/admin/WeeklyCalendar";

export default async function AdminBookingsPage() {
    const [bookingsResult, prosResult] = await Promise.all([
        listBookings(),
        getProfessionals(),
    ]);

    const bookings = bookingsResult.success ? bookingsResult.data ?? [] : [];
    const professionals = prosResult ?? [];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-slate-800">Agendamentos</h1>
                <p className="text-slate-500 text-sm mt-1">
                    Gerencie os agendamentos do Spasmooth
                </p>
            </div>

            <BookingsTable
                initialBookings={bookings}
                professionals={professionals}
            />

            <div className="border-t border-slate-200 pt-8">
                <h2 className="text-lg font-bold text-slate-800 mb-4">
                    Grade Semanal
                </h2>
                <WeeklyCalendar professionals={professionals} />
            </div>
        </div>
    );
}
