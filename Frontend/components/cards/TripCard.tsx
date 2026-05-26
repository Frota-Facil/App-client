import { View, Text, TouchableOpacity } from "react-native";
import { styles } from "../../styles/globalStyles";
import { TripStatus } from "../../constants/trips";

type TripCardProps = {
  destination: string;
  date: string;
  time: string;
  vehicle: string;
  plate: string;
  status: TripStatus;
};

export const TripCard = ({
  destination,
  date,
  time,
  vehicle,
  plate,
  status,
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
    <TouchableOpacity style={styles.tripCard}>
      <View style={styles.tripTop}>
        <View style={styles.tripTitleArea}>
          <Text style={styles.tripLocationIcon}>◎</Text>
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
        <Text style={styles.tripInfoText}>◷ {date} · {time}</Text>
        <Text style={styles.tripInfoText}>🚙 {vehicle} · {plate}</Text>
      </View>
    </TouchableOpacity>
  );
};