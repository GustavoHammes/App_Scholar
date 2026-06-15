/**
 * Índice central de rotas
 * Agrega todos os módulos de rotas e os monta sob o prefixo /api
 */

import { Router } from "express";

import authRoutes from "./auth.routes";
import alunoRoutes from "./aluno.routes";
import professorRoutes from "./professor.routes";
import cursoRoutes from "./curso.routes";
import disciplinaRoutes from "./disciplina.routes";
import notaRoutes from "./nota.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/alunos", alunoRoutes);
router.use("/professores", professorRoutes);
router.use("/cursos", cursoRoutes);
router.use("/disciplinas", disciplinaRoutes);
router.use("/notas", notaRoutes);

export default router;
