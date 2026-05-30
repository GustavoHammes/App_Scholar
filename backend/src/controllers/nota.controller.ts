/**
 * Controller de Notas
 * Gerencia lançamento e atualização de notas com cálculo automático de média e situação.
 *
 * Regra de cálculo:
 *   média = (nota1 + nota2) / 2
 *   >= 6.0 → "Aprovado" | >= 4.0 → "Recuperação" | < 4.0 → "Reprovado"
 *
 * Permissões:
 * - ADMIN: acesso total
 * - PROFESSOR: criar/editar notas das próprias disciplinas
 * - ALUNO: somente visualização das próprias notas
 */

import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

// Calcula média e situação com base nas duas notas
function calcularNota(nota1?: number, nota2?: number) {
  if (nota1 === undefined || nota1 === null || nota2 === undefined || nota2 === null) {
    return { media: null, situacao: null };
  }

  const media = parseFloat(((nota1 + nota2) / 2).toFixed(1));
  let situacao: string;

  if (media >= 6.0) situacao = "Aprovado";
  else if (media >= 4.0) situacao = "Recuperação";
  else situacao = "Reprovado";

  return { media, situacao };
}

// ─────────────────────────────────────────────
// LISTAR NOTAS DE UM ALUNO
// ─────────────────────────────────────────────
export async function listarPorAluno(req: Request, res: Response) {
  const { alunoId } = req.params;
  const { perfil, id: usuarioId } = req.user!;

  try {
    const aluno = await prisma.aluno.findUnique({
      where: { id: Number(alunoId) },
    });

    if (!aluno) {
      return res.status(404).json({ error: "Aluno não encontrado" });
    }

    // Aluno só pode ver as próprias notas
    if (perfil === "ALUNO" && aluno.usuarioId !== usuarioId) {
      return res.status(403).json({ error: "Acesso negado" });
    }

    const notas = await prisma.nota.findMany({
      where: { alunoId: Number(alunoId) },
      include: {
        disciplina: {
          include: { professor: { select: { nome: true } } },
        },
      },
      orderBy: { disciplina: { nome: "asc" } },
    });

    return res.json(notas);
  } catch (error) {
    console.error("[NOTA] Erro ao listar por aluno:", error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
}

// ─────────────────────────────────────────────
// LISTAR NOTAS DE UMA DISCIPLINA
// ─────────────────────────────────────────────
export async function listarPorDisciplina(req: Request, res: Response) {
  const { disciplinaId } = req.params;
  const { perfil, id: usuarioId } = req.user!;

  try {
    // Professor só pode ver notas das próprias disciplinas
    if (perfil === "PROFESSOR") {
      const disciplina = await prisma.disciplina.findUnique({
        where: { id: Number(disciplinaId) },
        include: { professor: true },
      });

      if (disciplina?.professor.usuarioId !== usuarioId) {
        return res.status(403).json({ error: "Acesso negado" });
      }
    }

    const notas = await prisma.nota.findMany({
      where: { disciplinaId: Number(disciplinaId) },
      include: {
        aluno: { select: { id: true, nome: true, matricula: true } },
      },
      orderBy: { aluno: { nome: "asc" } },
    });

    return res.json(notas);
  } catch (error) {
    console.error("[NOTA] Erro ao listar por disciplina:", error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
}

// ─────────────────────────────────────────────
// CRIAR NOTA
// Lança nota1 e/ou nota2 para um aluno em uma disciplina
// ─────────────────────────────────────────────
export async function criar(req: Request, res: Response) {
  const { alunoId, disciplinaId, nota1, nota2 } = req.body;
  const { perfil, id: usuarioId } = req.user!;

  if (!alunoId || !disciplinaId) {
    return res.status(400).json({ error: "ID do aluno e da disciplina são obrigatórios" });
  }

  try {
    const disciplina = await prisma.disciplina.findUnique({
      where: { id: Number(disciplinaId) },
      include: { professor: true },
    });

    if (!disciplina) {
      return res.status(404).json({ error: "Disciplina não encontrada" });
    }

    // Semestres encerrados têm notas bloqueadas para qualquer edição
    if (!disciplina.ativo) {
      return res.status(403).json({
        error: "Esta disciplina pertence a um semestre encerrado. As notas estão bloqueadas.",
      });
    }

    if (perfil === "PROFESSOR" && disciplina.professor.usuarioId !== usuarioId) {
      return res.status(403).json({ error: "Acesso negado" });
    }

    const notaExistente = await prisma.nota.findUnique({
      where: { alunoId_disciplinaId: { alunoId: Number(alunoId), disciplinaId: Number(disciplinaId) } },
    });

    if (notaExistente) {
      return res.status(409).json({ error: "Nota já cadastrada. Use PUT para atualizar." });
    }

    const { media, situacao } = calcularNota(nota1, nota2);

    const nota = await prisma.nota.create({
      data: {
        alunoId: Number(alunoId), disciplinaId: Number(disciplinaId),
        nota1: nota1 !== undefined ? Number(nota1) : null,
        nota2: nota2 !== undefined ? Number(nota2) : null,
        media, situacao,
      },
      include: {
        aluno: { select: { nome: true, matricula: true } },
        disciplina: { select: { nome: true } },
      },
    });

    return res.status(201).json(nota);
  } catch (error) {
    console.error("[NOTA] Erro ao criar:", error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
}

export async function atualizar(req: Request, res: Response) {
  const { id } = req.params;
  const { nota1, nota2 } = req.body;
  const { perfil, id: usuarioId } = req.user!;

  try {
    const nota = await prisma.nota.findUnique({
      where: { id: Number(id) },
      include: { disciplina: { include: { professor: true } } },
    });

    if (!nota) {
      return res.status(404).json({ error: "Nota não encontrada" });
    }

    // Bloqueia edição de semestres encerrados — apenas admin pode sobrescrever
    if (!nota.disciplina.ativo && perfil !== "ADMIN") {
      return res.status(403).json({
        error: "Semestre encerrado. Apenas o administrador pode alterar notas de semestres anteriores.",
      });
    }

    if (perfil === "PROFESSOR" && nota.disciplina.professor.usuarioId !== usuarioId) {
      return res.status(403).json({ error: "Acesso negado" });
    }

    const novaNotA1 = nota1 !== undefined ? Number(nota1) : nota.nota1 ?? undefined;
    const novaNotA2 = nota2 !== undefined ? Number(nota2) : nota.nota2 ?? undefined;
    const { media, situacao } = calcularNota(novaNotA1, novaNotA2);

    const notaAtualizada = await prisma.nota.update({
      where: { id: Number(id) },
      data: {
        ...(nota1 !== undefined && { nota1: Number(nota1) }),
        ...(nota2 !== undefined && { nota2: Number(nota2) }),
        media, situacao,
      },
      include: {
        aluno: { select: { nome: true, matricula: true } },
        disciplina: { select: { nome: true } },
      },
    });

    return res.json(notaAtualizada);
  } catch (error) {
    console.error("[NOTA] Erro ao atualizar:", error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
}
