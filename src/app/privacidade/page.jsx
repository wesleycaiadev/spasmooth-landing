import Link from 'next/link';
export const metadata = { title: 'Privacidade | SpaSmooth' };
export default function PrivacyPage() {
    return <main className="max-w-3xl mx-auto px-6 py-16 space-y-6 text-slate-800">
        <h1 className="text-3xl font-bold">Aviso de privacidade</h1>
        <p>O SpaSmooth utiliza nome, telefone, unidade, serviço, profissional e horário escolhidos para receber e atender sua solicitação de agendamento e entrar em contato a respeito dela. As observações são opcionais: não inclua informações de saúde, documentos, senhas ou outros dados sensíveis.</p>
        <p>O agendamento é independente de aceitar estatísticas ou mapas. A confirmação de leitura do aviso não autoriza publicidade. Não solicitamos consentimento de marketing neste formulário.</p>
        <h2 className="text-xl font-semibold">Cookies e serviços externos</h2>
        <p>A escolha de unidade e as preferências de privacidade podem ficar salvas neste navegador. Cookies de segurança protegem as sessões de agendamento e administração. A preferência de cookies vence em 180 dias, o comprovante de agendamento em 30 minutos e a autorização administrativa em até 8 horas.</p>
        <p>Estatísticas do Google Analytics e mapas incorporados do Google ficam desativados até sua escolha. Use “Privacidade e cookies” para aceitar, rejeitar ou revogar essas opções. Ao abrir links para WhatsApp ou Google Maps, aplicam-se também as políticas desses serviços.</p>
        <p>O site usa Vercel para hospedagem, Supabase para banco de dados e imagens e Clerk para autenticação administrativa. Imagens externas podem ser carregadas para apresentar os serviços. Esses fornecedores podem processar dados técnicos de conexão e operar fora do Brasil.</p>
        <h2 className="text-xl font-semibold">Seus dados e direitos</h2>
        <p>Para solicitar acesso, correção, informações sobre tratamento ou exclusão de seus dados, contate a unidade pelo canal de atendimento apresentado no site e identifique a solicitação como “Privacidade”. A equipe poderá confirmar sua identidade antes de atender. A exclusão pode depender de obrigações de conservação aplicáveis.</p>
        <p>Você pode usar o site sem permitir cookies opcionais. As preferências salvas no navegador podem ser apagadas por você a qualquer momento.</p>
        <Link href="/#location" className="inline-block underline">Ver canais de atendimento das unidades</Link>
    </main>;
}
