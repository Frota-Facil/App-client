import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";

import type { RequestStatusLabel } from "../../constants/requests";
import { styles } from "../../styles/globalStyles";

type Props = {
  name: string;
  plate: string;
  date: string;
  location: string;
  status: RequestStatusLabel;
  onPress?: () => void;
};

export const RequestCard: React.FC<Props> = ({
  name,
  plate,
  date,
  location,
  status,
  onPress,
}) => {
  const getStatusStyle = () => {
    switch (status) {
      case "Aprovada":
        return { backgroundColor: "#DCFCE7", color: "#16A34A" };
      case "Pendente":
        return { backgroundColor: "#FEF3C7", color: "#D97706" };
      case "Concluída":
        return { backgroundColor: "#E5E7EB", color: "#374151" };
      case "Recusada":
        return { backgroundColor: "#FEE2E2", color: "#DC2626" };
    }
  };

  const statusStyle = getStatusStyle();

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      disabled={!onPress}
      onPress={onPress}
      style={styles.requestCard}
    >
      <View style={{ flex: 1 }}>
        <Text style={styles.vehicleName}>{name}</Text>
        <Text style={styles.vehiclePlate}>{plate}</Text>

        {/* DATA + LOCAL */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginTop: 6,
            flexWrap: "wrap",
          }}
        > 
          <View style={{ flexDirection: "row", alignItems: "center", marginRight: 12 }}>
            <Image
              source={require("../../assets/images/calendario.png")}
              style={{ width: 20, height: 20, marginRight: 4 }}
            />
            <Text style={{ fontSize: 12, color: "#6B7280" }}>{date}</Text>

            <Text style={{ marginHorizontal: 6, color: "#9CA3AF" }}></Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Image
              source={require("../../assets/images/alfinetes.png")}
              style={{ width: 20, height: 20, marginRight: 4 }}
            />
            <Text style={{ fontSize: 12, color: "#6B7280"  }}>
              {location}
            </Text>
          </View>
        </View>
      </View>

      {/* STATUS */}
      <View
        style={{
          backgroundColor: statusStyle.backgroundColor,
          paddingHorizontal: 10,
          paddingVertical: 4,
          borderRadius: 12,
          alignSelf: "center",
          
        }}
      >
        <Text style={{ color: statusStyle.color, fontSize: 12 }}>
          {status}
        </Text>
      </View>
    </TouchableOpacity>
  );
};
