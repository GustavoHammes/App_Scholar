/**
 * Middleware de autenticação JWT
 * Verifica se o token enviado no header Authorization é válido.
 * Caso seja, injeta os dados do usuário em req.user para uso nos controllers.
 */

import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Tipagem do payload que armazenamos dentro do JWT
export interface TokenPayload {
  id: number;
  email: string;
  perfil: "ADMIN" | "PROFESSOR" | "ALUNO";
  nome: string;
}

// Estende a interface Request do Express para incluir o usuário autenticado
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export function autenticar(req: Request, res: Response, next: NextFunction) {
  // O token deve vir no header: Authorization: Bearer <token>
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ error: "Token de autenticação não fornecido" });
  }

  const token = authHeader.split(" ")[1];
  const secret = process.env.JWT_SECRET ?? "secret_padrao_nao_usar_em_producao";

  try {
    // Verifica e decodifica o token
    const payload = jwt.verify(token, secret) as TokenPayload;
    req.user = payload; // Injeta os dados do usuário na requisição
    next(); // Prossegue para o próximo middleware ou controller
  } catch {
    return res.status(401).json({ error: "Token inválido ou expirado" });
  }
}
