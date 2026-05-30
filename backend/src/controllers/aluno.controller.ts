/**
 * Controller de Alunos
 * Gerencia todas as operações CRUD relacionadas a alunos.
 *
 * Permissões:
 * - ADMIN: acesso total (criar, listar todos, editar qualquer campo)
 * - PROFESSOR: visualizar alunos vinculados às suas disciplinas
 * - ALUNO: visualizar e editar apenas os próprios dados (campos limitados)
 */

import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";

// ─────────────────────────────────────────────
// LISTAR ALUNOS
// Admin vê todos | Professor vê os de suas disciplinas | Aluno vê apenas a si mesmo
// ─────────────────────────────────────────────
export async function listar(req: Request, res: Response) {
  const { perfil, id } = req.user!;

  try {
    if (perfil === "ALUNO") {
      // Aluno só pode ver a si mesmo
      const aluno = await prisma.aluno.findFirst({
        where: { usuarioId: id },
        include: { usuario: { select: { email: true, primeiroAcesso: true } } },
      });
      return res.json(aluno ? [aluno] : []);
    }

    if (perfil === "PROFESSOR") {
      // Professor vê apenas alunos que têm notas nas suas disciplinas
      const professor = await prisma.professor.findFirst({
        where: { usuarioId: id },
      });

      if (!professor) return res.json([]);

      // Busca IDs das disciplinas do professor
      const disciplinaIds = await prisma.disciplina.findMany({
        where: { professorId: professor.id },
        select: { id: true },
      });

      const ids = disciplinaIds.map((d) => d.id);

      // Busca alunos que têm notas nessas disciplinas (sem duplicatas)
      const alunoIds = await prisma.nota.findMany({
        where: { disciplinaId: { in: ids } },
        select: { alunoId: true },
        distinct: ["alunoId"],
      });

      const alunos = await prisma.aluno.findMany({
        where: { id: { in: alunoIds.map((n) => n.alunoId) } },
        include: {
          usuario: { select: { email: true, primeiroAcesso: true } },
        },
        orderBy: { nome: "asc" },
      });

      return res.json(alunos);
    }

    // Admin vê todos os alunos
    const alunos = await prisma.aluno.findMany({
      include: {
        usuario: { select: { email: true, primeiroAcesso: true, ativo: true } },
      },
      orderBy: { nome: "asc" },
    });

    return res.json(alunos);
  } catch (error) {
    console.error("[ALUNO] Erro ao listar:", error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
}

// ─────────────────────────────────────────────
// BUSCAR POR ID
// ─────────────────────────────────────────────
export async function buscarPorId(req: Request, res: Response) {
  const { id: alunoId } = req.params;
  const { perfil, id: usuarioId } = req.user!;

  try {
    const aluno = await prisma.aluno.findUnique({
      where: { id: Number(alunoId) },
      include: {
        usuario: { select: { email: true, primeiroAcesso: true } },
        notas: {
          include: {
            disciplina: { include: { professor: true } },
          },
        },
      },
    });

    if (!aluno) {
      return res.status(404).json({ error: "Aluno não encontrado" });
    }

    // Aluno só pode ver os próprios dados
    if (perfil === "ALUNO" && aluno.usuarioId !== usuarioId) {
      return res.status(403).json({ error: "Acesso negado" });
    }

    return res.json(aluno);
  } catch (error) {
    console.error("[ALUNO] Erro ao buscar por ID:", error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
}

// ─────────────────────────────────────────────
// CRIAR ALUNO (somente ADMIN)
// Cria o usuário de autenticação + perfil de aluno + senha temporária aleatória
// ─────────────────────────────────────────────
export async function criar(req: Request, res: Response) {
  const { nome, matricula, curso, email, telefone, cep, endereco, cidade, estado } = req.body;

  if (!nome || !matricula || !curso || !email) {
    return res.status(400).json({ error: "Nome, matrícula, curso e e-mail são obrigatórios" });
  }

  try {
    // Verifica se a matrícula ou e-mail já existem
    const emailExistente = await prisma.usuario.findUnique({ where: { email } });
    if (emailExistente) {
      return res.status(409).json({ error: "E-mail já cadastrado" });
    }

    const matriculaExistente = await prisma.aluno.findUnique({ where: { matricula } });
    if (matriculaExistente) {
      return res.status(409).json({ error: "Matrícula já cadastrada" });
    }

    // Gera uma senha temporária aleatória (aluno deve trocar no primeiro acesso)
    const senhaTemp = `Scholar@${Math.floor(1000 + Math.random() * 9000)}`;
    const senhaHash = await bcrypt.hash(senhaTemp, 10);

    // Cria o usuário e o aluno em uma transação para garantir consistência
    const resultado = await prisma.$transaction(async (tx) => {
      const usuario = await tx.usuario.create({
        data: { email, senha: senhaHash, perfil: "ALUNO", primeiroAcesso: true },
      });

      const aluno = await tx.aluno.create({
        data: { usuarioId: usuario.id, nome, matricula, curso, telefone, cep, endereco, cidade, estado },
      });

      return { aluno, senhaTemp };
    });

    // Retorna a senha temporária para o admin repassar ao aluno
    return res.status(201).json({
      ...resultado.aluno,
      senhaTemporaria: resultado.senhaTemp,
      mensagem: "Aluno criado! Compartilhe a senha temporária com o aluno.",
    });
  } catch (error) {
    console.error("[ALUNO] Erro ao criar:", error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
}

// ─────────────────────────────────────────────
// ATUALIZAR ALUNO
// Admin: pode editar todos os campos
// Aluno: pode editar apenas os próprios dados pessoais (não muda matrícula, curso)
// ─────────────────────────────────────────────
export async function atualizar(req: Request, res: Response) {
  const { id: alunoId } = req.params;
  const { perfil, id: usuarioId } = req.user!;

  try {
    const aluno = await prisma.aluno.findUnique({
      where: { id: Number(alunoId) },
    });

    if (!aluno) {
      return res.status(404).json({ error: "Aluno não encontrado" });
    }

    // Aluno só pode editar a si mesmo
    if (perfil === "ALUNO" && aluno.usuarioId !== usuarioId) {
      return res.status(403).json({ error: "Acesso negado" });
    }

    let dadosAtualizados: Record<string, unknown>;

    if (perfil === "ALUNO") {
      // Aluno pode editar apenas dados pessoais de contato
      const { telefone, cep, endereco, cidade, estado } = req.body;
      dadosAtualizados = { telefone, cep, endereco, cidade, estado };
    } else {
      // Admin pode editar todos os campos
      const { nome, matricula, curso, telefone, cep, endereco, cidade, estado } = req.body;
      dadosAtualizados = { nome, matricula, curso, telefone, cep, endereco, cidade, estado };
    }

    // Remove campos undefined antes de atualizar
    const dadosLimpos = Object.fromEntries(
      Object.entries(dadosAtualizados).filter(([, v]) => v !== undefined)
    );

    const alunoAtualizado = await prisma.aluno.update({
      where: { id: Number(alunoId) },
      data: dadosLimpos,
    });

    return res.json(alunoAtualizado);
  } catch (error) {
    console.error("[ALUNO] Erro ao atualizar:", error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
}

// ─────────────────────────────────────────────
// DESATIVAR ALUNO (somente ADMIN)
// Não deleta — apenas marca como inativo para preservar histórico
// ─────────────────────────────────────────────
export async function desativar(req: Request, res: Response) {
  const { id: alunoId } = req.params;

  try {
    const aluno = await prisma.aluno.findUnique({
      where: { id: Number(alunoId) },
    });

    if (!aluno) {
      return res.status(404).json({ error: "Aluno não encontrado" });
    }

    await prisma.usuario.update({
      where: { id: aluno.usuarioId },
      data: { ativo: false },
    });

    return res.json({ message: "Aluno desativado com sucesso" });
  } catch (error) {
    console.error("[ALUNO] Erro ao desativar:", error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
}

// ─────────────────────────────────────────────
// BOLETIM — consulta de notas por matrícula (API 3 do PDF)
// ─────────────────────────────────────────────
export async function boletim(req: Request, res: Response) {
  const { matricula } = req.params;
  const { perfil, id: usuarioId } = req.user!;

  try {
    const aluno = await prisma.aluno.findUnique({
      where: { matricula },
      include: {
        notas: {
          include: {
            disciplina: {
              include: { professor: { select: { nome: true } } },
            },
          },
          orderBy: { disciplina: { nome: "asc" } },
        },
      },
    });

    if (!aluno) {
      return res.status(404).json({ error: "Aluno não encontrado" });
    }

    // Aluno só pode ver o próprio boletim
    if (perfil === "ALUNO" && aluno.usuarioId !== usuarioId) {
      return res.status(403).json({ error: "Acesso negado" });
    }

    // Formata a resposta no padrão especificado no PDF
    const resposta = {
      aluno: aluno.nome,
      matricula: aluno.matricula,
      curso: aluno.curso,
      disciplinas: aluno.notas.map((nota) => ({
        disciplina: nota.disciplina.nome,
        professor: nota.disciplina.professor.nome,
        cargaHoraria: nota.disciplina.cargaHoraria,
        semestre: nota.disciplina.semestre,
        nota1: nota.nota1,
        nota2: nota.nota2,
        media: nota.media,
        situacao: nota.situacao,
      })),
    };

    return res.json(resposta);
  } catch (error) {
    console.error("[ALUNO] Erro ao buscar boletim:", error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
}
