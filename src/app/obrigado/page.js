import Link from 'next/link';
import { CheckCircle, Clock } from 'lucide-react';

export default function ObrigadoPage() {
    return (
        <div className="min-h-screen bg-[#FFFDF9] flex flex-col items-center justify-center p-6 text-center">
            <div className="bg-white p-10 md:p-14 rounded-3xl border border-[#e6dcc5]/50 shadow-2xl shadow-[#b48e43]/10 max-w-lg w-full animate-slideUp">
                <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-100">
                    <CheckCircle className="w-10 h-10 text-green-600" />
                </div>

                <h1 className="text-3xl font-serif text-[#4a4a4a] mb-4">Solicitação Recebida!</h1>

                <p className="text-[#666] mb-8 leading-relaxed">
                    Recebemos seu pedido de agendamento com sucesso.
                    <br /><br />
                    <strong className="text-[#b48e43]">Fique atento(a) ao seu WhatsApp!</strong>
                    <br />
                    Nossa equipe entrará em contato em instantes para confirmar a disponibilidade do horário escolhido.
                </p>

                <div className="bg-[#fcfbf9] p-4 rounded-xl border border-[#f0e6d2] mb-8 flex items-center gap-4 text-left">
                    <div className="bg-[#b48e43]/10 p-3 rounded-full shrink-0">
                        <Clock className="text-[#b48e43] w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-[#b48e43] uppercase mb-0.5">Próximo Passo</p>
                        <p className="text-sm text-[#666] leading-tight">Aguarde nossa confirmação para garantir sua experiência.</p>
                    </div>
                </div>

                <Link
                    href="/"
                    className="block w-full bg-[#1a1a1a] hover:bg-black text-[#b48e43] font-bold py-4 rounded-xl shadow-lg transition-all transform hover:-translate-y-1 uppercase tracking-wide text-sm"
                >
                    Voltar para o Início
                </Link>
            </div>
        </div>
    );
}
