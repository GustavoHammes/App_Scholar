/**
 * Rotas de Alunos
 * Define quais perfis podem acessar cada endpoint
 */

import { Router } from "express";
import * as alunoController from "../controllers/aluno.controller";
import { autenticar } from "../middleware/auth.middleware";
import { autorizar } from "../middleware/role.middleware";

const router = Router();

// Todas as rotas de alunos requerem autenticação
router.use(autenticar);

// GET /api/alunos — lista alunos (Admin: todos | Professor: os seus | Aluno: apenas ele)
router.get("/", alunoController.listar);

// GET /api/alunos/boletim/:matricula — boletim por matrícula (API 3 do PDF)
router.get("/boletim/:matricula", alunoController.boletim);

// GET /api/alunos/:id — dados de um aluno específico
router.get("/:id", alunoController.buscarPorId);

// POST /api/alunos — cria um novo aluno (somente Admin)
router.post("/", autorizar("ADMIN"), alunoController.criar);

// PUT /api/alunos/:id — atualiza aluno (Admin: tudo | Aluno: dados pessoais)
router.put("/:id", autorizar("ADMIN", "ALUNO"), alunoController.atualizar);

// PATCH /api/alunos/:id/desativar — desativa um aluno (somente Admin)
router.patch("/:id/desativar", autorizar("ADMIN"), alunoController.desativar);

export default router;
