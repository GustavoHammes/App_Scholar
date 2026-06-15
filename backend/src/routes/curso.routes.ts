import { Router } from "express";
import * as cursoController from "../controllers/curso.controller";
import { autenticar } from "../middleware/auth.middleware";
import { autorizar } from "../middleware/role.middleware";

const router = Router();

router.use(autenticar);

router.get("/", cursoController.listar);
router.get("/:id", cursoController.buscarPorId);

router.post("/", autorizar("ADMIN"), cursoController.criar);
router.put("/:id", autorizar("ADMIN"), cursoController.atualizar);
router.delete("/:id", autorizar("ADMIN"), cursoController.deletar);

export default router;