import axios from "axios";
import * as SecureStore from "expo-secure-store";

const API_URL = "http://192.168.10.29:8000"; // IP de tu Wi-Fi + puerto del backend

export const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});