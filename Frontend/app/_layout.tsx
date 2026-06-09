import { Stack, usePathname } from "expo-router";
import { StyleSheet, View } from "react-native";
import { MD3LightTheme, PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { TabBar } from "../components/layout/TabBar";
import { colors } from "../constants/colors";

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

function AppShell() {
  const pathname = usePathname();

  return (
    <View style={styles.appShell}>
      <Stack screenOptions={{ headerShown: false }} />
      {shouldShowTabBar(pathname) && <TabBar />}
    </View>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={paperTheme}>
        <AppShell />
      </PaperProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  appShell: {
    flex: 1,
  },
});
