import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ImageSourcePropType,
} from "react-native";
import { useRouter, usePathname, Href } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors } from "../../constants/colors";
import { styles } from "../../styles/globalStyles";

export const TAB_BAR_BASE_HEIGHT = 64;

export const getTabBarBottomPadding = (bottomInset: number) =>
  Math.max(bottomInset, 8);

export const getTabBarHeight = (bottomInset: number) =>
  TAB_BAR_BASE_HEIGHT + bottomInset;

export const getTabBarContentPadding = (bottomInset: number) =>
  getTabBarHeight(bottomInset) + 16;

type TabItemProps = {
  label: string;
  icon: ImageSourcePropType;
  route: Href;
};

const TabItem: React.FC<TabItemProps> = ({ label, icon, route }) => {
  const router = useRouter();
  const pathname = usePathname();

  const isActive = pathname === route;

  return (
    <TouchableOpacity
      style={styles.tabItem}
      onPress={() => router.push(route)}
    >
      <Image
        source={icon}
        style={{
          width: 22,
          height: 22,
          opacity: 1,
          tintColor: isActive ? colors.primary : colors.textMuted,
        }}
      />

      <Text
        style={[
          styles.tabLabel,
          isActive && styles.tabLabelActive,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};

export const TabBar = () => {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.tabBar,
        {
          height: getTabBarHeight(insets.bottom),
          paddingBottom: getTabBarBottomPadding(insets.bottom),
          paddingTop: 8,
        },
      ]}
    >
      <TabItem
        label="Início"
        route="/home"
        icon={require("../../assets/images/casa.png")}
      />

      <TabItem
        label="Veículos"
        route="/vehicles"
        icon={require("../../assets/images/hatchback.png")}
      />

      <TabItem
        label="Solicitações"
        route="/solicitacoes"
        icon={require("../../assets/images/solicitacoes.png")}
      />

      <TabItem
        label="Avisos"
        route="/avisos"
        icon={require("../../assets/images/notificacao.png")}
      />

      <TabItem
        label="Perfil"
        route={"/perfil" as Href}
        icon={require("../../assets/images/perfil.png")}
      />
    </View>
  );
};
