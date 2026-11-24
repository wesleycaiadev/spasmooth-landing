import Link from 'next/link';
export const metadata = {
  title: 'Aviso de Privacidade',
  description: 'Saiba como o SpaSmooth trata dados de agendamento, respostas da ficha de anamnese e preferências de privacidade.',
  alternates: { canonical: '/privacidade' },
  openGraph: {
    title: 'Aviso de Privacidade | SpaSmooth',
    description: 'Saiba como o SpaSmooth trata dados de agendamento, respostas da ficha de anamnese e preferências de privacidade.',
    url: 'https://spasmooth.com.br/privacidade',
  },
};
export default function PrivacyPage() {
    return <main className="max-w-3xl mx-auto px-6 py-16 space-y-6 text-slate-800">
        <h1 className="text-3xl font-bold">Aviso de privacidade</h1>
        <p>O SpaSmooth utiliza nome, telefone, unidade, serviço, profissional e horário escolhidos para receber sua solicitação de agendamento e entrar em contato sobre o pedido. Use as observações do agendamento para informações práticas. A ficha de anamnese tem um espaço próprio para os cuidados de saúde que você quiser informar.</p>
        <p>Você pode agendar com estatísticas e mapas desativados. As escolhas de cookies e o consentimento da ficha são separados de qualquer autorização de publicidade.</p>
        <h2 className="text-xl font-semibold">Ficha de anamnese e dados de saúde</h2>
        <p>A ficha é opcional e fica vinculada ao seu pedido. Você pode deixar perguntas em branco ou pular a ficha e seguir para o agradecimento. Ao consentir no formulário, você autoriza o uso das respostas que escolher fornecer, inclusive dados de saúde, para preparar o atendimento e permitir a revisão pela profissional autorizada. A autorização do procedimento é tratada separadamente.</p>
        <p>As respostas, o mapa corporal e o registro da revisão são consultados no painel com login. A ficha clínica e seu PDF ficam disponíveis às profissionais designadas. O acesso à ficha e a revisão ficam registrados para controle de acesso.</p>
        <p>Quando o aviso administrativo por WhatsApp está habilitado, o CallMeBot recebe informações operacionais do pedido, o estado de preenchimento e links de acesso. Quando o acesso temporário está habilitado, a mensagem de uma ficha preenchida inclui um link para seu PDF, válido por 24 horas. Quem tiver uma cópia desse link poderá abrir o PDF durante esse prazo. O SpaSmooth orienta a equipe a manter o link restrito às profissionais autorizadas.</p>
        <p>Em condições usuais, o sistema descarta as respostas 30 dias após o envio da ficha e mantém os registros de auditoria por 90 dias. Informações necessárias para administrar o agendamento seguem o tratamento próprio do pedido.</p>
        <h2 className="text-xl font-semibold">Cookies e serviços externos</h2>
        <p>A escolha de unidade e as preferências de privacidade podem ficar salvas neste navegador. Cookies de segurança protegem as sessões de agendamento e administração. A preferência de cookies vence em 180 dias, o comprovante de agendamento em 30 minutos e a autorização administrativa em até 8 horas.</p>
        <p>Estatísticas do Google Analytics e mapas incorporados do Google ficam desativados até sua escolha. Use “Privacidade e cookies” para aceitar, rejeitar ou revogar essas opções. Ao abrir links para WhatsApp ou Google Maps, aplicam-se também as políticas desses serviços.</p>
        <p>O site usa Vercel para hospedagem, Supabase para banco de dados e imagens e Clerk para autenticação administrativa. Imagens externas podem ser carregadas para apresentar os serviços. Esses fornecedores podem processar dados técnicos de conexão e operar fora do Brasil.</p>
        <h2 className="text-xl font-semibold">Seus dados e direitos</h2>
        <p>Você pode solicitar confirmação do tratamento, acesso, correção, informações sobre compartilhamento ou exclusão de dados, conforme aplicável. Também pode revogar o consentimento da ficha. Para fazer um pedido, contate a unidade pelo canal de atendimento apresentado no site e identifique a solicitação como “Privacidade”. A equipe poderá confirmar sua identidade. A exclusão pode depender de obrigações de conservação aplicáveis.</p>
        <p>Você pode usar o site sem permitir cookies opcionais. As preferências salvas no navegador podem ser apagadas por você a qualquer momento.</p>
        <Link href="/#location" className="inline-block underline">Ver canais de atendimento das unidades</Link>
    </main>;
}
