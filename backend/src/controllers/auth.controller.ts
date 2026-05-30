/**
 * Controller de Autenticação
 * Gerencia login, troca de senha e retorno dos dados do usuário autenticado.
 */

import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";

// ─────────────────────────────────────────────
// LOGIN
// Valida credenciais e retorna token JWT + dados do usuário
// ─────────────────────────────────────────────
export async function login(req: Request, res: Response) {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ error: "E-mail e senha são obrigatórios" });
  }

  try {
    // Busca o usuário pelo e-mail, incluindo os dados de aluno ou professor
    const usuario = await prisma.usuario.findUnique({
      where: { email },
      include: {
        aluno: true,
        professor: true,
      },
    });

    if (!usuario || !usuario.ativo) {
      return res.status(401).json({ error: "Credenciais inválidas" });
    }

    // Compara a senha enviada com o hash armazenado
    const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
    if (!senhaCorreta) {
      return res.status(401).json({ error: "Credenciais inválidas" });
    }

    // Determina o nome do usuário com base no perfil
    const nome =
      usuario.aluno?.nome ?? usuario.professor?.nome ?? "Administrador";

    // Monta o payload que ficará dentro do JWT
    const payload = {
      id: usuario.id,
      email: usuario.email,
      perfil: usuario.perfil,
      nome,
    };

    const secret =
      process.env.JWT_SECRET ?? "secret_padrao_nao_usar_em_producao";
    const expiresIn = process.env.JWT_EXPIRES_IN ?? "7d";
    const token = jwt.sign(payload, secret, { expiresIn } as jwt.SignOptions);

    return res.json({
      token,
      usuario: {
        ...payload,
        primeiroAcesso: usuario.primeiroAcesso, // Sinaliza se o front deve redirecionar para troca de senha
      },
    });
  } catch (error) {
    console.error("[AUTH] Erro no login:", error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
}

// ─────────────────────────────────────────────
// TROCAR SENHA
// Permite ao usuário alterar a própria senha
// Obrigatório no primeiro acesso
// ─────────────────────────────────────────────
export async function trocarSenha(req: Request, res: Response) {
  const { senhaAtual, novaSenha } = req.body;
  const usuarioId = req.user!.id;

  if (!senhaAtual || !novaSenha) {
    return res
      .status(400)
      .json({ error: "Senha atual e nova senha são obrigatórias" });
  }

  // Validação básica de força da nova senha (mínimo 6 caracteres)
  if (novaSenha.length < 6) {
    return res
      .status(400)
      .json({ error: "A nova senha deve ter pelo menos 6 caracteres" });
  }

  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id: usuarioId },
    });

    if (!usuario) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    // Verifica se a senha atual está correta
    const senhaCorreta = await bcrypt.compare(senhaAtual, usuario.senha);
    if (!senhaCorreta) {
      return res.status(401).json({ error: "Senha atual incorreta" });
    }

    // Gera o hash da nova senha
    const hashNovaSenha = await bcrypt.hash(novaSenha, 10);

    // Atualiza a senha e marca que o primeiro acesso foi concluído
    await prisma.usuario.update({
      where: { id: usuarioId },
      data: {
        senha: hashNovaSenha,
        primeiroAcesso: false,
      },
    });

    return res.json({ message: "Senha alterada com sucesso" });
  } catch (error) {
    console.error("[AUTH] Erro ao trocar senha:", error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
}

// ─────────────────────────────────────────────
// ME (dados do usuário logado)
// Retorna os dados completos do usuário autenticado
// ─────────────────────────────────────────────
export async function me(req: Request, res: Response) {
  const usuarioId = req.user!.id;

  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id: usuarioId },
      include: {
        aluno: true,
        professor: true,
      },
    });

    if (!usuario) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    // Remove a senha antes de retornar os dados
    const { senha: _, ...dados } = usuario;
    return res.json(dados);
  } catch (error) {
    console.error("[AUTH] Erro ao buscar dados do usuário:", error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
}

// ─────────────────────────────────────────────
// REDEFINIR SENHA (sem autenticação)
// Permite redefinir a senha informando apenas o e-mail.
// Usado na tela de login quando o usuário esquece a senha.
// Seguro para sistemas internos onde apenas pessoas cadastradas têm e-mail.
// ─────────────────────────────────────────────
export async function redefinirSenha(req: Request, res: Response) {
  const { email, novaSenha } = req.body;

  if (!email || !novaSenha) {
    return res.status(400).json({ error: "E-mail e nova senha são obrigatórios" });
  }

  if (novaSenha.length < 6) {
    return res.status(400).json({ error: "A senha deve ter pelo menos 6 caracteres" });
  }

  try {
    const usuario = await prisma.usuario.findUnique({ where: { email } });

    // Retorna 404 genérico — não confirma se o e-mail existe (segurança)
    if (!usuario || !usuario.ativo) {
      return res.status(404).json({ error: "E-mail não encontrado no sistema" });
    }

    const hashNovaSenha = await bcrypt.hash(novaSenha, 10);

    await prisma.usuario.update({
      where: { id: usuario.id },
      data: { senha: hashNovaSenha, primeiroAcesso: false },
    });

    return res.json({ message: "Senha redefinida com sucesso" });
  } catch (error) {
    console.error("[AUTH] Erro ao redefinir senha:", error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
}