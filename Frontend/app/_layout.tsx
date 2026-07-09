import { Stack, usePathname, useRouter } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { MD3LightTheme, PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { TabBar } from "../components/layout/TabBar";
import { colors } from "../constants/colors";
import { AuthProvider, useAuth } from "../contexts/AuthContext";
import {
  subscribeToTrackingQueueSync,
  syncTrackingQueue,
} from "../services/trackingService";
import "../services/trackingLocation";

const paperTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.primary,
    secondary: colors.primary,
    background: colors.background,
    surface: "#FFFFFF",
  },
};

const tabBarPaths = new Set([
  "/home",
  "/vehicles",
  "/solicitacoes",
  "/avisos",
  "/perfil",
  "/trips",
]);

const shouldShowTabBar = (pathname: string) =>
  tabBarPaths.has(pathname) || pathname.startsWith("/trips/");

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30,
      retry: 1,
      refetchOnMount: true,
      refetchOnReconnect: true,
    },
  },
});

function AppShell({ isAuthenticated }: { isAuthenticated: boolean }) {
  const pathname = usePathname();

  return (
    <View style={styles.appShell}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="home" />
        <Stack.Screen name="vehicles" />
        <Stack.Screen name="solicitacoes" />
        <Stack.Screen name="avisos" />
        <Stack.Screen name="perfil" />
        <Stack.Screen name="addrequest" />
        <Stack.Screen name="trips" />
        <Stack.Screen name="trips/[id]" />
      </Stack>

      {isAuthenticated && shouldShowTabBar(pathname) && <TabBar />}
    </View>
  );
}

function AuthGate() {
  const router = useRouter();
  const pathname = usePathname();
  const { isLoading, token } = useAuth();

  const isAuthenticated = Boolean(token);
  const isLoginRoute = pathname === "/";

  const shouldRedirectToLogin =
    !isLoading && !isAuthenticated && !isLoginRoute;

  const shouldRedirectToHome =
    !isLoading && isAuthenticated && isLoginRoute;

  useEffect(() => {
    if (shouldRedirectToLogin) {
      router.replace("/");
      return;
    }

    if (shouldRedirectToHome) {
      router.replace("/home");
    }
  }, [router, shouldRedirectToHome, shouldRedirectToLogin]);

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <>
      <AppShell isAuthenticated={isAuthenticated} />

      {(shouldRedirectToLogin || shouldRedirectToHome) && (
        <View style={[styles.loading, styles.overlay]}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      )}
    </>
  );
}

export default function RootLayout() {
  useEffect(() => {
    void syncTrackingQueue();

    return subscribeToTrackingQueueSync();
  }, []);

  return (
    <SafeAreaProvider>
      <PaperProvider theme={paperTheme}>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <AuthGate />
          </AuthProvider>
        </QueryClientProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  appShell: {
    flex: 1,
  },

  loading: {
    alignItems: "center",
    backgroundColor: colors.background,
    flex: 1,
    justifyContent: "center",
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
});
