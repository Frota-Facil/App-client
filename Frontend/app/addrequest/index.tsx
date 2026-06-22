import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
import { getVehicleDisplayName, type Vehicle } from "../../constants/data";
import { useAuth } from "../../contexts/AuthContext";
import {
  createMyRequest,
  RequestRequestError,
} from "../../services/requests";
import { getVehicles, VehicleRequestError } from "../../services/vehicles";
import { baseCard, SCREEN_PADDING } from "../../styles/globalStyles";

const ACTION_PRIMARY = colors.primary;
const CALENDAR_TEXT_PRIMARY = "#111827";
const CALENDAR_TEXT_SECONDARY = "#6B7280";
const CALENDAR_BORDER = "#E5E7EB";
const TIME_OPTION_HEIGHT = 44;
const TIME_LIST_HEIGHT = TIME_OPTION_HEIGHT * 5;
const TIME_PICKER_REPEAT_COUNT = 21;
const TIME_PICKER_MIDDLE_REPEAT_INDEX = Math.floor(
  TIME_PICKER_REPEAT_COUNT / 2
);
const HOURS = Array.from({ length: 24 }, (_, index) =>
  String(index).padStart(2, "0")
);
const MINUTES = Array.from({ length: 60 }, (_, index) =>
  String(index).padStart(2, "0")
);
const buildInfiniteTimeOptions = (options: string[]) =>
  Array.from({ length: TIME_PICKER_REPEAT_COUNT }, () => options).flat();
const INFINITE_HOURS = buildInfiniteTimeOptions(HOURS);
const INFINITE_MINUTES = buildInfiniteTimeOptions(MINUTES);

type TimeTarget = "start" | "end";

type TimeOptionColumnProps = {
  title: string;
  options: string[];
  infiniteOptions: string[];
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

const buildRequestDate = (date: string, time: string) => {
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);

  return new Date(year, month - 1, day, hour, minute, 0, 0);
};

const isScheduleConflict = (message: string) => {
  const normalizedMessage = message.toLowerCase();

  return (
    normalizedMessage.includes("agendado") ||
    normalizedMessage.includes("conflit") ||
    normalizedMessage.includes("já possui solicitação")
  );
};

const getCreateErrorMessage = (error: unknown) => {
  if (!(error instanceof RequestRequestError)) {
    return "Não foi possível salvar a solicitação.";
  }

  if (error.isConnectionError) {
    return "Não foi possível conectar ao servidor.";
  }

  if (error.status === 403) {
    return "Você não tem permissão para realizar esta ação.";
  }

  if (error.status === 409 || isScheduleConflict(error.message)) {
    return "Este veículo já possui solicitação nesse horário.";
  }

  if (error.status === 400) {
    return error.message;
  }

  return "Não foi possível salvar a solicitação.";
};

const getTimeParts = (value?: string | null) => {
  if (value && /^\d{2}:\d{2}$/.test(value)) {
    const [hour, minute] = value.split(":");

    return { hour, minute };
  }

  return { hour: "08", minute: "00" };
};

const getTimeOptionIndex = (options: string[], value: string) => {
  const optionIndex = options.indexOf(value);

  return (
    TIME_PICKER_MIDDLE_REPEAT_INDEX * options.length +
    Math.max(optionIndex, 0)
  );
};

const getRealTimeOption = (options: string[], index: number) =>
  options[((index % options.length) + options.length) % options.length];

const scrollTimeList = (
  listRef: React.RefObject<FlatList<string> | null>,
  options: string[],
  value: string,
  animated = true
) => {
  const index = getTimeOptionIndex(options, value);

  listRef.current?.scrollToOffset({
    offset: index * TIME_OPTION_HEIGHT,
    animated,
  });
};

