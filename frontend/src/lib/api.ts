/**
 * Cliente HTTP centralizado com Axios
 * Injeta automaticamente o token JWT em todas as requisições autenticadas.
 * Redireciona para o login caso o token expire (401).
 */

import axios from "axios";

// Cria uma instância do Axios com a URL base da API
const api = axios.create({
  baseURL: "/api", // Next.js redireciona para o backend via rewrites em next.config.ts
  headers: {
    "Content-Type": "application/json",
  },
});

// ─────────────────────────────────────────────
// Interceptor de requisição
// Adiciona o token JWT no header Authorization antes de cada chamada
// ─────────────────────────────────────────────
api.interceptors.request.use((config) => {
  // O token é salvo no localStorage pelo AuthContext após o login
  const token =
    typeof window !== "undefined" ? localStorage.getItem("scholar_token") : null;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// ─────────────────────────────────────────────
// Interceptor de resposta
// Redireciona para o login se o servidor retornar 401 (token expirado ou inválido)
// ─────────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      // Remove os dados de autenticação e redireciona
      localStorage.removeItem("scholar_token");
      localStorage.removeItem("scholar_usuario");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

// ─────────────────────────────────────────────
// Funções de acesso às APIs externas
// ─────────────────────────────────────────────

/**
 * Busca o endereço pelo CEP usando a API do ViaCEP (externa)
 * Preenchimento automático no cadastro de alunos
 */
export async function buscarEnderecoPorCep(cep: string) {
  const cepLimpo = cep.replace(/\D/g, ""); // Remove formatação do CEP
  const response = await axios.get(
    `https://viacep.com.br/ws/${cepLimpo}/json/`
  );
  return response.data;
}

/**
 * Busca a lista de estados do Brasil via API do IBGE
 */
export async function buscarEstados() {
  const response = await axios.get(
    "https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome"
  );
  return response.data;
}

/**
 * Busca as cidades de um estado via API do IBGE
 * @param uf - Sigla do estado (ex: "SP")
 */
export async function buscarCidades(uf: string) {
  const response = await axios.get(
    `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios?orderBy=nome`
  );
  return response.data;
}

export default api;
