/**
 * Rotas de Notas
 */

import { Router } from "express";
import * as notaController from "../controllers/nota.controller";
import { autenticar } from "../middleware/auth.middleware";
import { autorizar } from "../middleware/role.middleware";

const router = Router();

router.use(autenticar);

// GET /api/notas/aluno/:alunoId — notas de um aluno (Admin, Professor e o próprio Aluno)
router.get("/aluno/:alunoId", notaController.listarPorAluno);

// GET /api/notas/disciplina/:disciplinaId — notas de uma disciplina (Admin e Professor)
router.get(
  "/disciplina/:disciplinaId",
  autorizar("ADMIN", "PROFESSOR"),
  notaController.listarPorDisciplina
);

// POST /api/notas — lança nota (Admin e Professor)
router.post("/", autorizar("ADMIN", "PROFESSOR"), notaController.criar);

// PUT /api/notas/:id — atualiza nota e recalcula média (Admin e Professor)
router.put("/:id", autorizar("ADMIN", "PROFESSOR"), notaController.atualizar);

export default router;
