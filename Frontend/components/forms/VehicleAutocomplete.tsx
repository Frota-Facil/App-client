import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { colors } from "../../constants/colors";
import {
  getVehicleDisplayName,
  getVehicleStatusMeta,
  type Vehicle,
} from "../../constants/data";

type VehicleAutocompleteProps = {
  disabled?: boolean;
  hasError?: boolean;
  isLoading?: boolean;
  emptyMessage?: string;
  onClearSelection: () => void;
  onSelect: (vehicle: Vehicle) => void;
  placeholder?: string;
  selectedVehicle: Vehicle | null;
  vehicles: Vehicle[];
};

const getVehicleAutocompleteLabel = (vehicle: Vehicle) =>
  `${getVehicleDisplayName(vehicle)} - ${vehicle.plate}`;

const normalizeSearchText = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLocaleLowerCase("pt-BR");

export function VehicleAutocomplete({
  disabled = false,
  hasError = false,
  isLoading = false,
  emptyMessage = "Nenhum veículo disponível no momento.",
  onClearSelection,
  onSelect,
  placeholder = "Digite modelo ou placa",
  selectedVehicle,
  vehicles,
}: VehicleAutocompleteProps) {
  const inputRef = useRef<TextInput | null>(null);
  const blurTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (selectedVehicle) {
      setInputValue(getVehicleAutocompleteLabel(selectedVehicle));
    }
  }, [selectedVehicle]);

  useEffect(() => {
    return () => {
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current);
      }
    };
  }, []);

  const filteredVehicles = useMemo(() => {
    const normalizedInput = normalizeSearchText(inputValue);

    if (!normalizedInput) {
      return vehicles;
    }

    return vehicles.filter((vehicle) => {
      const displayName = getVehicleDisplayName(vehicle);
      const searchableFields = [
        displayName,
        vehicle.plate,
        getVehicleAutocompleteLabel(vehicle),
      ];

      return searchableFields.some((field) =>
        normalizeSearchText(field).includes(normalizedInput)
      );
    });
  }, [inputValue, vehicles]);

  const shouldShowSuggestions = isFocused && !disabled && !isLoading;
  const showClearButton = Boolean(inputValue) && !disabled && !isLoading;

  function clearBlurTimeout() {
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
      blurTimeoutRef.current = null;
    }
  }

  function handleFocus() {
    clearBlurTimeout();
    setIsFocused(true);
  }

  function handleBlur() {
    clearBlurTimeout();
    blurTimeoutRef.current = setTimeout(() => {
      setIsFocused(false);
    }, 120);
  }

  function handleChangeText(value: string) {
    setInputValue(value);
    setIsFocused(true);
    onClearSelection();
  }

  function handleClear() {
    clearBlurTimeout();
    setInputValue("");
    setIsFocused(true);
    onClearSelection();
    inputRef.current?.focus();
  }

  function handleSelect(vehicle: Vehicle) {
    clearBlurTimeout();
    setInputValue(getVehicleAutocompleteLabel(vehicle));
    setIsFocused(false);
    onSelect(vehicle);
    Keyboard.dismiss();
  }

  return (
    <View style={styles.wrapper}>
      <View
        style={[
          styles.inputWrapper,
          shouldShowSuggestions && styles.inputWrapperOpen,
          hasError && styles.inputWrapperError,
          disabled && styles.inputWrapperDisabled,
        ]}
      >
        <TextInput
          ref={inputRef}
          autoCapitalize="none"
          autoCorrect={false}
          editable={!disabled && !isLoading}
          onBlur={handleBlur}
          onChangeText={handleChangeText}
          onFocus={handleFocus}
          placeholder={isLoading ? "Carregando veículos..." : placeholder}
          placeholderTextColor={colors.textMuted}
          selectionColor={colors.primary}
          style={styles.input}
          value={inputValue}
        />

        {isLoading ? (
          <ActivityIndicator color={colors.primary} size="small" />
        ) : null}

        {showClearButton ? (
          <TouchableOpacity
            accessibilityLabel="Limpar veículo selecionado"
            activeOpacity={0.75}
            onPress={handleClear}
            style={styles.clearButton}
          >
            <Text style={styles.clearButtonText}>×</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {shouldShowSuggestions ? (
        <View style={[styles.suggestions, hasError && styles.suggestionsError]}>
          {vehicles.length === 0 ? (
            <Text style={styles.emptyText}>{emptyMessage}</Text>
          ) : filteredVehicles.length === 0 ? (
            <Text style={styles.emptyText}>
              Nenhum veículo disponível encontrado.
            </Text>
          ) : (
            <ScrollView
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled
              style={styles.suggestionsList}
            >
              {filteredVehicles.map((vehicle, index) => {
                const isSelected =
                  selectedVehicle &&
                  String(selectedVehicle.id) === String(vehicle.id);
                const isLast = index === filteredVehicles.length - 1;
                const status = getVehicleStatusMeta(vehicle.status);

                return (
                  <TouchableOpacity
                    activeOpacity={0.85}
                    key={String(vehicle.id)}
                    onPress={() => handleSelect(vehicle)}
                    style={[
                      styles.option,
                      isLast && styles.optionLast,
                      isSelected && styles.optionSelected,
                    ]}
                  >
                    <View style={styles.optionTextGroup}>
                      <Text numberOfLines={1} style={styles.optionName}>
                        {getVehicleDisplayName(vehicle)}
                      </Text>
                      <View style={styles.optionMetaRow}>
                        <Text style={styles.optionPlate}>{vehicle.plate}</Text>
                        <View
                          style={[
                            styles.optionStatusBadge,
                            { backgroundColor: status.bg },
                          ]}
                        >
                          <Text
                            style={[
                              styles.optionStatusText,
                              { color: status.color },
                            ]}
                          >
                            {status.label}
                          </Text>
                        </View>
                      </View>
                    </View>

                    {isSelected ? (
                      <Text style={styles.selectedIndicator}>
                        Selecionado
                      </Text>
                    ) : null}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "relative",
    zIndex: 2,
  },

  inputWrapper: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
    minHeight: 52,
    paddingHorizontal: 14,
  },

  inputWrapperOpen: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },

  inputWrapperError: {
    borderColor: colors.danger,
  },

  inputWrapperDisabled: {
    opacity: 0.7,
  },

  input: {
    color: colors.textPrimary,
    flex: 1,
    fontSize: 15,
    minHeight: 50,
    paddingVertical: 12,
  },

  clearButton: {
    alignItems: "center",
    backgroundColor: "#EEF2F7",
    borderRadius: 12,
    height: 28,
    justifyContent: "center",
    width: 28,
  },

  clearButtonText: {
    color: colors.textSecondary,
    fontSize: 20,
    fontWeight: "700",
    lineHeight: 22,
  },

  suggestions: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    borderWidth: 1,
    borderTopWidth: 0,
    marginTop: 0,
    overflow: "hidden",
    shadowOpacity: 0,
    elevation: 0,
  },

  suggestionsError: {
    borderColor: colors.danger,
  },

  suggestionsList: {
    maxHeight: 228,
  },

  option: {
    alignItems: "center",
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
    minHeight: 62,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },

  optionLast: {
    borderBottomWidth: 0,
  },

  optionSelected: {
    backgroundColor: "#E8EEF5",
  },

  optionTextGroup: {
    flex: 1,
    minWidth: 0,
  },

  optionName: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: "700",
  },

  optionPlate: {
    color: colors.textSecondary,
    fontSize: 13,
  },

  optionMetaRow: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 3,
  },

  optionStatusBadge: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },

  optionStatusText: {
    fontSize: 11,
    fontWeight: "700",
  },

  selectedIndicator: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "700",
  },

  emptyText: {
    color: colors.textSecondary,
    fontSize: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
});
