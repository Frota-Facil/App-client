import { View, Text, TouchableOpacity } from "react-native";
import { Clock3, MapPin } from "lucide-react-native";
import { styles } from "../../styles/globalStyles";
import { TripStatus } from "../../constants/trips";

type TripCardProps = {
  destination: string;
  date: string;
  time: string;
  vehicle: string;
  plate: string;
  status: TripStatus;
  onPress?: () => void;
};

export const TripCard = ({
  destination,
  date,
  time,
  vehicle,
  plate,
  status,
  onPress,
}: TripCardProps) => {
  const getStatus = () => {
    switch (status) {
      case "scheduled":
        return {
          label: "Agendada",
          bg: "#FEF3C7",
          color: "#92400E",
        };

      case "in_progress":
        return {
          label: "Em andamento",
          bg: "#CCFBF1",
          color: "#0F766E",
        };

      case "finished":
        return {
          label: "Finalizada",
          bg: "#DCFCE7",
          color: "#16A34A",
        };

      default:
        return {
          label: "Agendada",
          bg: "#FEF3C7",
          color: "#92400E",
        };
    }
  };

  const s = getStatus();

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={styles.tripCard}
    >
      <View style={styles.tripTop}>
        <View style={styles.tripTitleArea}>
          <MapPin
            size={18}
            color="#1B3A5C"
            style={styles.tripLocationIcon}
          />
          <Text style={styles.tripDestination}>{destination}</Text>
        </View>

        <View style={[styles.tripStatusBadge, { backgroundColor: s.bg }]}>
          <View style={[styles.tripStatusDot, { backgroundColor: s.color }]} />
          <Text style={[styles.tripStatusText, { color: s.color }]}>
            {s.label}
          </Text>
        </View>
      </View>

      <View style={styles.tripInfoRow}>
        <View style={styles.tripInfoItem}>
          <Clock3 size={14} color="#6B7280" />
          <Text style={styles.tripInfoText}>{date} · {time}</Text>
        </View>
        <Text style={styles.tripInfoText}>{vehicle} · {plate}</Text>
      </View>
    </TouchableOpacity>
  );
};
