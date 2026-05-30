/**
 * Rotas de Professores
 */

import { Router } from "express";
import * as professorController from "../controllers/professor.controller";
import { autenticar } from "../middleware/auth.middleware";
import { autorizar } from "../middleware/role.middleware";

const router = Router();

router.use(autenticar);

// GET /api/professores — lista professores (todos os perfis podem ver)
router.get("/", professorController.listar);

// GET /api/professores/:id — dados de um professor específico
router.get("/:id", professorController.buscarPorId);

// POST /api/professores — cria professor (somente Admin)
router.post("/", autorizar("ADMIN"), professorController.criar);

// PUT /api/professores/:id — atualiza professor (Admin: tudo | Professor: próprios dados)
router.put("/:id", autorizar("ADMIN", "PROFESSOR"), professorController.atualizar);

export default router;
