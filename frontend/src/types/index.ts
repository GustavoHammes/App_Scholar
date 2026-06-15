/**
 * Tipos TypeScript do App Scholar
 * Define as interfaces de dados usadas em todo o frontend.
 * Devem espelhar os modelos do Prisma no backend.
 */

export type Perfil = "ADMIN" | "PROFESSOR" | "ALUNO";

export interface Usuario {
  id: number;
  email: string;
  perfil: Perfil;
  nome: string;
  primeiroAcesso: boolean;
}

export interface Curso {
  id: number;
  nome: string;
  area: string;
  duracaoSemestres: number;
  descricao?: string | null;
  ativo: boolean;
  coordenadorId?: number | null;
  criadoEm?: string;
  atualizadoEm?: string;
  coordenador?: {
    id: number;
    nome: string;
    titulacao?: string | null;
    area?: string | null;
  } | null;
  _count?: {
    alunos: number;
    disciplinas: number;
  };
}

export interface Aluno {
  id: number;
  usuarioId: number;
  nome: string;
  matricula: string;
  cursoId: number;
  curso?: Curso;
  telefone?: string;
  cep?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  criadoEm?: string;
  atualizadoEm?: string;
  usuario?: {
    email: string;
    primeiroAcesso: boolean;
    ativo?: boolean;
  };
  notas?: Nota[];
}

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
  cursosCoordenados?: Curso[];
}

export interface Disciplina {
  id: number;
  nome: string;
  cargaHoraria: number;
  professorId: number;
  cursoId: number;
  curso?: Curso;
  semestre: number;
  descricao?: string;
  ativo?: boolean;
  professor?: {
    nome: string;
    titulacao?: string;
    area?: string;
  };
  _count?: {
    notas: number;
  };
}

export interface Nota {
  id: number;
  alunoId: number;
  disciplinaId: number;
  nota1?: number;
  nota2?: number;
  media?: number;
  situacao?: "Aprovado" | "Recuperação" | "Reprovado";
  aluno?: {
    nome: string;
    matricula: string;
  };
  disciplina?: Disciplina & {
    professor?: {
      nome: string;
    };
  };
}

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

export interface EnderecoViaCEP {
  logradouro: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

export type FormErrors<T> = Partial<Record<keyof T, string>>;
