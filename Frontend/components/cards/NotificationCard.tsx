import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { styles } from "../../styles/globalStyles";
import { NotificationType } from "../../constants/notifications";

type Props = {
  title: string;
  message: string;
  date: string;
  type: NotificationType;
};

export const NotificationCard: React.FC<Props> = ({
  title,
  message,
  date,
  type,
}) => {
  const getNotificationStyle = () => {
    switch (type) {
      case "approved":
        return {
          icon: "✓",
          bg: "#DFF7EA",
          color: "#16A34A",
        };

      case "rejected":
        return {
          icon: "×",
          bg: "#FEE2E2",
          color: "#DC2626",
        };
    }
  };

  const notificationStyle = getNotificationStyle();

  return (
    <TouchableOpacity style={styles.notificationCard}>
      <View
        style={[
          styles.notificationIconWrapper,
          { backgroundColor: notificationStyle.bg },
        ]}
      >
        <Text
          style={[
            styles.notificationIconText,
            { color: notificationStyle.color },
          ]}
        >
          {notificationStyle.icon}
        </Text>
      </View>

      <View style={styles.notificationContent}>
        <Text style={styles.notificationTitle}>{title}</Text>
        <Text style={styles.notificationMessage}>{message}</Text>
        <Text style={styles.notificationDate}>{date}</Text>
      </View>
    </TouchableOpacity>
  );
};
