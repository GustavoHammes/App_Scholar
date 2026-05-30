/**
 * Middleware de controle de acesso por perfil (RBAC)
 * Usado após o middleware de autenticação para restringir rotas por perfil.
 *
 * Exemplo de uso:
 *   router.post('/alunos', autenticar, autorizar('ADMIN'), alunoController.criar)
 *   router.get('/alunos', autenticar, autorizar('ADMIN', 'PROFESSOR'), alunoController.listar)
 */

import { Request, Response, NextFunction } from "express";
import { TokenPayload } from "./auth.middleware";

type Perfil = TokenPayload["perfil"];

/**
 * Retorna um middleware que permite acesso apenas aos perfis especificados.
 * @param perfisPermitidos - Perfis que têm acesso à rota
 */
export function autorizar(...perfisPermitidos: Perfil[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const usuario = req.user;

    // Garante que o middleware de autenticação foi executado antes
    if (!usuario) {
      return res.status(401).json({ error: "Não autenticado" });
    }

    // Verifica se o perfil do usuário está na lista de permitidos
    if (!perfisPermitidos.includes(usuario.perfil)) {
      return res.status(403).json({
        error: "Acesso negado. Você não tem permissão para esta ação.",
      });
    }

    next();
  };
}
