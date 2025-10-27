import { getTenantBySubdomain } from "@/lib/tenant";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function ConfirmacaoPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const tenant = await getTenantBySubdomain();
  const params = await searchParams;

  if (!tenant) {
    return <div>Estabelecimento não encontrado</div>;
  }

  // Buscar agendamento
  let agendamento = null;
  if (params.id) {
    agendamento = await prisma.agendamento.findFirst({
      where: {
        id: params.id,
        estabelecimentoId: tenant.id,
      },
      include: {
        cliente: true,
        servico: true,
        profissional: true,
      },
    });
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
        {/* Sucesso */}
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-4">Agendamento Confirmado!</h1>
        <p className="text-gray-600 mb-8">
          Seu horário foi reservado com sucesso. Em breve você receberá uma confirmação por WhatsApp.
        </p>

        {/* Resumo do Agendamento */}
        {agendamento && (
          <div className="bg-gray-50 rounded-xl p-6 mb-8 text-left">
            <h2 className="font-bold text-gray-900 mb-4 text-center">Detalhes do Agendamento</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Serviço:</span>
                <span className="font-medium text-gray-900">{agendamento.servico.nome}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Profissional:</span>
                <span className="font-medium text-gray-900">{agendamento.profissional.nome}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Data:</span>
                <span className="font-medium text-gray-900">
                  {new Date(agendamento.dataHora).toLocaleDateString("pt-BR", {
                    weekday: "long",
                    day: "2-digit",
                    month: "long",
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Horário:</span>
                <span className="font-medium text-gray-900">
                  {new Date(agendamento.dataHora).toLocaleTimeString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Valor:</span>
                <span className="font-bold text-indigo-600 text-lg">
                  R$ {agendamento.servico.preco.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Informações Importantes */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg mb-8 text-left">
          <p className="font-medium text-blue-900 mb-2">📋 Informações Importantes:</p>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Chegue com 10 minutos de antecedência</li>
            <li>• Você receberá um lembrete 24h antes</li>
            <li>• Para cancelar, entre em contato conosco</li>
          </ul>
        </div>

        {/* Contato */}
        {tenant.telefone && (
          <div className="mb-8">
            <p className="text-gray-600 mb-3">Dúvidas? Entre em contato:</p>
            <a
              href={`https://wa.me/55${tenant.telefone.replace(/\D/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-medium"
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              WhatsApp
            </a>
          </div>
        )}

        {/* Voltar */}
        <Link
          href="/"
          className="inline-block text-gray-600 hover:text-gray-900 font-medium"
        >
          ← Voltar para início
        </Link>
      </div>
    </div>
  );
}

