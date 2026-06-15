/**
 * Controller de Alunos
 * Gerencia todas as operações CRUD relacionadas a alunos.
 *
 * Permissões esperadas pelas rotas:
 * - ADMIN: acesso total
 * - PROFESSOR: visualiza alunos vinculados às suas disciplinas
 * - ALUNO: visualiza/edita apenas os próprios dados permitidos
 */

import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";

function removerUndefined(dados: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(dados).filter(([, valor]) => valor !== undefined)
  );
}

function idNumerico(valor: unknown) {
  const numero = Number(valor);
  return Number.isInteger(numero) && numero > 0 ? numero : null;
}

// ─────────────────────────────────────────────
// LISTAR ALUNOS
// Admin vê todos | Professor vê os de suas disciplinas | Aluno vê apenas a si mesmo
// ─────────────────────────────────────────────
export async function listar(req: Request, res: Response) {
  const { perfil, id } = req.user!;

  try {
    if (perfil === "ALUNO") {
      const aluno = await prisma.aluno.findFirst({
        where: { usuarioId: id },
        include: {
          curso: true,
          usuario: {
            select: {
              email: true,
              primeiroAcesso: true,
              ativo: true,
            },
          },
        },
      });

      return res.json(aluno ? [aluno] : []);
    }

    if (perfil === "PROFESSOR") {
      const professor = await prisma.professor.findFirst({
        where: { usuarioId: id },
      });

      if (!professor) {
        return res.json([]);
      }

      const disciplinas = await prisma.disciplina.findMany({
        where: { professorId: professor.id },
        select: { id: true },
      });

      const disciplinaIds = disciplinas.map((disciplina) => disciplina.id);

      if (disciplinaIds.length === 0) {
        return res.json([]);
      }

      const alunosComNotas = await prisma.nota.findMany({
        where: { disciplinaId: { in: disciplinaIds } },
        select: { alunoId: true },
        distinct: ["alunoId"],
      });

      const alunoIds = alunosComNotas.map((nota) => nota.alunoId);

      if (alunoIds.length === 0) {
        return res.json([]);
      }

      const alunos = await prisma.aluno.findMany({
        where: { id: { in: alunoIds } },
        include: {
          curso: true,
          usuario: {
            select: {
              email: true,
              primeiroAcesso: true,
              ativo: true,
            },
          },
        },
        orderBy: { nome: "asc" },
      });

      return res.json(alunos);
    }

    const alunos = await prisma.aluno.findMany({
      include: {
        curso: true,
        usuario: {
          select: {
            email: true,
            primeiroAcesso: true,
            ativo: true,
          },
        },
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
        curso: true,
        usuario: {
          select: {
            email: true,
            primeiroAcesso: true,
            ativo: true,
          },
        },
        notas: {
          include: {
            disciplina: {
              include: {
                curso: true,
                professor: {
                  select: {
                    id: true,
                    nome: true,
                    titulacao: true,
                    area: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!aluno) {
      return res.status(404).json({ error: "Aluno não encontrado" });
    }

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
// CRIAR ALUNO (somente ADMIN pela rota)
// Cria usuário de autenticação + perfil de aluno + senha temporária
// ─────────────────────────────────────────────
export async function criar(req: Request, res: Response) {
  const {
    nome,
    matricula,
    cursoId,
    email,
    telefone,
    cep,
    endereco,
    cidade,
    estado,
  } = req.body;

  if (!nome || !matricula || !cursoId || !email) {
    return res.status(400).json({
      error: "Nome, matrícula, curso e e-mail são obrigatórios",
    });
  }

  const cursoIdNumerico = idNumerico(cursoId);

  if (!cursoIdNumerico) {
    return res.status(400).json({ error: "Curso inválido" });
  }

  try {
    const emailExistente = await prisma.usuario.findUnique({
      where: { email },
    });

    if (emailExistente) {
      return res.status(409).json({ error: "E-mail já cadastrado" });
    }

    const matriculaExistente = await prisma.aluno.findUnique({
      where: { matricula },
    });

    if (matriculaExistente) {
      return res.status(409).json({ error: "Matrícula já cadastrada" });
    }

    const curso = await prisma.curso.findUnique({
      where: { id: cursoIdNumerico },
    });

    if (!curso || !curso.ativo) {
      return res.status(404).json({ error: "Curso não encontrado ou inativo" });
    }

    const senhaTemp = `Scholar@${Math.floor(1000 + Math.random() * 9000)}`;
    const senhaHash = await bcrypt.hash(senhaTemp, 10);

    const resultado = await prisma.$transaction(async (tx) => {
      const usuario = await tx.usuario.create({
        data: {
          email,
          senha: senhaHash,
          perfil: "ALUNO",
          primeiroAcesso: true,
        },
      });

      const aluno = await tx.aluno.create({
        data: {
          usuarioId: usuario.id,
          nome,
          matricula,
          cursoId: cursoIdNumerico,
          telefone,
          cep,
          endereco,
          cidade,
          estado,
        },
        include: {
          curso: true,
          usuario: {
            select: {
              email: true,
              primeiroAcesso: true,
              ativo: true,
            },
          },
        },
      });

      return { aluno, senhaTemp };
    });

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
// Admin: edita todos os campos permitidos
// Aluno: edita apenas dados pessoais de contato
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

    if (perfil === "ALUNO" && aluno.usuarioId !== usuarioId) {
      return res.status(403).json({ error: "Acesso negado" });
    }

    let dadosAtualizados: Record<string, unknown>;

    if (perfil === "ALUNO") {
      const { telefone, cep, endereco, cidade, estado } = req.body;
      dadosAtualizados = { telefone, cep, endereco, cidade, estado };
    } else {
      const {
        nome,
        matricula,
        cursoId,
        telefone,
        cep,
        endereco,
        cidade,
        estado,
      } = req.body;

      if (matricula && matricula !== aluno.matricula) {
        const matriculaExistente = await prisma.aluno.findUnique({
          where: { matricula },
        });

        if (matriculaExistente) {
          return res.status(409).json({ error: "Matrícula já cadastrada" });
        }
      }

      let cursoIdAtualizado: number | undefined;

      if (cursoId !== undefined) {
        const cursoIdNumerico = idNumerico(cursoId);

        if (!cursoIdNumerico) {
          return res.status(400).json({ error: "Curso inválido" });
        }

        const curso = await prisma.curso.findUnique({
          where: { id: cursoIdNumerico },
        });

        if (!curso || !curso.ativo) {
          return res.status(404).json({ error: "Curso não encontrado ou inativo" });
        }

        cursoIdAtualizado = cursoIdNumerico;
      }

      dadosAtualizados = {
        nome,
        matricula,
        cursoId: cursoIdAtualizado,
        telefone,
        cep,
        endereco,
        cidade,
        estado,
      };
    }

    const dadosLimpos = removerUndefined(dadosAtualizados);

    const alunoAtualizado = await prisma.aluno.update({
      where: { id: Number(alunoId) },
      data: dadosLimpos as any,
      include: {
        curso: true,
        usuario: {
          select: {
            email: true,
            primeiroAcesso: true,
            ativo: true,
          },
        },
      },
    });

    return res.json(alunoAtualizado);
  } catch (error) {
    console.error("[ALUNO] Erro ao atualizar:", error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
}

// ─────────────────────────────────────────────
// DESATIVAR ALUNO (somente ADMIN pela rota)
// Não deleta — apenas marca o usuário como inativo para preservar histórico
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
// BOLETIM — consulta de notas por matrícula
// ─────────────────────────────────────────────
export async function boletim(req: Request, res: Response) {
  const { matricula } = req.params;
  const { perfil, id: usuarioId } = req.user!;

  try {
    const aluno = await prisma.aluno.findUnique({
      where: { matricula },
      include: {
        curso: true,
        notas: {
          include: {
            disciplina: {
              include: {
                professor: {
                  select: {
                    nome: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!aluno) {
      return res.status(404).json({ error: "Aluno não encontrado" });
    }

    if (perfil === "ALUNO" && aluno.usuarioId !== usuarioId) {
      return res.status(403).json({ error: "Acesso negado" });
    }

    const notasOrdenadas = [...aluno.notas].sort((a, b) =>
      a.disciplina.nome.localeCompare(b.disciplina.nome)
    );

    const resposta = {
      aluno: aluno.nome,
      matricula: aluno.matricula,
      curso: aluno.curso.nome,
      disciplinas: notasOrdenadas.map((nota) => ({
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
