import { View, Text, TouchableOpacity } from "react-native";
import { styles } from "../../styles/globalStyles";

type TabItemProps = {
  label: string;
  icon: string;
  active?: boolean; // opcional
};

const TabItem: React.FC<TabItemProps> = ({ label, icon, active = false }) => {
  return (
    <TouchableOpacity style={styles.tabItem}>
      <Text>{icon}</Text>
      <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

export const TabBar = () => (
  <View >
    <View style={styles.tabBar}>
    <TabItem label="Início" icon="⌂" active />
    <TabItem label="Veículos" icon="🚗" />
    <TabItem label="Solicitações" icon="📋" />
    <TabItem label="Avisos" icon="🔔" />
    <TabItem label="Perfil" icon="👤" />
    </View>
    <View style={styles.backblack}>

    </View>
  </View>

);