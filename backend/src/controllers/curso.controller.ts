import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

export async function listar(req: Request, res: Response) {
  try {
    const incluirInativos = req.query.incluirInativos === "true";

    const cursos = await prisma.curso.findMany({
      where: incluirInativos ? undefined : { ativo: true },
      include: {
        coordenador: {
          select: {
            id: true,
            nome: true,
            titulacao: true,
            area: true,
          },
        },
        _count: {
          select: {
            alunos: true,
            disciplinas: true,
          },
        },
      },
      orderBy: {
        nome: "asc",
      },
    });

    return res.json(cursos);
  } catch (error) {
    console.error("[CURSO] Erro ao listar:", error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
}

export async function buscarPorId(req: Request, res: Response) {
  const { id } = req.params;

  try {
    const curso = await prisma.curso.findUnique({
      where: { id: Number(id) },
      include: {
        coordenador: {
          select: {
            id: true,
            nome: true,
            titulacao: true,
            area: true,
          },
        },
        alunos: {
          select: {
            id: true,
            nome: true,
            matricula: true,
          },
          orderBy: {
            nome: "asc",
          },
        },
        disciplinas: {
          select: {
            id: true,
            nome: true,
            semestre: true,
            cargaHoraria: true,
            ativo: true,
          },
          orderBy: {
            semestre: "asc",
          },
        },
      },
    });

    if (!curso) {
      return res.status(404).json({ error: "Curso não encontrado" });
    }

    return res.json(curso);
  } catch (error) {
    console.error("[CURSO] Erro ao buscar por ID:", error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
}

export async function criar(req: Request, res: Response) {
  const { nome, area, duracaoSemestres, coordenadorId, descricao, ativo } = req.body;

  if (!nome || !area || !duracaoSemestres) {
    return res.status(400).json({
      error: "Nome, área e duração do curso são obrigatórios",
    });
  }

  try {
    const existente = await prisma.curso.findUnique({
      where: { nome },
    });

    if (existente) {
      return res.status(409).json({ error: "Já existe um curso com esse nome" });
    }

    if (coordenadorId) {
      const professor = await prisma.professor.findUnique({
        where: { id: Number(coordenadorId) },
      });

      if (!professor) {
        return res.status(404).json({ error: "Coordenador não encontrado" });
      }
    }

    const curso = await prisma.curso.create({
      data: {
        nome,
        area,
        duracaoSemestres: Number(duracaoSemestres),
        coordenadorId: coordenadorId ? Number(coordenadorId) : null,
        descricao,
        ativo: ativo ?? true,
      },
      include: {
        coordenador: {
          select: {
            id: true,
            nome: true,
          },
        },
      },
    });

    return res.status(201).json(curso);
  } catch (error) {
    console.error("[CURSO] Erro ao criar:", error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
}

export async function atualizar(req: Request, res: Response) {
  const { id } = req.params;
  const { nome, area, duracaoSemestres, coordenadorId, descricao, ativo } = req.body;

  try {
    const curso = await prisma.curso.findUnique({
      where: { id: Number(id) },
    });

    if (!curso) {
      return res.status(404).json({ error: "Curso não encontrado" });
    }

    if (nome && nome !== curso.nome) {
      const nomeExistente = await prisma.curso.findUnique({
        where: { nome },
      });

      if (nomeExistente) {
        return res.status(409).json({ error: "Já existe um curso com esse nome" });
      }
    }

    if (coordenadorId) {
      const professor = await prisma.professor.findUnique({
        where: { id: Number(coordenadorId) },
      });

      if (!professor) {
        return res.status(404).json({ error: "Coordenador não encontrado" });
      }
    }

    const atualizado = await prisma.curso.update({
      where: { id: Number(id) },
      data: {
        ...(nome !== undefined && { nome }),
        ...(area !== undefined && { area }),
        ...(duracaoSemestres !== undefined && {
          duracaoSemestres: Number(duracaoSemestres),
        }),
        ...(coordenadorId !== undefined && {
          coordenadorId: coordenadorId ? Number(coordenadorId) : null,
        }),
        ...(descricao !== undefined && { descricao }),
        ...(ativo !== undefined && { ativo: Boolean(ativo) }),
      },
      include: {
        coordenador: {
          select: {
            id: true,
            nome: true,
          },
        },
      },
    });

    return res.json(atualizado);
  } catch (error) {
    console.error("[CURSO] Erro ao atualizar:", error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
}

export async function deletar(req: Request, res: Response) {
  const { id } = req.params;

  try {
    const curso = await prisma.curso.findUnique({
      where: { id: Number(id) },
      include: {
        _count: {
          select: {
            alunos: true,
            disciplinas: true,
          },
        },
      },
    });

    if (!curso) {
      return res.status(404).json({ error: "Curso não encontrado" });
    }

    const possuiVinculos = curso._count.alunos > 0 || curso._count.disciplinas > 0;

    if (possuiVinculos) {
      const desativado = await prisma.curso.update({
        where: { id: Number(id) },
        data: { ativo: false },
      });

      return res.json({
        message:
          "Curso possui alunos ou disciplinas vinculadas. Ele foi desativado para preservar o histórico.",
        curso: desativado,
      });
    }

    await prisma.curso.delete({
      where: { id: Number(id) },
    });

    return res.json({ message: "Curso removido com sucesso" });
  } catch (error) {
    console.error("[CURSO] Erro ao deletar:", error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
}