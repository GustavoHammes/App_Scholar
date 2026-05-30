/**
 * Tipos TypeScript do App Scholar
 * Define as interfaces de dados usadas em todo o frontend.
 * Devem espelhar os modelos do Prisma no backend.
 */

// Perfis de acesso disponíveis no sistema
export type Perfil = "ADMIN" | "PROFESSOR" | "ALUNO";

// Dados do usuário autenticado (armazenados no contexto de auth)
export interface Usuario {
  id: number;
  email: string;
  perfil: Perfil;
  nome: string;
  primeiroAcesso: boolean;
}

// Dados de um aluno
export interface Aluno {
  id: number;
  usuarioId: number;
  nome: string;
  matricula: string;
  curso: string;
  telefone?: string;
  cep?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  criadoEm?: string;
  usuario?: {
    email: string;
    primeiroAcesso: boolean;
    ativo?: boolean;
  };
  notas?: Nota[];
}

// Dados de um professor
export interface Professor {
  id: number;
  usuarioId: number;
  nome: string;
  titulacao?: string;
  area?: string;
  tempoDocencia?: number;
  usuario?: {
    email: string;
    ativo?: boolean;
  };
  disciplinas?: Disciplina[];
}

// Dados de uma disciplina
export interface Disciplina {
  id: number;
  nome: string;
  cargaHoraria: number;
  professorId: number;
  curso: string;
  semestre: number;
  descricao?: string;
  professor?: {
    nome: string;
    titulacao?: string;
    area?: string;
  };
  _count?: { notas: number };
}

// Dados de uma nota
export interface Nota {
  id: number;
  alunoId: number;
  disciplinaId: number;
  nota1?: number;
  nota2?: number;
  media?: number;
  situacao?: "Aprovado" | "Recuperação" | "Reprovado";
  aluno?: { nome: string; matricula: string };
  disciplina?: Disciplina & { professor?: { nome: string } };
}

// Resposta do endpoint de boletim
export interface Boletim {
  aluno: string;
  matricula: string;
  curso: string;
  disciplinas: Array<{
    disciplina: string;
    professor: string;
    cargaHoraria: number;
    semestre: number;
    nota1?: number;
    nota2?: number;
    media?: number;
    situacao?: string;
  }>;
}

// Dados retornados pelo endpoint de endereço (ViaCEP)
export interface EnderecoViaCEP {
  logradouro: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

// Estado de um formulário (erros por campo)
export type FormErrors<T> = Partial<Record<keyof T, string>>;
