import React, {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { PropsWithChildren } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { Platform } from "react-native";

import { login, loginWithGoogleIdToken } from "../services/auth";
import { PushTokenRequestError, savePushToken } from "../services/pushTokens";
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
  signInWithGoogle: (idToken: string) => Promise<void>;
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
  const queryClient = useQueryClient();
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { mutateAsync: savePushTokenAsync } = useMutation({
    mutationFn: ({
      authToken,
      platform,
      pushToken,
    }: {
      authToken: string;
      platform: PushTokenPlatform;
      pushToken: string;
    }) => savePushToken(authToken, pushToken, platform),
  });

  useEffect(() => {
    getSession()
      .then(setSession)
      .catch((error) => {
        console.warn("Não foi possível carregar a sessão salva.", error);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const registerPushTokenAfterLogin = useCallback(
    async (authToken: string) => {
      const { registerForPushNotificationsAsync } = await import(
        "../services/pushNotifications"
      );
      const pushToken = await registerForPushNotificationsAsync();

      if (!pushToken) {
        console.warn(
          "[push] Expo Push Token indisponível; token não será enviado ao backend."
        );
        return;
      }

      const platform = getPushTokenPlatform();

      if (!platform) {
        console.warn("Plataforma não suportada para Expo Push Token:", Platform.OS);
        return;
      }

      try {
        const savedPushToken = await savePushTokenAsync({
          authToken,
          platform,
          pushToken,
        });

        console.log("Expo Push Token salvo no core-service:", savedPushToken);
      } catch (error) {
        if (error instanceof PushTokenRequestError) {
          console.warn("Erro ao salvar push token", {
            url: error.url,
            status: error.status,
            responseBody: error.responseBody,
            hasToken: Boolean(pushToken),
            hasAuthToken: Boolean(authToken),
          });
          return;
        }

        console.warn("Erro ao salvar Expo Push Token no core-service:", error);
      }
    },
    [savePushTokenAsync]
  );

  const persistAuthenticatedSession = useCallback(
    (nextSession: AuthSession) => {
      setSession(nextSession);

      void saveSession(nextSession).catch((error) => {
        console.warn("Não foi possível salvar a sessão.", error);
      });

      void registerPushTokenAfterLogin(nextSession.token).catch((error) => {
        console.warn("Erro ao registrar push notifications após login:", error);
      });
    },
    [registerPushTokenAfterLogin]
  );

  const signIn = useCallback(
    async (email: string, password: string) => {
      const nextSession = await login(email, password);

      persistAuthenticatedSession(nextSession);
    },
    [persistAuthenticatedSession]
  );

  const signInWithGoogle = useCallback(
    async (idToken: string) => {
      const nextSession = await loginWithGoogleIdToken(idToken);

      persistAuthenticatedSession(nextSession);
    },
    [persistAuthenticatedSession]
  );

  const signOut = useCallback(async () => {
    try {
      const { stopRouteTracking } = await import(
        "../services/trackingLocation"
      );

      await stopRouteTracking();
    } catch (error) {
      console.warn("Não foi possível parar o tracking no logout:", error);
    }

    await clearSession();
    queryClient.clear();
    setSession(null);
    router.replace("/");
  }, [queryClient]);

  const value = useMemo(
    () => ({
      isLoading,
      token: session?.token ?? null,
      user: session?.user ?? null,
      signIn,
      signInWithGoogle,
      signOut,
    }),
    [isLoading, session, signIn, signInWithGoogle, signOut]
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
