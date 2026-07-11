import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { colors } from "../../constants/colors";
import { styles } from "../../styles/globalStyles";
import { NotificationType } from "../../constants/notifications";

type NotificationCardType = NotificationType | "created";

type Props = {
  title: string;
  message: string;
  date: string;
  type: NotificationCardType;
  read?: boolean;
  onPress?: () => void;
};

export const NotificationCard: React.FC<Props> = ({
  title,
  message,
  date,
  type,
  read = false,
  onPress,
}) => {
  const getNotificationStyle = () => {
    switch (type) {
      case "approved":
        return {
          icon: "✓",
          bg: colors.successSoft,
          color: colors.successText,
        };

      case "rejected":
        return {
          icon: "×",
          bg: colors.dangerSoft,
          color: colors.dangerText,
        };

      case "created":
        return {
          icon: "!",
          bg: colors.primarySoft,
          color: colors.primary,
        };
    }
  };

  const notificationStyle = getNotificationStyle();

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.notificationCard,
        read && {
          opacity: 0.62,
        },
      ]}
    >
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
