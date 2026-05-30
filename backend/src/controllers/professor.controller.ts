/**
 * Controller de Professores
 * Gerencia operações CRUD relacionadas a professores.
 *
 * Permissões:
 * - ADMIN: acesso total
 * - PROFESSOR: visualizar lista e editar apenas os próprios dados
 * - ALUNO: somente visualização da lista de professores
 */

import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";

// ─────────────────────────────────────────────
// LISTAR PROFESSORES
// ─────────────────────────────────────────────
export async function listar(req: Request, res: Response) {
  try {
    const professores = await prisma.professor.findMany({
      include: {
        usuario: { select: { email: true, ativo: true } },
        disciplinas: {
          select: { id: true, nome: true, curso: true, semestre: true },
        },
      },
      orderBy: { nome: "asc" },
    });

    return res.json(professores);
  } catch (error) {
    console.error("[PROFESSOR] Erro ao listar:", error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
}

// ─────────────────────────────────────────────
// BUSCAR POR ID
// ─────────────────────────────────────────────
export async function buscarPorId(req: Request, res: Response) {
  const { id } = req.params;

  try {
    const professor = await prisma.professor.findUnique({
      where: { id: Number(id) },
      include: {
        usuario: { select: { email: true } },
        disciplinas: {
          include: {
            notas: { select: { id: true } }, // Para saber quantas notas cada disciplina tem
          },
        },
      },
    });

    if (!professor) {
      return res.status(404).json({ error: "Professor não encontrado" });
    }

    return res.json(professor);
  } catch (error) {
    console.error("[PROFESSOR] Erro ao buscar por ID:", error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
}

// ─────────────────────────────────────────────
// CRIAR PROFESSOR (somente ADMIN)
// Cria usuário de autenticação + perfil de professor com senha temporária
// ─────────────────────────────────────────────
export async function criar(req: Request, res: Response) {
  const { nome, titulacao, area, tempoDocencia, email } = req.body;

  if (!nome || !email) {
    return res.status(400).json({ error: "Nome e e-mail são obrigatórios" });
  }

  try {
    const emailExistente = await prisma.usuario.findUnique({ where: { email } });
    if (emailExistente) {
      return res.status(409).json({ error: "E-mail já cadastrado" });
    }

    // Gera senha temporária que o professor deve trocar no primeiro acesso
    const senhaTemp = `Prof@${Math.floor(1000 + Math.random() * 9000)}`;
    const senhaHash = await bcrypt.hash(senhaTemp, 10);

    const resultado = await prisma.$transaction(async (tx) => {
      const usuario = await tx.usuario.create({
        data: {
          email,
          senha: senhaHash,
          perfil: "PROFESSOR",
          primeiroAcesso: true,
        },
      });

      const professor = await tx.professor.create({
        data: {
          usuarioId: usuario.id,
          nome,
          titulacao,
          area,
          tempoDocencia: tempoDocencia ? Number(tempoDocencia) : null,
        },
      });

      return { professor, senhaTemp };
    });

    return res.status(201).json({
      ...resultado.professor,
      senhaTemporaria: resultado.senhaTemp,
      mensagem: "Professor criado! Compartilhe a senha temporária.",
    });
  } catch (error) {
    console.error("[PROFESSOR] Erro ao criar:", error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
}

// ─────────────────────────────────────────────
// ATUALIZAR PROFESSOR
// Admin: edita tudo | Professor: edita apenas os próprios dados profissionais
// ─────────────────────────────────────────────
export async function atualizar(req: Request, res: Response) {
  const { id: professorId } = req.params;
  const { perfil, id: usuarioId } = req.user!;

  try {
    const professor = await prisma.professor.findUnique({
      where: { id: Number(professorId) },
    });

    if (!professor) {
      return res.status(404).json({ error: "Professor não encontrado" });
    }

    // Professor só pode editar a si mesmo
    if (perfil === "PROFESSOR" && professor.usuarioId !== usuarioId) {
      return res.status(403).json({ error: "Acesso negado" });
    }

    // Campos permitidos para o professor editar nos próprios dados
    const { nome, titulacao, area, tempoDocencia } = req.body;

    const professorAtualizado = await prisma.professor.update({
      where: { id: Number(professorId) },
      data: {
        ...(nome && { nome }),
        ...(titulacao !== undefined && { titulacao }),
        ...(area !== undefined && { area }),
        ...(tempoDocencia !== undefined && { tempoDocencia: Number(tempoDocencia) }),
      },
    });

    return res.json(professorAtualizado);
  } catch (error) {
    console.error("[PROFESSOR] Erro ao atualizar:", error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
}
