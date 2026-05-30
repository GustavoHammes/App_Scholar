/**
 * Instância singleton do PrismaClient
 * Em desenvolvimento, o hot-reload do Node pode criar múltiplas conexões.
 * Armazenamos a instância no objeto global para evitar esse problema.
 */

import { PrismaClient } from "@prisma/client";

// Declaração para o TypeScript reconhecer a propriedade no objeto global
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Reutiliza a instância existente ou cria uma nova
export const prisma = global.prisma ?? new PrismaClient();

// Em desenvolvimento, guarda no global para sobreviver ao hot-reload
if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}
