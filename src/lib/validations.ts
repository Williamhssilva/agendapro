import { z } from "zod";

// Validação para Serviço
export const ServicoSchema = z.object({
  nome: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  descricao: z.string().optional(),
  categoria: z.enum(["cabelo", "barba", "unhas", "estetica", "spa"], {
    required_error: "Selecione uma categoria",
  }),
  duracao: z.coerce.number().min(5, "Duração mínima de 5 minutos").max(480, "Duração máxima de 8 horas"),
  preco: z.coerce.number().min(0, "Preço deve ser positivo"),
  ativo: z.boolean().default(true),
});

export type ServicoFormData = z.infer<typeof ServicoSchema>;

// Validação para Profissional
export const ProfissionalSchema = z.object({
  nome: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  telefone: z.string().optional(),
  especialidade: z.string().optional(),
  ativo: z.boolean().default(true),
});

export type ProfissionalFormData = z.infer<typeof ProfissionalSchema>;

// Validação para Cliente
export const ClienteSchema = z.object({
  nome: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  telefone: z.string().min(10, "Telefone inválido"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
});

export type ClienteFormData = z.infer<typeof ClienteSchema>;

// Validação para Agendamento
export const AgendamentoSchema = z.object({
  clienteId: z.string().cuid("Cliente inválido"),
  servicoId: z.string().cuid("Serviço inválido"),
  profissionalId: z.string().cuid("Profissional inválido"),
  dataHora: z.coerce.date(),
  observacoes: z.string().optional(),
});

export type AgendamentoFormData = z.infer<typeof AgendamentoSchema>;

