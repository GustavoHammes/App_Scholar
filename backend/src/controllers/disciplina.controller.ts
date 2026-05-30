/**
 * Controller de Disciplinas
 * Gerencia operações CRUD de disciplinas.
 *
 * Permissões:
 * - ADMIN: acesso total (criar, listar, editar tudo)
 * - PROFESSOR: listar todas e editar campos informativos da própria disciplina
 * - ALUNO: somente visualização
 */

import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

// ─────────────────────────────────────────────
// LISTAR DISCIPLINAS
// ─────────────────────────────────────────────
export async function listar(req: Request, res: Response) {
  const { perfil, id: usuarioId } = req.user!;

  try {
    // Se for professor, filtra apenas as disciplinas que ele leciona
    if (perfil === "PROFESSOR") {
      const professor = await prisma.professor.findFirst({
        where: { usuarioId },
      });

      if (!professor) return res.json([]);

      const disciplinas = await prisma.disciplina.findMany({
        where: { professorId: professor.id },
        include: {
          professor: { select: { nome: true } },
          _count: { select: { notas: true } }, // Quantidade de alunos com notas
        },
        orderBy: { nome: "asc" },
      });

      return res.json(disciplinas);
    }

    // Admin e Aluno veem todas as disciplinas
    const disciplinas = await prisma.disciplina.findMany({
      include: {
        professor: { select: { nome: true, titulacao: true, area: true } },
        _count: { select: { notas: true } },
      },
      orderBy: { semestre: "asc" },
    });

    return res.json(disciplinas);
  } catch (error) {
    console.error("[DISCIPLINA] Erro ao listar:", error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
}

// ─────────────────────────────────────────────
// BUSCAR POR ID
// ─────────────────────────────────────────────
export async function buscarPorId(req: Request, res: Response) {
  const { id } = req.params;

  try {
    const disciplina = await prisma.disciplina.findUnique({
      where: { id: Number(id) },
      include: {
        professor: {
          include: { usuario: { select: { email: true } } },
        },
        notas: {
          include: {
            aluno: { select: { nome: true, matricula: true } },
          },
          orderBy: { aluno: { nome: "asc" } },
        },
      },
    });

    if (!disciplina) {
      return res.status(404).json({ error: "Disciplina não encontrada" });
    }

    return res.json(disciplina);
  } catch (error) {
    console.error("[DISCIPLINA] Erro ao buscar por ID:", error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
}

// ─────────────────────────────────────────────
// CRIAR DISCIPLINA (somente ADMIN)
// ─────────────────────────────────────────────
export async function criar(req: Request, res: Response) {
  const { nome, cargaHoraria, professorId, curso, semestre, descricao } = req.body;

  if (!nome || !cargaHoraria || !professorId || !curso || !semestre) {
    return res.status(400).json({
      error: "Nome, carga horária, professor, curso e semestre são obrigatórios",
    });
  }

  try {
    // Verifica se o professor existe
    const professor = await prisma.professor.findUnique({
      where: { id: Number(professorId) },
    });

    if (!professor) {
      return res.status(404).json({ error: "Professor não encontrado" });
    }

    const disciplina = await prisma.disciplina.create({
      data: {
        nome,
        cargaHoraria: Number(cargaHoraria),
        professorId: Number(professorId),
        curso,
        semestre: Number(semestre),
        descricao,
      },
      include: { professor: { select: { nome: true } } },
    });

    return res.status(201).json(disciplina);
  } catch (error) {
    console.error("[DISCIPLINA] Erro ao criar:", error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
}

// ─────────────────────────────────────────────
// ATUALIZAR DISCIPLINA
// Admin: edita tudo (incluindo professor responsável)
// Professor: edita apenas campos informativos da própria disciplina (descrição, carga horária)
// ─────────────────────────────────────────────
export async function atualizar(req: Request, res: Response) {
  const { id } = req.params;
  const { perfil, id: usuarioId } = req.user!;

  try {
    const disciplina = await prisma.disciplina.findUnique({
      where: { id: Number(id) },
      include: { professor: true },
    });

    if (!disciplina) {
      return res.status(404).json({ error: "Disciplina não encontrada" });
    }

    // Professor só pode editar as próprias disciplinas
    if (perfil === "PROFESSOR") {
      if (disciplina.professor.usuarioId !== usuarioId) {
        return res.status(403).json({ error: "Acesso negado" });
      }

      // Professor pode editar apenas descrição e carga horária
      const { descricao, cargaHoraria } = req.body;

      const atualizada = await prisma.disciplina.update({
        where: { id: Number(id) },
        data: {
          ...(descricao !== undefined && { descricao }),
          ...(cargaHoraria && { cargaHoraria: Number(cargaHoraria) }),
        },
      });

      return res.json(atualizada);
    }

    // Admin pode editar todos os campos
    const { nome, cargaHoraria, professorId, curso, semestre, descricao } = req.body;

    const atualizada = await prisma.disciplina.update({
      where: { id: Number(id) },
      data: {
        ...(nome && { nome }),
        ...(cargaHoraria && { cargaHoraria: Number(cargaHoraria) }),
        ...(professorId && { professorId: Number(professorId) }),
        ...(curso && { curso }),
        ...(semestre && { semestre: Number(semestre) }),
        ...(descricao !== undefined && { descricao }),
      },
    });

    return res.json(atualizada);
  } catch (error) {
    console.error("[DISCIPLINA] Erro ao atualizar:", error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
}

// ─────────────────────────────────────────────
// DELETAR DISCIPLINA (somente ADMIN)
// ─────────────────────────────────────────────
export async function deletar(req: Request, res: Response) {
  const { id } = req.params;

  try {
    await prisma.disciplina.delete({
      where: { id: Number(id) },
    });

    return res.json({ message: "Disciplina removida com sucesso" });
  } catch (error) {
    console.error("[DISCIPLINA] Erro ao deletar:", error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
}
