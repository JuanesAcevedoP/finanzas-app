import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import * as SecureStore from "expo-secure-store";
import { api } from "@/api/client";
import { listPaymentMethods } from "@/api/paymentMethods";

type AuthContextType = {
  token: string | null;
  isLoading: boolean;
  onboardingComplete: boolean | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  completeOnboarding: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [onboardingComplete, setOnboardingComplete] = useState<boolean | null>(null);

  const refreshOnboardingStatus = async () => {
    try {
      const methods = await listPaymentMethods();
      setOnboardingComplete(methods.length > 0);
    } catch {
      setOnboardingComplete(false);
    }
  };

  useEffect(() => {
    SecureStore.getItemAsync("access_token").then(async (value) => {
      setToken(value);
      if (value) {
        await refreshOnboardingStatus();
      }
      setIsLoading(false);
    });
  }, []);

  const login = async (email: string, password: string) => {
    const form = new URLSearchParams();
    form.append("username", email);
    form.append("password", password);

    const response = await api.post("/login", form.toString(), {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    await SecureStore.setItemAsync("access_token", response.data.access_token);
    setToken(response.data.access_token);
    await refreshOnboardingStatus();
  };

  const register = async (name: string, email: string, password: string) => {
    await api.post("/register", { name, email, password });
    await login(email, password);
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync("access_token");
    setToken(null);
    setOnboardingComplete(null);
  };

  const completeOnboarding = () => setOnboardingComplete(true);

  return (
    <AuthContext.Provider
      value={{ token, isLoading, onboardingComplete, login, register, logout, completeOnboarding }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
}
