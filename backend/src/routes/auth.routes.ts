/**
 * Rotas de Autenticação
 */

import { Router } from "express";
import { login, trocarSenha, me, redefinirSenha } from "../controllers/auth.controller";
import { autenticar } from "../middleware/auth.middleware";

const router = Router();

// POST /api/auth/login — autenticação com e-mail e senha
router.post("/login", login);

// POST /api/auth/redefinir-senha — redefine senha sem autenticação (esqueci minha senha)
router.post("/redefinir-senha", redefinirSenha);

// PUT /api/auth/senha — troca de senha (requer autenticação)
router.put("/senha", autenticar, trocarSenha);

// GET /api/auth/me — dados do usuário logado
router.get("/me", autenticar, me);

export default router;