import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  FlatList,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import {
  Calendar,
  LocaleConfig,
  type DateData,
} from "react-native-calendars";

import { PageHeader } from "../../components/layout/PageHeader";
import { colors } from "../../constants/colors";
import {
  getVehicleDisplayName,
  vehicles,
  type Vehicle,
} from "../../constants/data";
import { SCREEN_PADDING } from "../../styles/globalStyles";

const ACTION_PRIMARY = colors.primary;
const CALENDAR_TEXT_PRIMARY = "#111827";
const CALENDAR_TEXT_SECONDARY = "#6B7280";
const CALENDAR_BORDER = "#E5E7EB";
const TIME_OPTION_HEIGHT = 44;
const TIME_LIST_HEIGHT = TIME_OPTION_HEIGHT * 5;
const HOURS = Array.from({ length: 24 }, (_, index) =>
  String(index).padStart(2, "0")
);
const MINUTES = Array.from({ length: 60 }, (_, index) =>
  String(index).padStart(2, "0")
);

type TimeTarget = "start" | "end";

type TimeOptionColumnProps = {
  title: string;
  data: string[];
  selectedValue: string;
  onSelect: (value: string) => void;
  listRef: React.RefObject<FlatList<string> | null>;
};

LocaleConfig.locales["pt-br"] = {
  monthNames: [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ],
  monthNamesShort: [
    "Jan",
    "Fev",
    "Mar",
    "Abr",
    "Mai",
    "Jun",
    "Jul",
    "Ago",
    "Set",
    "Out",
    "Nov",
    "Dez",
  ],
  dayNames: [
    "Domingo",
    "Segunda",
    "Terça",
    "Quarta",
    "Quinta",
    "Sexta",
    "Sábado",
  ],
  dayNamesShort: ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"],
  today: "Hoje",
};

LocaleConfig.defaultLocale = "pt-br";

const calendarTheme = {
  backgroundColor: "#FFFFFF",
  calendarBackground: "#FFFFFF",
  textSectionTitleColor: CALENDAR_TEXT_SECONDARY,
  selectedDayBackgroundColor: ACTION_PRIMARY,
  selectedDayTextColor: "#FFFFFF",
  todayTextColor: ACTION_PRIMARY,
  dayTextColor: CALENDAR_TEXT_PRIMARY,
  textDisabledColor: "#D1D5DB",
  arrowColor: ACTION_PRIMARY,
  monthTextColor: CALENDAR_TEXT_PRIMARY,
  textMonthFontWeight: "700" as const,
  textDayFontWeight: "500" as const,
  textDayHeaderFontWeight: "600" as const,
};

const getCalendarDateString = (value = new Date()) => {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const formatCalendarDate = (value: string) => {
  const [year, month, day] = value.split("-");

  if (!year || !month || !day) {
    return value;
  }

  return `${day.padStart(2, "0")}/${month.padStart(2, "0")}/${year}`;
};

const normalizeSearchValue = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9]/g, "");

const getTimeParts = (value?: string | null) => {
  if (value && /^\d{2}:\d{2}$/.test(value)) {
    const [hour, minute] = value.split(":");

    return { hour, minute };
  }

  return { hour: "08", minute: "00" };
};

const scrollTimeList = (
  listRef: React.RefObject<FlatList<string> | null>,
  data: string[],
  value: string,
  animated = true
) => {
  const index = Math.max(data.indexOf(value), 0);

  listRef.current?.scrollToOffset({
    offset: index * TIME_OPTION_HEIGHT,
    animated,
  });
};

