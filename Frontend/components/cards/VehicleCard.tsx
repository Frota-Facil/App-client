import React, { useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

import {
  getVehicleDisplayName,
  getVehicleStatusMeta,
  Vehicle,
} from "../../constants/data";
import { VehicleDetailsModal } from "../modals/VehicleDetailsModal";
import { normalizeImageUrl } from "../../services/imageUrl";
import { styles } from "../../styles/globalStyles";

type VehicleCardProps = Vehicle & {
  variant?: "list" | "grid";
};

const vehicleImage = require("../../assets/images/hatchbackmaior.png");

export const VehicleCard = ({ variant = "list", ...vehicle }: VehicleCardProps) => {
  const [isDetailsVisible, setIsDetailsVisible] = useState(false);
  const status = getVehicleStatusMeta(vehicle.status);
  const displayName = getVehicleDisplayName(vehicle);
  const normalizedImageUrl = normalizeImageUrl(vehicle.imageUrl);
  const hasVehicleImage = Boolean(normalizedImageUrl);
  const imageSource = normalizedImageUrl
    ? { uri: normalizedImageUrl }
    : vehicleImage;

  const renderBadge = (isGrid = false) => (
    <View
      style={[
        styles.vehicleStatusBadge,
        isGrid && styles.vehicleGridStatus,
        { backgroundColor: status.bg },
      ]}
    >
      <View
        style={[styles.vehicleStatusDot, { backgroundColor: status.dot }]}
      />
      <Text style={[styles.vehicleStatusText, { color: status.color }]}>
        {status.label}
      </Text>
    </View>
  );

  if (variant === "grid") {
    return (
      <>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => setIsDetailsVisible(true)}
          style={styles.vehicleGridCard}
        >
          <View style={styles.vehicleGridImage}>
            <Image
              resizeMode={hasVehicleImage ? "cover" : "contain"}
              source={imageSource}
              style={
                hasVehicleImage
                  ? styles.vehicleGridImageAsset
                  : styles.vehicleGridPlaceholderImage
              }
            />
          </View>

          <Text numberOfLines={1} style={styles.vehicleGridName}>
            {displayName}
          </Text>

          <Text style={styles.vehicleGridPlate}>{vehicle.plate}</Text>

          {renderBadge(true)}
        </TouchableOpacity>

        <VehicleDetailsModal
          onClose={() => setIsDetailsVisible(false)}
          vehicle={vehicle}
          visible={isDetailsVisible}
        />
      </>
    );
  }

  return (
    <>
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => setIsDetailsVisible(true)}
        style={styles.vehicleCard}
      >
        <View style={styles.vehicleCardImageWrapper}>
          <Image
            resizeMode={hasVehicleImage ? "cover" : "contain"}
            source={imageSource}
            style={
              hasVehicleImage
                ? styles.vehicleCardImage
                : styles.vehicleCardPlaceholderImage
            }
          />
        </View>

        <View style={styles.vehicleInfo}>
          <Text numberOfLines={1} style={styles.vehicleName}>
            {displayName}
          </Text>
          <Text style={styles.vehiclePlate}>{vehicle.plate}</Text>
        </View>

        {renderBadge()}
      </TouchableOpacity>

      <VehicleDetailsModal
        onClose={() => setIsDetailsVisible(false)}
        vehicle={vehicle}
        visible={isDetailsVisible}
      />
    </>
  );
};
