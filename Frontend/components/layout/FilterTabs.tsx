import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

import { styles } from "../../styles/globalStyles";

type FilterTabsProps<T extends string> = {
  options: T[];
  value: T;
  onChange: (value: T) => void;
};

export function FilterTabs<T extends string>({
  options,
  value,
  onChange,
}: FilterTabsProps<T>) {
  return (
    <View style={styles.notificationFiltersArea}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.notificationFiltersContent}
      >
        {options.map((item) => {
          const isActive = value === item;

          return (
            <TouchableOpacity
              key={item}
              onPress={() => onChange(item)}
              style={[
                styles.notificationFilterButton,
                isActive && styles.notificationFilterButtonActive,
              ]}
            >
              <Text
                style={[
                  styles.notificationFilterText,
                  isActive && styles.notificationFilterTextActive,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}
