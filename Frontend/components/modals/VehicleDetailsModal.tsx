import React from "react";
import { Image, Modal, Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";

import {
  formatVehicleType,
  getVehicleDisplayName,
  getVehicleStatusMeta,
  Vehicle,
} from "../../constants/data";
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
  const imageSource = vehicle.imageUrl ? { uri: vehicle.imageUrl } : vehicleImage;

  const handleRequestVehicle = () => {
    onClose();
    router.push("/addrequest");
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
              resizeMode="contain"
              source={imageSource}
              style={styles.vehicleModalImage}
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
            onPress={handleRequestVehicle}
            style={styles.vehicleModalRequestButton}
          >
            <Text style={styles.vehicleModalRequestButtonText}>
              Solicitar veículo
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