function TimeOptionColumn({
  title,
  data,
  selectedValue,
  onSelect,
  listRef,
}: TimeOptionColumnProps) {
  const selectOption = (value: string) => {
    onSelect(value);
    scrollTimeList(listRef, data, value);
  };

  const handleScrollEnd = (
    event: NativeSyntheticEvent<NativeScrollEvent>
  ) => {
    const nextIndex = Math.max(
      0,
      Math.min(
        data.length - 1,
        Math.round(event.nativeEvent.contentOffset.y / TIME_OPTION_HEIGHT)
      )
    );

    onSelect(data[nextIndex]);
  };

  return (
    <View style={styles.timePickerColumn}>
      <Text style={styles.timePickerLabel}>{title}</Text>
      <View style={styles.timePickerBox}>
        <View style={styles.timePickerSelection} />
        <FlatList
          ref={listRef}
          data={data}
          keyExtractor={(item) => item}
          showsVerticalScrollIndicator={false}
          snapToInterval={TIME_OPTION_HEIGHT}
          decelerationRate="fast"
          contentContainerStyle={styles.timePickerListContent}
          getItemLayout={(_, index) => ({
            length: TIME_OPTION_HEIGHT,
            offset: TIME_OPTION_HEIGHT * index,
            index,
          })}
          onMomentumScrollEnd={handleScrollEnd}
          onScrollEndDrag={handleScrollEnd}
          renderItem={({ item }) => {
            const isSelected = item === selectedValue;

            return (
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => selectOption(item)}
                style={[
                  styles.timePickerItem,
                  isSelected && styles.timePickerSelectedItem,
                ]}
              >
                <Text
                  style={[
                    styles.timePickerItemText,
                    isSelected && styles.timePickerSelectedText,
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>
    </View>
  );
};

export default function MakeRequest() {
  const [date, setDate] = useState<string | null>(null);
  const [selectedDateString, setSelectedDateString] = useState<string | null>(
    null
  );
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [timeTarget, setTimeTarget] = useState<TimeTarget | null>(null);
  const [tempHour, setTempHour] = useState("08");
  const [tempMinute, setTempMinute] = useState("00");
  const [destination, setDestination] = useState("");
  const [reason, setReason] = useState("");
  const [vehicleSearch, setVehicleSearch] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [showVehicleOptions, setShowVehicleOptions] = useState(false);
  const hourListRef = useRef<FlatList<string>>(null);
  const minuteListRef = useRef<FlatList<string>>(null);
  const wasTimeModalVisible = useRef(false);

  const filteredVehicles = vehicles.filter((vehicle) => {
    const search = vehicleSearch.trim().toLowerCase();
    const normalizedSearch = normalizeSearchValue(vehicleSearch);

    if (!search) {
      return true;
    }

    const displayName = getVehicleDisplayName(vehicle).toLowerCase();
    const name = vehicle.name?.toLowerCase() ?? "";
    const model = vehicle.model?.toLowerCase() ?? "";
    const plate = vehicle.plate.toLowerCase();
    const normalizedPlate = normalizeSearchValue(vehicle.plate);
    const normalizedVehicleText = normalizeSearchValue(
      `${displayName} ${name} ${model} ${plate}`
    );

    return (
      displayName.includes(search) ||
      name.includes(search) ||
      model.includes(search) ||
      plate.includes(search) ||
      normalizedPlate.includes(normalizedSearch) ||
      normalizedVehicleText.includes(normalizedSearch)
    );
  });

  const currentCalendarDate =
    selectedDateString ?? date ?? getCalendarDateString();
  const markedDates = selectedDateString
    ? {
        [selectedDateString]: {
          selected: true,
          selectedColor: ACTION_PRIMARY,
          selectedTextColor: "#FFFFFF",
        },
      }
    : {};

  const openDatePicker = () => {
    setSelectedDateString(date ?? getCalendarDateString());
    setShowDatePicker(true);
  };

  useEffect(() => {
    if (showTimeModal && !wasTimeModalVisible.current) {
      const timeout = setTimeout(() => {
        scrollTimeList(hourListRef, HOURS, tempHour, false);
        scrollTimeList(minuteListRef, MINUTES, tempMinute, false);
      }, 80);

      wasTimeModalVisible.current = showTimeModal;

      return () => clearTimeout(timeout);
    }

    wasTimeModalVisible.current = showTimeModal;
  }, [showTimeModal, tempHour, tempMinute]);

  const cancelDateSelection = () => {
    setSelectedDateString(date);
    setShowDatePicker(false);
  };

  const confirmDateSelection = () => {
    if (selectedDateString) {
      setDate(selectedDateString);
    }

    setShowDatePicker(false);
  };

  const openTimePicker = (target: TimeTarget) => {
    const selectedTime = target === "start" ? startTime : endTime;
    const { hour, minute } = getTimeParts(selectedTime);

    setTimeTarget(target);
    setTempHour(hour);
    setTempMinute(minute);
    setShowTimeModal(true);
  };

  const cancelTimeSelection = () => {
    setShowTimeModal(false);
    setTimeTarget(null);
  };

  const confirmTimeSelection = () => {
    const selectedTime = `${tempHour}:${tempMinute}`;

    if (timeTarget === "start") {
      setStartTime(selectedTime);
    }

    if (timeTarget === "end") {
      setEndTime(selectedTime);
    }

    cancelTimeSelection();
  };

  const selectVehicle = (vehicle: Vehicle) => {
    const displayName = getVehicleDisplayName(vehicle);

    setSelectedVehicle(vehicle);
    setVehicleSearch(`${displayName} — ${vehicle.plate}`);
    setShowVehicleOptions(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <PageHeader
        title="Nova solicitação"
        subtitle="Preencha os dados da viagem"
        showBackButton
        onBackPress={() => router.back()}
      />

      <ScrollView
        contentContainerStyle={styles.body}
        keyboardShouldPersistTaps="handled"
      >
        {/* DATA */}
        <Text style={styles.label}>Data de uso</Text>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={openDatePicker}
          style={[styles.input, styles.pickerInput]}
        >
          <Text
            style={[
              styles.pickerText,
              !date && styles.pickerPlaceholderText,
            ]}
          >
            {date ? formatCalendarDate(date) : "dd/mm/aaaa"}
          </Text>
        </TouchableOpacity>
        <Modal
          visible={showDatePicker}
          transparent
          animationType="fade"
          onRequestClose={cancelDateSelection}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.calendarCard}>
              <Text style={styles.modalTitle}>Selecionar data</Text>
              <Calendar
                current={currentCalendarDate}
                initialDate={currentCalendarDate}
                monthFormat="MMMM yyyy"
                firstDay={0}
                hideExtraDays
                enableSwipeMonths
                markedDates={markedDates}
                onDayPress={(day: DateData) =>
                  setSelectedDateString(day.dateString)
                }
                theme={calendarTheme}
                style={styles.calendar}
              />

              <View style={styles.modalActions}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={[styles.modalButton, styles.modalCancelButton]}
                  onPress={cancelDateSelection}
                >
                  <Text style={styles.modalCancelText}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.8}
                  style={[styles.modalButton, styles.modalConfirmButton]}
                  onPress={confirmDateSelection}
                >
                  <Text style={styles.modalConfirmText}>OK</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* HORÁRIOS */}
        <View style={styles.row}>
          <View style={styles.flex}>
            <Text style={styles.label}>Início</Text>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => openTimePicker("start")}
              style={[styles.input, styles.pickerInput]}
            >
              <Text
                style={[
                  styles.pickerText,
                  !startTime && styles.pickerPlaceholderText,
                ]}
              >
                {startTime || "--:--"}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.flex}>
            <Text style={styles.label}>Término previsto</Text>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => openTimePicker("end")}
              style={[styles.input, styles.pickerInput]}
            >
              <Text
                style={[
                  styles.pickerText,
                  !endTime && styles.pickerPlaceholderText,
                ]}
              >
                {endTime || "--:--"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <Modal
          visible={showTimeModal}
          transparent
          animationType="fade"
          onRequestClose={cancelTimeSelection}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.calendarCard, styles.timeCard]}>
              <Text style={styles.modalTitle}>Selecionar horário</Text>

              <View style={styles.timePickerRow}>
                <TimeOptionColumn
                  title="Horas"
                  data={HOURS}
                  selectedValue={tempHour}
                  onSelect={setTempHour}
                  listRef={hourListRef}
                />

                <Text style={styles.timeSeparator}>:</Text>

                <TimeOptionColumn
                  title="Minutos"
                  data={MINUTES}
                  selectedValue={tempMinute}
                  onSelect={setTempMinute}
                  listRef={minuteListRef}
                />
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={[styles.modalButton, styles.modalCancelButton]}
                  onPress={cancelTimeSelection}
                >
                  <Text style={styles.modalCancelText}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.8}
                  style={[styles.modalButton, styles.modalConfirmButton]}
                  onPress={confirmTimeSelection}
                >
                  <Text style={styles.modalConfirmText}>OK</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* VEÍCULO */}
        <Text style={styles.label}>Veículo</Text>
        <View style={styles.vehicleSelectWrapper}>
          <TextInput
            value={vehicleSearch}
            onChangeText={(value) => {
              setVehicleSearch(value);
              setSelectedVehicle(null);
              setShowVehicleOptions(true);
            }}
            onFocus={() => setShowVehicleOptions(true)}
            placeholder="Digite modelo ou placa"
            style={styles.input}
            placeholderTextColor={colors.textMuted}
          />

          {showVehicleOptions && (
            <View style={styles.vehicleOptionsCard}>
              {filteredVehicles.length > 0 ? (
                filteredVehicles.map((vehicle) => {
                  const displayName = getVehicleDisplayName(vehicle);

                  return (
                    <TouchableOpacity
                      activeOpacity={0.85}
                      key={vehicle.id}
                      onPress={() => selectVehicle(vehicle)}
                      style={styles.vehicleOption}
                    >
                      <Text style={styles.vehicleOptionName}>
                        {displayName}
                      </Text>
                      <Text style={styles.vehicleOptionPlate}>
                        {vehicle.plate}
                      </Text>
                    </TouchableOpacity>
                  );
                })
              ) : (
                <Text style={styles.vehicleOptionEmpty}>
                  Nenhum veículo encontrado
                </Text>
              )}
            </View>
          )}
        </View>

        {/* DESTINO */}
        <Text style={styles.label}>Destino</Text>
        <TextInput
          placeholder="Local de destino"
          value={destination}
          onChangeText={setDestination}
          style={styles.input}
          placeholderTextColor={colors.textMuted}
        />

        {/* FINALIDADE */}
        <Text style={styles.label}>Finalidade</Text>
        <TextInput
          placeholder="Motivo da solicitação"
          value={reason}
          onChangeText={setReason}
          style={[styles.input, styles.textArea]}
          multiline
          placeholderTextColor={colors.textMuted}
        />

        {/* BOTÕES */}
        <View style={styles.buttons}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={() => router.back()}
          >
            <Text style={styles.cancelText}>Cancelar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.saveButton]}
            onPress={() => {
              console.log({
                date: date ? formatCalendarDate(date) : "",
                start: startTime,
                end: endTime,
                destination,
                reason,
                vehicle: selectedVehicle
                  ? {
                      id: selectedVehicle.id,
                      model: getVehicleDisplayName(selectedVehicle),
                      plate: selectedVehicle.plate,
                    }
                  : null,
              });
            }}
          >
            <Text style={styles.saveText}>Salvar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  body: {
    paddingHorizontal: SCREEN_PADDING,
    paddingTop: 20,
    paddingBottom: 28,
  },

  label: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 6,
    marginTop: 12,
    color: colors.textSecondary,
  },

  input: {
    minHeight: 52,
    backgroundColor: colors.surface,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.textPrimary,
    fontSize: 15,
  },

  pickerInput: {
    justifyContent: "center",
  },

  pickerText: {
    color: colors.textPrimary,
    fontSize: 15,
  },

  pickerPlaceholderText: {
    color: colors.textMuted,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(17, 24, 39, 0.55)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 22,
  },

  calendarCard: {
    width: "100%",
    maxWidth: 390,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 16,
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 10,
  },

  modalTitle: {
    color: CALENDAR_TEXT_PRIMARY,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
  },

  calendar: {
    borderRadius: 14,
  },

  timeCard: {
    maxWidth: 360,
    paddingHorizontal: 20,
    paddingTop: 20,
  },

  timePickerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },

  timePickerColumn: {
    flex: 1,
  },

  timePickerLabel: {
    color: CALENDAR_TEXT_SECONDARY,
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
  },

  timePickerBox: {
    height: TIME_LIST_HEIGHT,
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: CALENDAR_BORDER,
    justifyContent: "center",
    overflow: "hidden",
  },

  timePickerSelection: {
    position: "absolute",
    left: 8,
    right: 8,
    top: (TIME_LIST_HEIGHT - TIME_OPTION_HEIGHT) / 2,
    height: TIME_OPTION_HEIGHT,
    borderRadius: 12,
    backgroundColor: "#E8EEF5",
    borderWidth: 1,
    borderColor: "#D8E0EA",
  },

  timePickerListContent: {
    paddingVertical: TIME_OPTION_HEIGHT * 2,
  },

  timePickerItem: {
    height: TIME_OPTION_HEIGHT,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 8,
  },

  timePickerSelectedItem: {
    backgroundColor: ACTION_PRIMARY,
  },

  timePickerItemText: {
    color: CALENDAR_TEXT_PRIMARY,
    fontSize: 24,
    fontWeight: "700",
  },

  timePickerSelectedText: {
    color: "#FFFFFF",
  },

  timeSeparator: {
    width: 28,
    color: ACTION_PRIMARY,
    fontSize: 32,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 28,
  },

  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: CALENDAR_BORDER,
  },

  modalButton: {
    minWidth: 104,
    minHeight: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },

  modalCancelButton: {
    backgroundColor: "#F3F4F6",
  },

  modalConfirmButton: {
    backgroundColor: ACTION_PRIMARY,
  },

  modalCancelText: {
    color: CALENDAR_TEXT_PRIMARY,
    fontSize: 15,
    fontWeight: "700",
  },

  modalConfirmText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },

  textArea: {
    height: 100,
    textAlignVertical: "top",
  },

  vehicleSelectWrapper: {
    position: "relative",
    zIndex: 2,
  },

  vehicleOptionsCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: 8,
    overflow: "hidden",
    shadowColor: "#0D1B2A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },

  vehicleOption: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },

  vehicleOptionName: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: "700",
  },

  vehicleOptionPlate: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },

  vehicleOptionEmpty: {
    color: colors.textSecondary,
    fontSize: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },

  row: {
    flexDirection: "row",
    gap: 12,
  },

  flex: {
    flex: 1,
  },

  buttons: {
    flexDirection: "row",
    marginTop: 24,
    gap: 12,
  },

  button: {
    flex: 1,
    minHeight: 52,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },

  cancelButton: {
    backgroundColor: "#E5E7EB",
  },

  saveButton: {
    backgroundColor: ACTION_PRIMARY,
  },

  cancelText: {
    color: colors.textPrimary,
    fontWeight: "700",
    fontSize: 15,
  },

  saveText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
  },
});
