import { View, Text, TouchableOpacity, Image } from "react-native";
import { styles } from "../../styles/globalStyles";
import { useRouter, usePathname, Href } from "expo-router";

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

      <Text style={styles.tabLabel}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

export const TabBar = () => (
  <View>
    <View style={styles.tabBar}>
      
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
        route="/avisos"//ainda não tem tela de avisos, mas já deixei o caminho preparado
        icon={require("../../assets/images/notificacao.png")}
      />

      <TabItem
        label="Perfil"
        route="/perfil"//ainda não tem tela de perfil, mas já deixei o caminho preparado
        icon={require("../../assets/images/perfil.png")}
      />

    </View>

    <View style={styles.backblack} />
  </View>
);