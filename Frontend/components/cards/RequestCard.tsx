import React from "react";
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type GestureResponderEvent,
} from "react-native";
import { Pencil } from "lucide-react-native";

import type { RequestStatusLabel } from "../../constants/requests";
import { colors } from "../../constants/colors";
import { styles } from "../../styles/globalStyles";

type Props = {
  name: string;
  plate: string;
  date: string;
  location: string;
  status: RequestStatusLabel;
  onPress?: () => void;
  onEditPress?: () => void;
};

export const RequestCard: React.FC<Props> = ({
  name,
  plate,
  date,
  location,
  status,
  onPress,
  onEditPress,
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

  const handleEditPress = (event: GestureResponderEvent) => {
    event.stopPropagation();
    onEditPress?.();
  };

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      disabled={!onPress}
      onPress={onPress}
      style={styles.requestCard}
    >
      <View style={cardStyles.content}>
        <Text numberOfLines={1} style={styles.vehicleName}>
          {name}
        </Text>

        <Text style={styles.vehiclePlate}>{plate}</Text>

        <View style={cardStyles.metaRow}>
          <View style={cardStyles.metaItem}>
            <Image
              source={require("../../assets/images/calendario.png")}
              style={cardStyles.metaIcon}
            />
            <Text style={cardStyles.metaText}>{date}</Text>
          </View>

          <View style={cardStyles.locationItem}>
            <Image
              source={require("../../assets/images/alfinetes.png")}
              style={cardStyles.metaIcon}
            />
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={cardStyles.metaText}
            >
              {location || "Não informado"}
            </Text>
          </View>
        </View>
      </View>

      <View style={cardStyles.rightActionsContainer}>
        <View style={cardStyles.statusAndEditContainer}>
          <View
            style={[
              cardStyles.statusBadge,
              { backgroundColor: statusStyle.backgroundColor },
            ]}
          >
            <Text style={[cardStyles.statusText, { color: statusStyle.color }]}>
              {status}
            </Text>
          </View>

          {onEditPress ? (
            <TouchableOpacity
              accessibilityLabel="Editar solicitação"
              activeOpacity={0.75}
              hitSlop={8}
              onPress={handleEditPress}
              style={cardStyles.editButton}
            >
              <Pencil size={15} color={colors.primary} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const cardStyles = StyleSheet.create({
  content: {
    flex: 1,
    minWidth: 0,
  },

  metaRow: {
    alignItems: "center",
    flexDirection: "row",
    marginTop: 6,
  },

  metaItem: {
    alignItems: "center",
    flexDirection: "row",
    flexShrink: 0,
    marginRight: 12,
  },

  locationItem: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    minWidth: 0,
  },

  metaIcon: {
    width: 20,
    height: 20,
    marginRight: 4,
  },

  metaText: {
    flexShrink: 1,
    color: "#6B7280",
    fontSize: 12,
  },

  rightActionsContainer: {
    alignItems: "flex-end",
    alignSelf: "stretch",
    justifyContent: "center",
    marginLeft: 14,
    minWidth: 94,
  },

  statusAndEditContainer: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
  },

  editButton: {
    alignItems: "center",
    justifyContent: "center",
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },

  statusBadge: {
    borderRadius: 12,
    maxWidth: 104,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },

  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
});
