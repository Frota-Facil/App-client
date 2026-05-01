import { View, Text, TouchableOpacity, Image } from "react-native";
import { useRouter, usePathname, Href } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { styles } from "../../styles/globalStyles";

type TabItemProps = {
  label: string;
  icon: any;
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
          opacity: isActive ? 1 : 0.5,
        }}
      />

      <Text
        style={[
          styles.tabLabel,
          { opacity: isActive ? 1 : 0.5 },
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
    <View>
      {/* TAB BAR BRANCA */}
      <View
        style={[
          styles.tabBar,
          {
            paddingBottom: 10, // padding interno da tab
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
          route="/perfil"
          icon={require("../../assets/images/perfil.png")}
        />
      </View>

      {/* FUNDO PRETO DO SISTEMA (ANDROID/IPHONE) */}
      <View
        style={{
          height: insets.bottom,
          backgroundColor: "#000",
        }}
      />
    </View>
  );
};