/**
 * Constantes de configuração da API
 *
 * ⚠️  ATENÇÃO — LEIA ANTES DE TESTAR NO CELULAR:
 *
 * Quando usar o Expo Go em um celular físico (não emulador),
 * o "localhost" NÃO funciona — o celular não sabe que localhost
 * é o seu computador. Você precisa usar o IP da sua máquina na rede Wi-Fi.
 *
 * Como descobrir seu IP local:
 *   Windows: abra o CMD e digite  ipconfig
 *             procure "Endereço IPv4" (ex: 192.168.1.105)
 *
 * Depois substitua abaixo:
 *   const IP_LOCAL = "192.168.1.105";  ← seu IP aqui
 *
 * No emulador Android: use "10.0.2.2" no lugar de "localhost"
 * No simulador iOS:    use "localhost" normalmente
 */

import Constants from "expo-constants";

// ─── CONFIGURE SEU IP LOCAL AQUI ────────────────────────────
const IP_LOCAL = "192.168.137.167"; // ← troque pelo seu IP local
// ─────────────────────────────────────────────────────────────

const PORTA_BACKEND = "3001";

// Em desenvolvimento usa o IP local; em produção usaria a URL do servidor
export const API_BASE_URL =
  Constants.expoConfig?.extra?.apiUrl ??
  `http://${IP_LOCAL}:${PORTA_BACKEND}/api`;
