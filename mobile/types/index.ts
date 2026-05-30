/**
 * Tipos TypeScript do App Scholar Mobile
 * Espelham os modelos do backend — mantidos iguais à versão web.
 */

export type Perfil = "ADMIN" | "PROFESSOR" | "ALUNO";

export interface Usuario {
  id: number;
  email: string;
  perfil: Perfil;
  nome: string;
  primeiroAcesso: boolean;
}

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
  usuario?: { email: string; primeiroAcesso: boolean; ativo?: boolean };
  notas?: Nota[];
}

export interface Professor {
  id: number;
  usuarioId: number;
  nome: string;
  titulacao?: string;
  area?: string;
  tempoDocencia?: number;
  usuario?: { email: string };
  disciplinas?: Disciplina[];
}

export interface Disciplina {
  id: number;
  nome: string;
  cargaHoraria: number;
  professorId: number;
  curso: string;
  semestre: number;
  descricao?: string;
  professor?: { nome: string; titulacao?: string; area?: string };
  _count?: { notas: number };
}

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
