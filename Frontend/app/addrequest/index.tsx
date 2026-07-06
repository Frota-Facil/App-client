import React, { useCallback, useEffect, useRef, useState } from "react";
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
import { router, useLocalSearchParams } from "expo-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Calendar,
  LocaleConfig,
  type DateData,
} from "react-native-calendars";

import { PageHeader } from "../../components/layout/PageHeader";
import { colors } from "../../constants/colors";
import { getVehicleDisplayName, type Vehicle } from "../../constants/data";
import type { VehicleRequest } from "../../constants/requests";
import { useAuth } from "../../contexts/AuthContext";
import {
  type CreateRequestData,
  createMyRequest,
  getMyRequests,
  RequestRequestError,
  updateMyRequest,
} from "../../services/requests";
import {
  getAvailableVehicles,
  VehicleRequestError,
} from "../../services/vehicles";
import { queryKeys } from "../../services/queryKeys";
import { SCREEN_PADDING } from "../../styles/globalStyles";
import {
  formatDateToPtBr,
  getCalendarDateString,
  getLocalDateTimeParts,
  parseLocalDateTimeToDate,
  parseLocalDateTimeToISOString,
} from "../../utils/dateTime";

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
type RequestField =
  | "date"
  | "startTime"
  | "endTime"
  | "vehicle"
  | "destination"
  | "reason";

type RequestFieldErrors = Partial<Record<RequestField, string>>;

const getParamValue = (value?: string | string[]) =>
  Array.isArray(value) ? value[0] : value;

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

const isScheduleConflict = (message: string) => {
  const normalizedMessage = message.toLowerCase();

  return (
    normalizedMessage.includes("agendado") ||
    normalizedMessage.includes("conflit") ||
    normalizedMessage.includes("já possui solicitação")
  );
};

const getSaveErrorMessage = (error: unknown, isEditing: boolean) => {
  if (!(error instanceof RequestRequestError)) {
    return "Não foi possível salvar a solicitação.";
  }

  if (error.isConnectionError) {
    return "Não foi possível conectar ao servidor.";
  }

  if (error.status === 403) {
    return isEditing
      ? "Você não tem permissão para editar esta solicitação."
      : "Você não tem permissão para realizar esta ação.";
  }

  if (error.status === 400 || error.status === 409) {
    return error.message.trim() || "Não foi possível salvar a solicitação.";
  }

  if (isScheduleConflict(error.message)) {
    return (
      error.message.trim() ||
      "Este veículo já possui solicitação nesse horário."
    );
  }

  return "Não foi possível salvar a solicitação.";
};

const getEditLoadErrorMessage = (error: unknown) => {
  if (!(error instanceof RequestRequestError)) {
    return "Não foi possível carregar a solicitação.";
  }

  if (error.isConnectionError) {
    return "Não foi possível conectar ao servidor.";
  }

  if (error.status === 403) {
    return "Você não tem permissão para editar esta solicitação.";
  }

  if (error.message.trim()) {
    return error.message;
  }

  return "Não foi possível carregar a solicitação.";
};

