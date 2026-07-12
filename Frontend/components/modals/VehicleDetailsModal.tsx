import React from "react";
import { Image, Modal, Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";

import {
  formatVehicleType,
  getVehicleDisplayName,
  getVehicleStatusMeta,
  normalizeVehicleStatus,
  Vehicle,
} from "../../constants/data";
import { normalizeImageUrl } from "../../services/imageUrl";
import { styles } from "../../styles/globalStyles";

type VehicleDetailsModalProps = {
  visible: boolean;
  vehicle: Vehicle | null;
  onClose: () => void;
};

const vehicleImage = require("../../assets/images/hatchbackmaior.png");

const formatOdometer = (odometer?: number) => {
  if (odometer === undefined) {
    return "Não informado";
  }

  return `${odometer.toLocaleString("pt-BR")} km`;
};

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.vehicleModalDetailRow}>
    <Text style={styles.vehicleModalDetailLabel}>{label}</Text>
    <Text style={styles.vehicleModalDetailValue}>{value}</Text>
  </View>
);

const getRequestButtonText = (status: string) => {
  switch (status) {
    case "available":
      return "Solicitar veículo";
    case "in_use":
      return "Veículo em uso";
    case "maintenance":
      return "Veículo em manutenção";
    default:
      return "Veículo indisponível";
  }
};

export const VehicleDetailsModal = ({
  visible,
  vehicle,
  onClose,
}: VehicleDetailsModalProps) => {
  if (!vehicle) {
    return null;
  }

  const displayName = getVehicleDisplayName(vehicle);
  const status = getVehicleStatusMeta(vehicle.status);
  const normalizedStatus = normalizeVehicleStatus(vehicle.status);
  const canRequestVehicle = normalizedStatus === "available";
  const normalizedImageUrl = normalizeImageUrl(vehicle.imageUrl);
  const hasVehicleImage = Boolean(normalizedImageUrl);
  const imageSource = normalizedImageUrl
    ? { uri: normalizedImageUrl }
    : vehicleImage;
  const requestButtonText = getRequestButtonText(normalizedStatus);

  const handleRequestVehicle = () => {
    if (!canRequestVehicle) {
      return;
    }

    onClose();
    router.push({
      pathname: "/addrequest",
      params: { vehicleId: String(vehicle.id) },
    });
  };

  return (
    <Modal
      animationType="fade"
      onRequestClose={onClose}
      transparent
      visible={visible}
    >
      <View style={styles.vehicleModalOverlay}>
        <View style={styles.vehicleModalBackdrop} />

        <View style={styles.vehicleModalCard}>
          <View style={styles.vehicleModalImageWrapper}>
            <Image
              resizeMode={hasVehicleImage ? "cover" : "contain"}
              source={imageSource}
              style={
                hasVehicleImage
                  ? styles.vehicleModalImage
                  : styles.vehicleModalPlaceholderImage
              }
            />
          </View>

          <View style={styles.vehicleModalDetails}>
            <DetailRow label="Placa" value={vehicle.plate} />
            <DetailRow label="Modelo" value={displayName} />
            <DetailRow
              label="Ano"
              value={vehicle.year ? String(vehicle.year) : "Não informado"}
            />
            <DetailRow
              label="Odômetro"
              value={formatOdometer(vehicle.odometer)}
            />
            <DetailRow label="Tipo" value={formatVehicleType(vehicle.type)} />
            <DetailRow label="Status" value={status.label} />
          </View>

          <TouchableOpacity
            activeOpacity={0.85}
            disabled={!canRequestVehicle}
            onPress={handleRequestVehicle}
            style={[
              styles.vehicleModalRequestButton,
              !canRequestVehicle && styles.vehicleModalRequestButtonDisabled,
            ]}
          >
            <Text
              style={[
                styles.vehicleModalRequestButtonText,
                !canRequestVehicle &&
                  styles.vehicleModalRequestButtonTextDisabled,
              ]}
            >
              {requestButtonText}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={onClose}
            style={styles.vehicleModalFooterButton}
          >
            <Text style={styles.vehicleModalFooterButtonText}>Fechar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};
