import React from "react";
import {
  Image,
  ImageSourcePropType,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { SCREEN_PADDING } from "../../styles/globalStyles";

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  leftIcon?: React.ReactNode;
  leftIconSource?: ImageSourcePropType;
  rightText?: string;
  rightIcon?: React.ReactNode;
  rightIconSource?: ImageSourcePropType;
  rightContent?: React.ReactNode;
  onBackPress?: () => void;
  onRightPress?: () => void;
  style?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  rightTextStyle?: StyleProp<TextStyle>;
};

const defaultBackIcon = require("../../assets/images/seta-esquerda.png");

export function PageHeader({
  title,
  subtitle,
  showBackButton,
  leftIcon,
  leftIconSource,
  rightText,
  rightIcon,
  rightIconSource,
  rightContent,
  onBackPress,
  onRightPress,
  style,
  titleStyle,
  rightTextStyle,
}: PageHeaderProps) {
  const shouldShowLeftAction = showBackButton || leftIcon || leftIconSource;
  const shouldShowRightAction =
    Boolean(rightContent) ||
    Boolean(rightText) ||
    Boolean(rightIcon) ||
    Boolean(rightIconSource);

  const renderLeftIcon = () => {
    if (leftIcon) {
      return leftIcon;
    }

    if (leftIconSource || showBackButton) {
      return (
        <Image source={leftIconSource || defaultBackIcon} style={styles.icon} />
      );
    }

    return null;
  };

  const renderRightAction = () => {
    if (rightContent) {
      return rightContent;
    }

    if (!shouldShowRightAction) {
      return null;
    }

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        disabled={!onRightPress}
        onPress={onRightPress}
        style={styles.rightButton}
      >
        {rightIcon}

        {rightIconSource && (
          <Image source={rightIconSource} style={styles.rightIcon} />
        )}

        {rightText && (
          <Text style={[styles.rightText, rightTextStyle]}>{rightText}</Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.leftArea}>
        {shouldShowLeftAction && (
          <TouchableOpacity
            activeOpacity={0.7}
            disabled={!onBackPress}
            onPress={onBackPress}
            style={styles.leftButton}
          >
            {renderLeftIcon()}
          </TouchableOpacity>
        )}

        <View style={styles.titleArea}>
          <Text style={[styles.title, titleStyle]} numberOfLines={1}>
            {title}
          </Text>

          {subtitle && (
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.rightArea}>{renderRightAction()}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 76,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: SCREEN_PADDING,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },

  leftArea: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
  },

  leftButton: {
    width: 34,
    height: 44,
    justifyContent: "center",
    alignItems: "flex-start",
    marginRight: 8,
  },

  icon: {
    width: 20,
    height: 20,
  },

  titleArea: {
    flex: 1,
    minWidth: 0,
  },

  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },

  subtitle: {
    marginTop: 2,
    fontSize: 12,
    color: "#6B7280",
  },

  rightArea: {
    minWidth: 40,
    marginLeft: 12,
    alignItems: "flex-end",
    justifyContent: "center",
  },

  rightButton: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  rightIcon: {
    width: 20,
    height: 20,
    marginRight: 6,
  },

  rightText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#075985",
  },
});
