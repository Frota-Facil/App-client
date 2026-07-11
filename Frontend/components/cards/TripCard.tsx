import { View, Text, TouchableOpacity } from "react-native";
import { Clock3, MapPin } from "lucide-react-native";
import { colors } from "../../constants/colors";
import { styles } from "../../styles/globalStyles";
import {
  formatTripDate,
  formatTripTime,
  getTripCardDateValue,
  getTripStatusMeta,
  type Trip,
} from "../../constants/trips";

type TripCardProps = {
  trip: Trip;
  onPress?: () => void;
};

export const TripCard = ({ trip, onPress }: TripCardProps) => {
  const status = getTripStatusMeta(trip.routeStatus);
  const cardDate = getTripCardDateValue(trip);
  const destination = trip.destination?.trim() || "Destino não informado";
  const vehicleText =
    trip.vehicle?.model && trip.vehicle?.plate
      ? `${trip.vehicle.model} · ${trip.vehicle.plate}`
      : "Veículo não informado";

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
            color={colors.primary}
            style={styles.tripLocationIcon}
          />
          <Text style={styles.tripDestination}>{destination}</Text>
        </View>

        <View style={[styles.tripStatusBadge, { backgroundColor: status.bg }]}>
          <View
            style={[styles.tripStatusDot, { backgroundColor: status.color }]}
          />
          <Text style={[styles.tripStatusText, { color: status.color }]}>
            {status.label}
          </Text>
        </View>
      </View>

      <View style={styles.tripInfoRow}>
        <View style={styles.tripInfoItem}>
          <Clock3 size={14} color={colors.textSecondary} />
          <Text style={styles.tripInfoText}>
            {formatTripDate(cardDate)} · {formatTripTime(cardDate)}
          </Text>
        </View>
        <Text style={styles.tripInfoText}>{vehicleText}</Text>
      </View>
    </TouchableOpacity>
  );
};