const getVehicleLoadErrorMessage = (error: unknown) => {
  if (error instanceof VehicleRequestError) {
    if (error.status === 403) {
      return "Você não tem permissão para realizar esta ação.";
    }

    if (error.isConnectionError) {
      return "Não foi possível conectar ao servidor.";
    }
  }

  return "Não foi possível carregar os veículos.";
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

const isPastCalendarDate = (dateString: string, now = new Date()) =>
  dateString < getCalendarDateString(now);

const isPastDateTime = (
  dateString: string,
  timeString: string,
  now = new Date()
) => {
  const selectedDateTime = parseLocalDateTimeToDate(dateString, timeString);
  const currentMinute = new Date(now);

  currentMinute.setSeconds(0, 0);

  return Boolean(selectedDateTime && selectedDateTime < currentMinute);
};

const getVehicleSelectLabel = (vehicle: Vehicle | null) =>
  vehicle ? `${getVehicleDisplayName(vehicle)} - ${vehicle.plate}` : "";

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
  const queryClient = useQueryClient();
  const { signOut, token } = useAuth();
  const {
    mode: modeParam,
    requestId: requestIdParam,
    vehicleId: vehicleIdParam,
  } = useLocalSearchParams<{
    mode?: string | string[];
    requestId?: string | string[];
    vehicleId?: string | string[];
  }>();
  const routeMode = getParamValue(modeParam);
  const routeRequestId = getParamValue(requestIdParam);
  const routeVehicleId = getParamValue(vehicleIdParam);
  const isEditMode = routeMode === "edit" || Boolean(routeRequestId);
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
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [loadedRequest, setLoadedRequest] = useState<VehicleRequest | null>(
    null
  );
  const [requestLoadError, setRequestLoadError] = useState("");
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<RequestFieldErrors>({});
  const [showVehicleSelect, setShowVehicleSelect] = useState(false);
  const hourListRef = useRef<FlatList<string>>(null);
  const minuteListRef = useRef<FlatList<string>>(null);
  const wasTimeModalVisible = useRef(false);
  const appliedVehicleId = useRef<string | null>(null);
  const {
    data: availableVehicles = [],
    error: vehiclesQueryError,
    isLoading: isLoadingVehicles,
  } = useQuery({
    queryKey: queryKeys.availableVehicles,
    queryFn: () => getAvailableVehicles(token ?? ""),
    enabled: Boolean(token),
  });
  const requestsQuery = useQuery({
    queryKey: queryKeys.requests,
    queryFn: () => getMyRequests(token ?? ""),
    enabled: Boolean(token && isEditMode && routeRequestId),
  });
  const invalidateRequestQueries = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.requests }),
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications }),
      queryClient.invalidateQueries({ queryKey: queryKeys.trips }),
      queryClient.invalidateQueries({ queryKey: queryKeys.vehicles }),
      queryClient.invalidateQueries({ queryKey: queryKeys.availableVehicles }),
      queryClient.invalidateQueries({ queryKey: queryKeys.home }),
    ]);
  }, [queryClient]);
  const createRequestMutation = useMutation({
    mutationFn: (requestData: CreateRequestData) =>
      createMyRequest(token ?? "", requestData),
    onSuccess: invalidateRequestQueries,
  });
  const updateRequestMutation = useMutation({
    mutationFn: ({
      requestData,
      requestId,
    }: {
      requestData: CreateRequestData;
      requestId: string;
    }) => updateMyRequest(token ?? "", requestId, requestData),
    onSuccess: invalidateRequestQueries,
  });
  const isLoadingRequest =
    isEditMode && Boolean(routeRequestId) && requestsQuery.isLoading;
  const isSubmitting =
    createRequestMutation.isPending || updateRequestMutation.isPending;
  const vehicleError = vehiclesQueryError
    ? getVehicleLoadErrorMessage(vehiclesQueryError)
    : "";

  const selectedVehicleLabel = getVehicleSelectLabel(selectedVehicle);
  const todayCalendarDate = getCalendarDateString();
  const currentCalendarDate =
    selectedDateString && !isPastCalendarDate(selectedDateString)
      ? selectedDateString
      : date && !isPastCalendarDate(date)
        ? date
        : todayCalendarDate;
  const screenTitle = isEditMode ? "Editar solicitação" : "Nova solicitação";
  const screenSubtitle = isEditMode
    ? "Atualize os dados da viagem"
    : "Preencha os dados da viagem";
  const saveButtonLabel = isEditMode ? "Salvar alterações" : "Salvar";
  const canSubmitRequest =
    !isEditMode || loadedRequest?.status === "PENDING";
  const isRequestStateVisible =
    isEditMode &&
    (isLoadingRequest || (Boolean(requestLoadError) && !loadedRequest));
  const isSaveDisabled =
    isSubmitting ||
    isLoadingVehicles ||
    Boolean(vehicleError) ||
    !canSubmitRequest;
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
    const hasUnauthorizedError =
      (vehiclesQueryError instanceof VehicleRequestError &&
        vehiclesQueryError.status === 401) ||
      (requestsQuery.error instanceof RequestRequestError &&
        requestsQuery.error.status === 401);

    if (hasUnauthorizedError) {
      void signOut();
    }
  }, [requestsQuery.error, signOut, vehiclesQueryError]);

  useEffect(() => {
    if (!isEditMode) {
      setLoadedRequest(null);
      setRequestLoadError("");
      return;
    }

    if (!routeRequestId) {
      setLoadedRequest(null);
      setRequestLoadError("Solicitação não encontrada.");
      return;
    }

    if (!token || requestsQuery.isLoading) {
      return;
    }

    if (requestsQuery.error) {
      setLoadedRequest(null);
      setRequestLoadError(getEditLoadErrorMessage(requestsQuery.error));
      return;
    }

    const request = requestsQuery.data?.find(
      (item) => item.id === routeRequestId
    );

    if (!request) {
      setLoadedRequest(null);
      setRequestLoadError("Solicitação não encontrada.");
      return;
    }

    const startParts = getLocalDateTimeParts(request.predictedStartDate);
    const endParts = getLocalDateTimeParts(request.predictedEndDate);

    if (!startParts || !endParts) {
      setLoadedRequest(null);
      setRequestLoadError(
        "Não foi possível carregar os horários da solicitação."
      );
      return;
    }

    const requestVehicle: Vehicle = request.vehicle;
    setLoadedRequest(request);
    setRequestLoadError("");
    setDate(startParts.date);
    setSelectedDateString(startParts.date);
    setStartTime(startParts.time);
    setEndTime(endParts.time);
    setSelectedVehicle(requestVehicle);
    setShowVehicleSelect(false);
    setDestination(request.destination);
    setReason(request.reason);
    setFieldErrors({});
    setFormError(
      request.status === "PENDING"
        ? ""
        : "Apenas solicitações pendentes podem ser editadas."
    );
  }, [
    isEditMode,
    requestsQuery.data,
    requestsQuery.error,
    requestsQuery.isLoading,
    routeRequestId,
    token,
  ]);

  useEffect(() => {
    if (
      isEditMode ||
      isLoadingVehicles ||
      !routeVehicleId ||
      appliedVehicleId.current === routeVehicleId
    ) {
      return;
    }

    appliedVehicleId.current = routeVehicleId;
    const vehicle = availableVehicles.find(
      (item) => String(item.id) === routeVehicleId
    );

    if (!vehicle) {
      setFormError(
        "O veículo selecionado não foi encontrado. Escolha outro veículo."
      );
      return;
    }

    setSelectedVehicle(vehicle);
    setShowVehicleSelect(false);
    setFieldErrors((current) => ({ ...current, vehicle: undefined }));
    setFormError("");
  }, [availableVehicles, isEditMode, isLoadingVehicles, routeVehicleId]);

  const clearFieldError = (field: RequestField) => {
    setFieldErrors((current) => {
      if (!current[field]) {
        return current;
      }

      return {
        ...current,
        [field]: undefined,
      };
    });
  };

  const setFieldError = (field: RequestField, message: string) => {
    setFieldErrors((current) => ({
      ...current,
      [field]: message,
    }));
  };

  const openDatePicker = () => {
    setSelectedDateString(
      date && !isPastCalendarDate(date) ? date : todayCalendarDate
    );
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
    if (!selectedDateString || isPastCalendarDate(selectedDateString)) {
      setFieldError("date", "Selecione uma data válida.");
      setShowDatePicker(false);
      return;
    }

    setDate(selectedDateString);
    clearFieldError("date");
    clearFieldError("startTime");
    clearFieldError("endTime");
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
      if (!date) {
        setFieldError("date", "Selecione uma data válida.");
        cancelTimeSelection();
        return;
      }

      if (isPastCalendarDate(date) || isPastDateTime(date, selectedTime)) {
        setFieldError(
          "startTime",
          "Não é possível solicitar veículo para um horário que já passou."
        );
        cancelTimeSelection();
        return;
      }

      setStartTime(selectedTime);
      clearFieldError("startTime");
      clearFieldError("endTime");
    }

    if (timeTarget === "end") {
      if (date && startTime) {
        const startDateTime = parseLocalDateTimeToDate(date, startTime);
        const endDateTime = parseLocalDateTimeToDate(date, selectedTime);

        if (startDateTime && endDateTime && endDateTime <= startDateTime) {
          setFieldError(
            "endTime",
            "O horário de término deve ser depois do horário de início."
          );
          cancelTimeSelection();
          return;
        }
      }

      setEndTime(selectedTime);
      clearFieldError("endTime");
    }

    cancelTimeSelection();
  };

  const selectVehicle = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setShowVehicleSelect(false);
    clearFieldError("vehicle");
    setFormError("");
  };

  const handleSave = async () => {
    if (isSubmitting) {
      return;
    }

    setFormError("");
    setFieldErrors({});

    if (isEditMode) {
      if (!routeRequestId || !loadedRequest) {
        setFormError("Solicitação não encontrada.");
        return;
      }

      if (loadedRequest.status !== "PENDING") {
        setFormError("Apenas solicitações pendentes podem ser editadas.");
        return;
      }
    }

    const trimmedDestination = destination.trim();
    const trimmedReason = reason.trim();
    const nextFieldErrors: RequestFieldErrors = {};

    if (!date || isPastCalendarDate(date)) {
      nextFieldErrors.date = "Selecione uma data válida.";
    }

    if (!startTime) {
      nextFieldErrors.startTime = "Informe o horário de início.";
    }

    if (!endTime) {
      nextFieldErrors.endTime = "Informe o término previsto.";
    }

    if (!selectedVehicle) {
      nextFieldErrors.vehicle = "Selecione um veículo.";
    }

    if (!trimmedDestination) {
      nextFieldErrors.destination = "Informe o destino.";
    }

    if (!trimmedReason) {
      nextFieldErrors.reason = "Informe a finalidade.";
    }

    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors);
      return;
    }

    const requestDate = date;
    const requestVehicle = selectedVehicle;

    if (!requestDate || !requestVehicle) {
      return;
    }

    const predictedStartDate = parseLocalDateTimeToDate(
      requestDate,
      startTime
    );
    const predictedEndDate = parseLocalDateTimeToDate(requestDate, endTime);
    const predictedStartDateIso = parseLocalDateTimeToISOString(
      requestDate,
      startTime
    );
    const predictedEndDateIso = parseLocalDateTimeToISOString(
      requestDate,
      endTime
    );

    if (
      !predictedStartDate ||
      !predictedEndDate ||
      !predictedStartDateIso ||
      !predictedEndDateIso
    ) {
      setFieldErrors({
        date: "Selecione uma data válida.",
      });
      return;
    }

    if (isPastDateTime(requestDate, startTime)) {
      setFieldErrors({
        startTime:
          "Não é possível solicitar veículo para um horário que já passou.",
      });
      return;
    }

    if (predictedEndDate <= predictedStartDate) {
      setFieldErrors({
        endTime: "O horário de término deve ser depois do horário de início.",
      });
      return;
    }

    if (!token) {
      router.replace("/");
      return;
    }

    try {
      const requestData: CreateRequestData = {
        vehicleId: String(requestVehicle.id),
        predictedStartDate: predictedStartDateIso,
        predictedEndDate: predictedEndDateIso,
        destination: trimmedDestination,
        reason: trimmedReason,
      };

      if (isEditMode && routeRequestId) {
        await updateRequestMutation.mutateAsync({
          requestData,
          requestId: routeRequestId,
        });
      } else {
        await createRequestMutation.mutateAsync(requestData);
      }

      Alert.alert(
        isEditMode ? "Solicitação atualizada" : "Solicitação criada",
        isEditMode
          ? "Sua solicitação foi atualizada com sucesso."
          : "Sua solicitação foi enviada com sucesso."
      );
      router.replace("/solicitacoes");
    } catch (error) {
      if (error instanceof RequestRequestError && error.status === 401) {
        await signOut();
        return;
      }

      setFormError(getSaveErrorMessage(error, isEditMode));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <PageHeader
        title={screenTitle}
        subtitle={screenSubtitle}
        showBackButton
        onBackPress={() => router.back()}
      />

      {isRequestStateVisible ? (
        <View style={styles.requestState}>
          {isLoadingRequest ? (
            <ActivityIndicator color={colors.primary} size="large" />
          ) : null}
          <Text style={styles.requestStateText}>
            {isLoadingRequest
              ? "Carregando solicitação..."
              : requestLoadError}
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.body}
          keyboardShouldPersistTaps="handled"
        >
        {/* DATA */}
        <Text style={styles.label}>Data de uso</Text>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={openDatePicker}
          style={[
            styles.input,
            styles.pickerInput,
            fieldErrors.date && styles.inputError,
          ]}
        >
          <Text
            style={[
              styles.pickerText,
              !date && styles.pickerPlaceholderText,
            ]}
          >
            {date ? formatDateToPtBr(date) : "dd/mm/aaaa"}
          </Text>
        </TouchableOpacity>
        {fieldErrors.date ? (
          <Text style={styles.fieldError}>{fieldErrors.date}</Text>
        ) : null}
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
                minDate={todayCalendarDate}
                markedDates={markedDates}
                onDayPress={(day: DateData) => {
                  if (isPastCalendarDate(day.dateString)) {
                    return;
                  }

                  setSelectedDateString(day.dateString);
                }}
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
              style={[
                styles.input,
                styles.pickerInput,
                fieldErrors.startTime && styles.inputError,
              ]}
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
            {fieldErrors.startTime ? (
              <Text style={styles.fieldError}>{fieldErrors.startTime}</Text>
            ) : null}
          </View>

          <View style={styles.flex}>
            <Text style={styles.label}>Término previsto</Text>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => openTimePicker("end")}
              style={[
                styles.input,
                styles.pickerInput,
                fieldErrors.endTime && styles.inputError,
              ]}
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
            {fieldErrors.endTime ? (
              <Text style={styles.fieldError}>{fieldErrors.endTime}</Text>
            ) : null}
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
          <TouchableOpacity
            activeOpacity={0.8}
            disabled={isLoadingVehicles || Boolean(vehicleError)}
            onPress={() => {
              setShowVehicleSelect(true);
              clearFieldError("vehicle");
              setFormError("");
            }}
            style={[
              styles.input,
              styles.selectInput,
              fieldErrors.vehicle && styles.inputError,
              (isLoadingVehicles || Boolean(vehicleError)) &&
                styles.disabledInput,
            ]}
          >
            <Text
              numberOfLines={1}
              style={[
                styles.pickerText,
                !selectedVehicleLabel && styles.pickerPlaceholderText,
              ]}
            >
              {isLoadingVehicles
                ? "Carregando veículos..."
                : selectedVehicleLabel || "Selecione um veículo"}
            </Text>
            <Text style={styles.selectChevron}>▼</Text>
          </TouchableOpacity>

          {isLoadingVehicles && (
            <View style={styles.vehicleLoading}>
              <ActivityIndicator color={colors.primary} size="small" />
              <Text style={styles.vehicleLoadingText}>Carregando veículos...</Text>
            </View>
          )}

          {vehicleError ? (
            <Text style={styles.fieldError}>{vehicleError}</Text>
          ) : null}

          {fieldErrors.vehicle ? (
            <Text style={styles.fieldError}>{fieldErrors.vehicle}</Text>
          ) : null}
        </View>
        <Modal
          animationType="fade"
          onRequestClose={() => setShowVehicleSelect(false)}
          transparent
          visible={showVehicleSelect}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.vehicleSelectCard}>
              <Text style={styles.modalTitle}>Selecionar veículo</Text>

              {availableVehicles.length > 0 ? (
                <FlatList
                  data={availableVehicles}
                  keyExtractor={(vehicle) => String(vehicle.id)}
                  style={styles.vehicleSelectList}
                  renderItem={({ item }) => {
                    const displayName = getVehicleDisplayName(item);
                    const isSelected =
                      selectedVehicle && String(selectedVehicle.id) === String(item.id);

                    return (
                      <TouchableOpacity
                        activeOpacity={0.85}
                        onPress={() => selectVehicle(item)}
                        style={[
                          styles.vehicleOption,
                          isSelected && styles.vehicleOptionSelected,
                        ]}
                      >
                        <Text style={styles.vehicleOptionName}>
                          {displayName}
                        </Text>
                        <Text style={styles.vehicleOptionPlate}>
                          {item.plate}
                        </Text>
                      </TouchableOpacity>
                    );
                  }}
                />
              ) : (
                <Text style={styles.vehicleOptionEmpty}>
                  Nenhum veículo disponível.
                </Text>
              )}

              <View style={styles.modalActions}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setShowVehicleSelect(false)}
                  style={[styles.modalButton, styles.modalCancelButton]}
                >
                  <Text style={styles.modalCancelText}>Fechar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* DESTINO */}
        <Text style={styles.label}>Destino</Text>
        <TextInput
          placeholder="Local de destino"
          value={destination}
          onChangeText={(value) => {
            setDestination(value);
            clearFieldError("destination");
            setFormError("");
          }}
          style={[styles.input, fieldErrors.destination && styles.inputError]}
          placeholderTextColor={colors.textMuted}
        />
        {fieldErrors.destination ? (
          <Text style={styles.fieldError}>{fieldErrors.destination}</Text>
        ) : null}

        {/* FINALIDADE */}
        <Text style={styles.label}>Finalidade</Text>
        <TextInput
          placeholder="Motivo da solicitação"
          value={reason}
          onChangeText={(value) => {
            setReason(value);
            clearFieldError("reason");
            setFormError("");
          }}
          style={[
            styles.input,
            styles.textArea,
            fieldErrors.reason && styles.inputError,
          ]}
          multiline
          placeholderTextColor={colors.textMuted}
        />
        {fieldErrors.reason ? (
          <Text style={styles.fieldError}>{fieldErrors.reason}</Text>
        ) : null}

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
            disabled={isSaveDisabled}
            style={[
              styles.button,
              styles.saveButton,
              isSaveDisabled && styles.disabledButton,
            ]}
            onPress={handleSave}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.saveText}>{saveButtonLabel}</Text>
            )}
          </TouchableOpacity>
        </View>
        </ScrollView>
      )}
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

  requestState: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: SCREEN_PADDING,
  },

  requestStateText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: "600",
    marginTop: 12,
    textAlign: "center",
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

  inputError: {
    borderColor: colors.danger,
  },

  disabledInput: {
    opacity: 0.7,
  },

  pickerInput: {
    justifyContent: "center",
  },

  selectInput: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },

  pickerText: {
    color: colors.textPrimary,
    fontSize: 15,
    flex: 1,
  },

  pickerPlaceholderText: {
    color: colors.textMuted,
  },

  selectChevron: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "700",
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

  vehicleSelectCard: {
    width: "100%",
    maxWidth: 390,
    maxHeight: "76%",
    backgroundColor: colors.surface,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 16,
  },

  vehicleSelectList: {
    maxHeight: 360,
  },

  vehicleOption: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },

  vehicleOptionSelected: {
    backgroundColor: "#E8EEF5",
    borderRadius: 12,
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
