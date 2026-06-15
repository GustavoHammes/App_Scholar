/**
 * Controller de Disciplinas
 * Gerencia operações CRUD de disciplinas.
 *
 * Permissões:
 * - ADMIN: acesso total (criar, listar, editar tudo)
 * - PROFESSOR: listar as próprias disciplinas e editar campos informativos
 * - ALUNO: somente visualização
 */

import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

export async function listar(req: Request, res: Response) {
  const { perfil, id: usuarioId } = req.user!;

  try {
    if (perfil === "PROFESSOR") {
      const professor = await prisma.professor.findFirst({
        where: { usuarioId },
      });

      if (!professor) return res.json([]);

      const disciplinas = await prisma.disciplina.findMany({
        where: { professorId: professor.id },
        include: {
          curso: true,
          professor: {
            select: {
              nome: true,
              titulacao: true,
              area: true,
            },
          },
          _count: {
            select: {
              notas: true,
            },
          },
        },
        orderBy: [
          { semestre: "asc" },
          { nome: "asc" },
        ],
      });

      return res.json(disciplinas);
    }

    const disciplinas = await prisma.disciplina.findMany({
      include: {
        curso: true,
        professor: {
          select: {
            nome: true,
            titulacao: true,
            area: true,
          },
        },
        _count: {
          select: {
            notas: true,
          },
        },
      },
      orderBy: [
        { semestre: "asc" },
        { nome: "asc" },
      ],
    });

    return res.json(disciplinas);
  } catch (error) {
    console.error("[DISCIPLINA] Erro ao listar:", error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
}

export async function buscarPorId(req: Request, res: Response) {
  const { id } = req.params;

  try {
    const disciplina = await prisma.disciplina.findUnique({
      where: { id: Number(id) },
      include: {
        curso: true,
        professor: {
          include: {
            usuario: {
              select: {
                email: true,
              },
            },
          },
        },
        notas: {
          include: {
            aluno: {
              select: {
                nome: true,
                matricula: true,
              },
            },
          },
          orderBy: {
            aluno: {
              nome: "asc",
            },
          },
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

export async function criar(req: Request, res: Response) {
  const { nome, cargaHoraria, professorId, cursoId, semestre, descricao, ativo } = req.body;

  if (!nome || !cargaHoraria || !professorId || !cursoId || !semestre) {
    return res.status(400).json({
      error: "Nome, carga horária, professor, curso e semestre são obrigatórios",
    });
  }

  try {
    const professor = await prisma.professor.findUnique({
      where: { id: Number(professorId) },
    });

    if (!professor) {
      return res.status(404).json({ error: "Professor não encontrado" });
    }

    const curso = await prisma.curso.findUnique({
      where: { id: Number(cursoId) },
    });

    if (!curso || !curso.ativo) {
      return res.status(404).json({ error: "Curso não encontrado ou inativo" });
    }

    const disciplina = await prisma.disciplina.create({
      data: {
        nome,
        cargaHoraria: Number(cargaHoraria),
        professorId: Number(professorId),
        cursoId: Number(cursoId),
        semestre: Number(semestre),
        descricao,
        ativo: ativo ?? true,
      },
      include: {
        curso: true,
        professor: {
          select: {
            nome: true,
          },
        },
        _count: {
          select: {
            notas: true,
          },
        },
      },
    });

    return res.status(201).json(disciplina);
  } catch (error) {
    console.error("[DISCIPLINA] Erro ao criar:", error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
}

export async function atualizar(req: Request, res: Response) {
  const { id } = req.params;
  const { perfil, id: usuarioId } = req.user!;

  try {
    const disciplina = await prisma.disciplina.findUnique({
      where: { id: Number(id) },
      include: {
        professor: true,
      },
    });

    if (!disciplina) {
      return res.status(404).json({ error: "Disciplina não encontrada" });
    }

    if (perfil === "PROFESSOR") {
      if (disciplina.professor.usuarioId !== usuarioId) {
        return res.status(403).json({ error: "Acesso negado" });
      }

      const { descricao, cargaHoraria } = req.body;

      const atualizada = await prisma.disciplina.update({
        where: { id: Number(id) },
        data: {
          ...(descricao !== undefined && { descricao }),
          ...(cargaHoraria !== undefined && { cargaHoraria: Number(cargaHoraria) }),
        },
        include: {
          curso: true,
          professor: {
            select: {
              nome: true,
            },
          },
        },
      });

      return res.json(atualizada);
    }

    const { nome, cargaHoraria, professorId, cursoId, semestre, descricao, ativo } = req.body;

    if (professorId) {
      const professor = await prisma.professor.findUnique({
        where: { id: Number(professorId) },
      });

      if (!professor) {
        return res.status(404).json({ error: "Professor não encontrado" });
      }
    }

    if (cursoId) {
      const curso = await prisma.curso.findUnique({
        where: { id: Number(cursoId) },
      });

      if (!curso || !curso.ativo) {
        return res.status(404).json({ error: "Curso não encontrado ou inativo" });
      }
    }

    const atualizada = await prisma.disciplina.update({
      where: { id: Number(id) },
      data: {
        ...(nome !== undefined && { nome }),
        ...(cargaHoraria !== undefined && { cargaHoraria: Number(cargaHoraria) }),
        ...(professorId !== undefined && { professorId: Number(professorId) }),
        ...(cursoId !== undefined && { cursoId: Number(cursoId) }),
        ...(semestre !== undefined && { semestre: Number(semestre) }),
        ...(descricao !== undefined && { descricao }),
        ...(ativo !== undefined && { ativo: Boolean(ativo) }),
      },
      include: {
        curso: true,
        professor: {
          select: {
            nome: true,
          },
        },
        _count: {
          select: {
            notas: true,
          },
        },
      },
    });

    return res.json(atualizada);
  } catch (error) {
    console.error("[DISCIPLINA] Erro ao atualizar:", error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
}

export async function deletar(req: Request, res: Response) {
  const { id } = req.params;

  try {
    const disciplina = await prisma.disciplina.findUnique({
      where: { id: Number(id) },
      include: {
        _count: {
          select: {
            notas: true,
          },
        },
      },
    });

    if (!disciplina) {
      return res.status(404).json({ error: "Disciplina não encontrada" });
    }

    if (disciplina._count.notas > 0) {
      const desativada = await prisma.disciplina.update({
        where: { id: Number(id) },
        data: { ativo: false },
      });

      return res.json({
        message: "Disciplina possui notas vinculadas. Ela foi desativada para preservar o histórico.",
        disciplina: desativada,
      });
    }

    await prisma.disciplina.delete({
      where: { id: Number(id) },
    });

    return res.json({ message: "Disciplina removida com sucesso" });
  } catch (error) {
    console.error("[DISCIPLINA] Erro ao deletar:", error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
}
