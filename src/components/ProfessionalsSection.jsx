import { getCachedPublicProfessionals } from '@/services/publicProfessionals';
import { normalizeProfessional } from '@/lib/professionals';
import ProfessionalsSectionClient from './ProfessionalsSectionClient';

export default async function ProfessionalsSection() {
    const professionals = await getCachedPublicProfessionals('Aracaju');
    return <ProfessionalsSectionClient initialProfessionals={professionals.map(normalizeProfessional)} />;
}
