/**
 * Tipos TypeScript do App Scholar Mobile
 * Espelham os modelos do backend.
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
