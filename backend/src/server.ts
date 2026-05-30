/**
 * Ponto de entrada do servidor Express
 * Configura middlewares globais, conecta as rotas e inicializa o servidor
 */

import "dotenv/config"; // Carrega variáveis do arquivo .env
import express from "express";
import cors from "cors";
import routes from "./routes";

const app = express();
const PORT = process.env.PORT ?? 3001;

// ─────────────────────────────────────────────
// Middlewares globais
// ─────────────────────────────────────────────

// Permite requisições cross-origin do frontend (Next.js rodando em localhost:3000)
app.use(
  cors({
    origin: process.env.FRONTEND_URL ?? "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Interpreta o corpo das requisições como JSON
app.use(express.json());

// ─────────────────────────────────────────────
// Rota de saúde — útil para verificar se o servidor está ativo
// ─────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ─────────────────────────────────────────────
// Rotas da API
// Todas as rotas da aplicação são prefixadas com /api
// ─────────────────────────────────────────────
app.use("/api", routes);

// ─────────────────────────────────────────────
// Tratamento de rota não encontrada (404)
// ─────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: "Rota não encontrada" });
});

// Inicia o servidor na porta configurada
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/health`);
});

export default app;
