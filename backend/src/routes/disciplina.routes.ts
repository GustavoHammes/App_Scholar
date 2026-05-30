/**
 * Rotas de Disciplinas
 */

import { Router } from "express";
import * as disciplinaController from "../controllers/disciplina.controller";
import { autenticar } from "../middleware/auth.middleware";
import { autorizar } from "../middleware/role.middleware";

const router = Router();

router.use(autenticar);

// GET /api/disciplinas — lista disciplinas (todos os perfis podem ver)
router.get("/", disciplinaController.listar);

// GET /api/disciplinas/:id — detalhes de uma disciplina
router.get("/:id", disciplinaController.buscarPorId);

// POST /api/disciplinas — cria disciplina (somente Admin)
router.post("/", autorizar("ADMIN"), disciplinaController.criar);

// PUT /api/disciplinas/:id — atualiza (Admin: tudo | Professor: campos informativos)
router.put("/:id", autorizar("ADMIN", "PROFESSOR"), disciplinaController.atualizar);

// DELETE /api/disciplinas/:id — remove disciplina (somente Admin)
router.delete("/:id", autorizar("ADMIN"), disciplinaController.deletar);

export default router;
