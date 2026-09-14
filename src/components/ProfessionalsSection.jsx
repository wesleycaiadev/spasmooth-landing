import { getActiveProfessionals } from '@/services/booking';
import { normalizeProfessional } from '@/lib/professionals';
import ProfessionalsSectionClient from './ProfessionalsSectionClient';

export default async function ProfessionalsSection() {
    const result = await getActiveProfessionals('Aracaju');
    const professionals = result.success && result.data ? result.data : [];
    return <ProfessionalsSectionClient initialProfessionals={professionals.map(normalizeProfessional)} />;
}
