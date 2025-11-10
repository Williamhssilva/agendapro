import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import LogoUploader from "./LogoUploader";

async function updateHorarios(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user?.estabelecimentoId) {
    redirect("/login");
  }

  const estabelecimentoId = session.user.estabelecimentoId as string;

  const dias = [
    "segunda",
    "terca",
    "quarta",
    "quinta",
    "sexta",
    "sabado",
    "domingo",
  ];

  const horarios: Record<string, any> = {};
  for (const dia of dias) {
    // Checkbox retorna "on" quando marcado, null quando desmarcado
    const checkboxValue = formData.get(`${dia}_aberto`);
    const aberto = checkboxValue === "on" || checkboxValue === "true";
    const inicio = (formData.get(`${dia}_inicio`) as string) || "09:00";
    const fim = (formData.get(`${dia}_fim`) as string) || "18:00";
    
    horarios[dia] = aberto ? { aberto: true, inicio, fim } : { aberto: false };
  }

  const antecedenciaMinimaValue = (() => {
    const raw = formData.get("antecedenciaMinima");
    if (typeof raw === "string") {
      const parsed = Number(raw);
      if (!Number.isNaN(parsed) && parsed >= 0) {
        return parsed;
      }
    }
    return 120;
  })();

  await prisma.configuracao.update({
    where: { estabelecimentoId },
    data: {
      horariosFuncionamento: JSON.stringify(horarios),
      antecedenciaMinima: antecedenciaMinimaValue,
    },
  });

  // Revalidar a página para mostrar os novos horários
  revalidatePath("/configuracoes");
}

async function updateEstabelecimento(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user?.estabelecimentoId) {
    redirect("/login");
  }

  const estabelecimentoId = session.user.estabelecimentoId as string;

  const nome = (formData.get("nome") as string) || "";
  const email = (formData.get("email") as string) || null;
  const telefone = (formData.get("telefone") as string) || null;
  const endereco = (formData.get("endereco") as string) || null;
  const cidade = (formData.get("cidade") as string) || null;
  const estado = (formData.get("estado") as string) || null;
  const corPrimaria = (formData.get("corPrimaria") as string) || "#4F46E5";

  // Não alterar logoUrl aqui (upload já atualiza). Apenas se vier explicitamente preenchido.
  const updateData: any = { nome, email, telefone, endereco, cidade, estado, corPrimaria };
  const logoFromForm = formData.get("logoUrl");
  if (logoFromForm && typeof logoFromForm === "string" && logoFromForm.trim().length > 0) {
    updateData.logoUrl = logoFromForm.trim();
  }

  await prisma.estabelecimento.update({ where: { id: estabelecimentoId }, data: updateData });
  
  // Revalidar a página para mostrar as alterações
  revalidatePath("/configuracoes");
}

export default async function ConfiguracoesPage() {
  const session = await auth();
  if (!session?.user?.estabelecimentoId) {
    redirect("/login");
  }

  const estabelecimentoId = session.user.estabelecimentoId as string;

  const [estabelecimento, configuracao] = await Promise.all([
    prisma.estabelecimento.findUnique({ where: { id: estabelecimentoId } }),
    prisma.configuracao.findUnique({ where: { estabelecimentoId } }),
  ]);

  if (!estabelecimento) {
    redirect("/login");
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-1">Configurações do Estabelecimento</h1>
      <p className="text-sm text-gray-600 mb-6">Atualize os dados visuais e de contato. As alterações de cor e logo refletem imediatamente na área do cliente.</p>

      <form action={updateEstabelecimento} className="space-y-6 bg-white p-6 rounded-lg shadow">
        <div>
          <label className="block text-sm font-medium text-gray-700">Nome</label>
          <input name="nome" defaultValue={estabelecimento.nome} className="mt-1 w-full border rounded p-2" required />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input name="email" type="email" defaultValue={estabelecimento.email || ""} className="mt-1 w-full border rounded p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Telefone</label>
            <input name="telefone" defaultValue={estabelecimento.telefone || ""} className="mt-1 w-full border rounded p-2" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Endereço</label>
          <input name="endereco" defaultValue={estabelecimento.endereco || ""} className="mt-1 w-full border rounded p-2" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Cidade</label>
            <input name="cidade" defaultValue={estabelecimento.cidade || ""} className="mt-1 w-full border rounded p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Estado</label>
            <input name="estado" defaultValue={estabelecimento.estado || ""} className="mt-1 w-full border rounded p-2" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Logo</label>
            <LogoUploader existingUrl={estabelecimento.logoUrl || ""} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Cor Primária</label>
            <div className="flex items-center gap-3 mt-1">
              <input name="corPrimaria" type="color" defaultValue={estabelecimento.corPrimaria || "#4F46E5"} className="h-10 w-16 p-1 border rounded" />
              <span className="text-sm text-gray-600">Escolha a cor do tema</span>
            </div>
          </div>
        </div>
        <div className="flex justify-end">
          <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Salvar alterações</button>
        </div>
      </form>

      <div className="mt-6 bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-2">Horários de Funcionamento</h2>
        <form action={updateHorarios} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Antecedência mínima (minutos)</label>
              <input
                name="antecedenciaMinima"
                type="number"
                min={0}
                step={15}
                defaultValue={configuracao?.antecedenciaMinima ?? 120}
                className="mt-1 w-full border rounded p-2"
              />
              <p className="text-xs text-gray-500 mt-1">
                Tempo mínimo antes do horário para permitir novos agendamentos.
              </p>
            </div>
          </div>
          {(() => {
            const dias = [
              { k: "segunda", label: "Segunda" },
              { k: "terca", label: "Terça" },
              { k: "quarta", label: "Quarta" },
              { k: "quinta", label: "Quinta" },
              { k: "sexta", label: "Sexta" },
              { k: "sabado", label: "Sábado" },
              { k: "domingo", label: "Domingo" },
            ];
            let json: any = {};
            try {
              json = configuracao?.horariosFuncionamento ? JSON.parse(configuracao.horariosFuncionamento) : {};
            } catch {
              json = {};
            }
            return dias.map(({ k, label }) => {
              const d = json[k] || { aberto: false, inicio: "09:00", fim: "18:00" };
              return (
                <div key={k} className="grid grid-cols-1 md:grid-cols-4 items-end gap-3">
                  <div className="flex items-center gap-2">
                    <input id={`${k}_aberto`} name={`${k}_aberto`} type="checkbox" defaultChecked={!!d.aberto} className="h-4 w-4" />
                    <label htmlFor={`${k}_aberto`} className="text-sm font-medium text-gray-700 w-24">{label}</label>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600">Início</label>
                    <input name={`${k}_inicio`} type="time" defaultValue={d.inicio || "09:00"} className="mt-1 w-full border rounded p-2" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600">Fim</label>
                    <input name={`${k}_fim`} type="time" defaultValue={d.fim || "18:00"} className="mt-1 w-full border rounded p-2" />
                  </div>
                  <div className="text-xs text-gray-500">{d.aberto ? "Aberto" : "Fechado"}</div>
                </div>
              );
            });
          })()}
          <div className="flex justify-end">
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Salvar horários</button>
          </div>
        </form>
      </div>
      </div>
    </div>
  );
}