function TimeOptionColumn({
  title,
  options,
  infiniteOptions,
  selectedValue,
  onSelect,
  listRef,
}: TimeOptionColumnProps) {
  const selectOption = (value: string) => {
    onSelect(value);
    scrollTimeList(listRef, options, value);
  };

  const handleScrollEnd = (
    event: NativeSyntheticEvent<NativeScrollEvent>
  ) => {
    const nextIndex = Math.max(
      0,
      Math.min(
        infiniteOptions.length - 1,
        Math.round(event.nativeEvent.contentOffset.y / TIME_OPTION_HEIGHT)
      )
    );
    const realValue = getRealTimeOption(options, nextIndex);
    const shouldRecenter =
      nextIndex < options.length * 2 ||
      nextIndex > infiniteOptions.length - options.length * 2;

    onSelect(realValue);

    if (shouldRecenter) {
      scrollTimeList(listRef, options, realValue, false);
    }
  };
  const initialScrollIndex = getTimeOptionIndex(options, selectedValue);

  return (
    <View style={styles.timePickerColumn}>
      <Text style={styles.timePickerLabel}>{title}</Text>
      <View style={styles.timePickerBox}>
        <View style={styles.timePickerSelection} />
        <FlatList
          ref={listRef}
          data={infiniteOptions}
          keyExtractor={(item, index) => `${item}-${index}`}
          showsVerticalScrollIndicator={false}
          initialScrollIndex={initialScrollIndex}
          snapToInterval={TIME_OPTION_HEIGHT}
          decelerationRate="fast"
          contentContainerStyle={styles.timePickerListContent}
          extraData={selectedValue}
          getItemLayout={(_, index) => ({
            length: TIME_OPTION_HEIGHT,
            offset: TIME_OPTION_HEIGHT * index,
            index,
          })}
          onScrollToIndexFailed={({ index }) => {
            listRef.current?.scrollToOffset({
              offset: index * TIME_OPTION_HEIGHT,
              animated: false,
            });
          }}
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
  const { signOut, token } = useAuth();
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
  const [fleetVehicles, setFleetVehicles] = useState<Vehicle[]>([]);
  const [isLoadingVehicles, setIsLoadingVehicles] = useState(true);
  const [vehicleError, setVehicleError] = useState("");
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showVehicleOptions, setShowVehicleOptions] = useState(false);
  const hourListRef = useRef<FlatList<string>>(null);
  const minuteListRef = useRef<FlatList<string>>(null);
  const wasTimeModalVisible = useRef(false);

  const filteredVehicles = fleetVehicles.filter((vehicle) => {
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

  useEffect(() => {
    let isCurrent = true;

    const loadVehicles = async () => {
      if (!token) {
        setFleetVehicles([]);
        setIsLoadingVehicles(false);
        router.replace("/");
        return;
      }

      setIsLoadingVehicles(true);
      setVehicleError("");

      try {
        const nextVehicles = await getVehicles(token);

        if (isCurrent) {
          setFleetVehicles(nextVehicles);
        }
      } catch (error) {
        if (error instanceof VehicleRequestError && error.status === 401) {
          await signOut();
          return;
        }

        if (!isCurrent) {
          return;
        }

        if (error instanceof VehicleRequestError) {
          if (error.status === 403) {
            setVehicleError(
              "Você não tem permissão para realizar esta ação."
            );
            return;
          }

          if (error.isConnectionError) {
            setVehicleError("Não foi possível conectar ao servidor.");
            return;
          }
        }

        setVehicleError("Não foi possível carregar os veículos.");
      } finally {
        if (isCurrent) {
          setIsLoadingVehicles(false);
        }
      }
    };

    void loadVehicles();

    return () => {
      isCurrent = false;
    };
  }, [signOut, token]);

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
    setFormError("");
  };

  const handleSave = async () => {
    if (isSubmitting) {
      return;
    }

    setFormError("");

    const trimmedDestination = destination.trim();
    const trimmedReason = reason.trim();

    if (
      !date ||
      !startTime ||
      !endTime ||
      !selectedVehicle ||
      !trimmedDestination ||
      !trimmedReason
    ) {
      setFormError("Preencha todos os campos obrigatórios.");
      return;
    }

    const predictedStartDate = buildRequestDate(date, startTime);
    const predictedEndDate = buildRequestDate(date, endTime);

    if (
      Number.isNaN(predictedStartDate.getTime()) ||
      Number.isNaN(predictedEndDate.getTime())
    ) {
      setFormError("Informe uma data e horários válidos.");
      return;
    }

    if (predictedEndDate <= predictedStartDate) {
      setFormError("O término previsto deve ser maior que o início.");
      return;
    }

    if (!token) {
      router.replace("/");
      return;
    }

    setIsSubmitting(true);

    try {
      await createMyRequest(token, {
        vehicleId: String(selectedVehicle.id),
        predictedStartDate: predictedStartDate.toISOString(),
        predictedEndDate: predictedEndDate.toISOString(),
        destination: trimmedDestination,
        reason: trimmedReason,
      });

      Alert.alert("Solicitação criada", "Sua solicitação foi enviada com sucesso.");
      router.replace("/solicitacoes");
    } catch (error) {
      if (error instanceof RequestRequestError && error.status === 401) {
        await signOut();
        return;
      }

      setFormError(getCreateErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
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
                  options={HOURS}
                  infiniteOptions={INFINITE_HOURS}
                  selectedValue={tempHour}
                  onSelect={setTempHour}
                  listRef={hourListRef}
                />

                <Text style={styles.timeSeparator}>:</Text>

                <TimeOptionColumn
                  title="Minutos"
                  options={MINUTES}
                  infiniteOptions={INFINITE_MINUTES}
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
              setFormError("");
            }}
            onFocus={() => {
              if (!isLoadingVehicles && !vehicleError) {
                setShowVehicleOptions(true);
              }
            }}
            editable={!isLoadingVehicles && !vehicleError}
            placeholder={
              isLoadingVehicles ? "Carregando veículos..." : "Digite modelo ou placa"
            }
            style={styles.input}
            placeholderTextColor={colors.textMuted}
          />

          {isLoadingVehicles && (
            <View style={styles.vehicleLoading}>
              <ActivityIndicator color={colors.primary} size="small" />
              <Text style={styles.vehicleLoadingText}>Carregando veículos...</Text>
            </View>
          )}

          {vehicleError ? (
            <Text style={styles.fieldError}>{vehicleError}</Text>
          ) : null}

          {showVehicleOptions && !isLoadingVehicles && !vehicleError && (
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
          onChangeText={(value) => {
            setDestination(value);
            setFormError("");
          }}
          style={styles.input}
          placeholderTextColor={colors.textMuted}
        />

        {/* FINALIDADE */}
        <Text style={styles.label}>Finalidade</Text>
        <TextInput
          placeholder="Motivo da solicitação"
          value={reason}
          onChangeText={(value) => {
            setReason(value);
            setFormError("");
          }}
          style={[styles.input, styles.textArea]}
          multiline
          placeholderTextColor={colors.textMuted}
        />

        {formError ? <Text style={styles.formError}>{formError}</Text> : null}

        {/* BOTÕES */}
        <View style={styles.buttons}>
          <TouchableOpacity
            disabled={isSubmitting}
            style={[
              styles.button,
              styles.cancelButton,
              isSubmitting && styles.disabledButton,
            ]}
            onPress={() => router.back()}
          >
            <Text style={styles.cancelText}>Cancelar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            disabled={isSubmitting || isLoadingVehicles || Boolean(vehicleError)}
            style={[
              styles.button,
              styles.saveButton,
              (isSubmitting || isLoadingVehicles || Boolean(vehicleError)) &&
                styles.disabledButton,
            ]}
            onPress={handleSave}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.saveText}>Salvar</Text>
            )}
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
    ...baseCard,
    marginTop: 8,
    padding: 0,
    overflow: "hidden",
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

  vehicleLoading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },

  vehicleLoadingText: {
    color: colors.textSecondary,
    fontSize: 13,
  },

  fieldError: {
    color: colors.danger,
    fontSize: 13,
    fontWeight: "600",
    marginTop: 8,
  },

  formError: {
    color: colors.danger,
    fontSize: 13,
    fontWeight: "600",
    marginTop: 14,
    textAlign: "center",
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

  disabledButton: {
    opacity: 0.6,
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
