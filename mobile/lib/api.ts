/**
 * Cliente HTTP para o app mobile
 * Injeta o token JWT automaticamente em cada requisição.
 * Usa AsyncStorage para persistir o token entre sessões.
 */

import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "@/constants/api";

export const STORAGE_TOKEN = "scholar_token";
export const STORAGE_USUARIO = "scholar_usuario";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 segundos — redes móveis podem ser mais lentas
  headers: { "Content-Type": "application/json" },
});

// Interceptor de requisição: adiciona o Bearer token salvo no AsyncStorage
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem(STORAGE_TOKEN);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor de resposta: limpa a sessão se o token expirar (401)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.multiRemove([STORAGE_TOKEN, STORAGE_USUARIO]);
    }
    return Promise.reject(error);
  }
);

export default api;
