import { Stack, usePathname, useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { MD3LightTheme, PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { colors } from "../constants/colors";
import { AuthProvider, useAuth } from "../contexts/AuthContext";

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

const AuthGate = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { isLoading, token } = useAuth();

  const isAuthenticated = Boolean(token);
  const isLoginRoute = pathname === "/";
  const shouldRedirectToLogin = !isLoading && !isAuthenticated && !isLoginRoute;
  const shouldRedirectToHome = !isLoading && isAuthenticated && isLoginRoute;

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
      <View style={layoutStyles.loading}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Protected guard={!isAuthenticated}>
          <Stack.Screen name="index" />
        </Stack.Protected>

        <Stack.Protected guard={isAuthenticated}>
          <Stack.Screen name="home" />
          <Stack.Screen name="vehicles" />
          <Stack.Screen name="solicitacoes" />
          <Stack.Screen name="avisos" />
          <Stack.Screen name="perfil" />
          <Stack.Screen name="addrequest" />
          <Stack.Screen name="trips" />
          <Stack.Screen name="trips/[id]" />
        </Stack.Protected>
      </Stack>

      {(shouldRedirectToLogin || shouldRedirectToHome) && (
        <View style={[layoutStyles.loading, layoutStyles.overlay]}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      )}
    </>
  );
};

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={paperTheme}>
        <AuthProvider>
          <AuthGate />
        </AuthProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}

const layoutStyles = StyleSheet.create({
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
