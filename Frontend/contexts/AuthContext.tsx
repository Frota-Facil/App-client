import React, {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { PropsWithChildren } from "react";
import { router } from "expo-router";
import { Platform } from "react-native";

import { login } from "../services/auth";
import { savePushToken } from "../services/pushTokens";
import type { PushTokenPlatform } from "../services/pushTokens";
import {
  clearSession,
  getSession,
  saveSession,
} from "../services/session";
import type { AuthSession, AuthUser } from "../services/session";

type AuthContextValue = {
  isLoading: boolean;
  token: string | null;
  user: AuthUser | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const getPushTokenPlatform = (): PushTokenPlatform | null => {
  if (
    Platform.OS === "android" ||
    Platform.OS === "ios" ||
    Platform.OS === "web"
  ) {
    return Platform.OS;
  }

  return null;
};

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getSession()
      .then(setSession)
      .finally(() => setIsLoading(false));
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const nextSession = await login(email, password);

    await saveSession(nextSession);
    setSession(nextSession);

    try {
      const { registerForPushNotificationsAsync } = await import(
        "../services/pushNotifications"
      );
      const pushToken = await registerForPushNotificationsAsync();
      console.log("Expo Push Token:", pushToken);

      if (!pushToken) {
        return;
      }

      const platform = getPushTokenPlatform();

      if (!platform) {
        console.warn("Plataforma não suportada para Expo Push Token:", Platform.OS);
        return;
      }

      try {
        const savedPushToken = await savePushToken(
          nextSession.token,
          pushToken,
          platform
        );

        console.log("Expo Push Token salvo no core-service:", savedPushToken);
      } catch (error) {
        console.warn("Erro ao salvar Expo Push Token no core-service:", error);
      }
    } catch (error) {
      console.warn("Erro ao registrar push notifications após login:", error);
    }
  }, []);

  const signOut = useCallback(async () => {
    await clearSession();
    setSession(null);
    router.replace("/");
  }, []);

  const value = useMemo(
    () => ({
      isLoading,
      token: session?.token ?? null,
      user: session?.user ?? null,
      signIn,
      signOut,
    }),
    [isLoading, session, signIn, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
};
