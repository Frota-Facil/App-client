import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Check, LogOut, Pencil, X } from "lucide-react-native";

import { PageHeader } from "../../components/layout/PageHeader";
import { HeaderHelpButton } from "../../components/layout/HeaderHelpButton";
import { getTabBarContentPadding } from "../../components/layout/TabBar";
import { colors } from "../../constants/colors";
import { useAuth } from "../../contexts/AuthContext";
import { normalizeImageUrl } from "../../services/imageUrl";
import {
  getMe,
  type Profile,
  ProfileRequestError,
  type UpdateProfileData,
  updateMe,
} from "../../services/profileService";
import { queryKeys } from "../../services/queryKeys";
import {
  baseCard,
  CARD_SPACING,
  SCREEN_PADDING,
  styles as globalStyles,
} from "../../styles/globalStyles";

const PROFILE_PRIMARY = colors.primary;

type EditableProfileField = "fullName" | "phone";

type ProfileFieldProps = {
  label: string;
  value: string;
  editable?: boolean;
  isEditing?: boolean;
  keyboardType?: "default" | "phone-pad";
  inputRef?: React.RefObject<TextInput | null>;
  onChangeText?: (value: string) => void;
  onEditPress?: () => void;
  onSavePress?: () => void;
  onCancelPress?: () => void;
  onSubmitEditing?: () => void;
  isSaving?: boolean;
};

type ProfileActionButtonProps = {
  title: string;
  icon: React.ReactNode;
  variant?: "danger";
  onPress: () => void;
};

function ProfileField({
  label,
  value,
  editable,
  isEditing,
  keyboardType = "default",
  inputRef,
  onChangeText,
  onEditPress,
  onSavePress,
  onCancelPress,
  onSubmitEditing,
  isSaving,
}: ProfileFieldProps) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>

      <View style={styles.fieldBox}>
        <TextInput
          ref={inputRef}
          value={value}
          editable={Boolean(editable && isEditing)}
          keyboardType={keyboardType}
          onChangeText={onChangeText}
          onSubmitEditing={onSubmitEditing}
          returnKeyType={isEditing ? "done" : undefined}
          style={[styles.fieldValue, !editable && styles.readOnlyFieldValue]}
          placeholderTextColor={colors.textMuted}
        />

        {editable && (
          <View style={styles.fieldActions}>
            {isEditing && (
              <TouchableOpacity
                accessibilityLabel={`Cancelar edição de ${label}`}
                activeOpacity={0.7}
                disabled={isSaving}
                onPress={onCancelPress}
                style={styles.cancelFieldButton}
              >
                <X color={colors.textSecondary} size={17} strokeWidth={2.4} />
              </TouchableOpacity>
            )}

            <TouchableOpacity
              accessibilityLabel={`${isEditing ? "Salvar" : "Editar"} ${label}`}
              activeOpacity={0.7}
              disabled={isSaving}
              onPress={isEditing ? onSavePress : onEditPress}
              style={[
                styles.editFieldButton,
                isEditing && styles.editFieldButtonActive,
              ]}
            >
              {isSaving ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : isEditing ? (
                <Check color="#FFFFFF" size={17} strokeWidth={2.5} />
              ) : (
                <Pencil
                  color={PROFILE_PRIMARY}
                  size={16}
                  strokeWidth={2.4}
                />
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

function ProfileActionButton({
  title,
  icon,
  variant = "danger",
  onPress,
}: ProfileActionButtonProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[styles.actionButton, styles[`${variant}Button`]]}
    >
      {icon}
      <Text style={[styles.actionText, styles[`${variant}ButtonText`]]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const onlyDigits = (value: string) => value.replace(/\D/g, "");

const formatCpf = (cpf: string) => {
  const digits = onlyDigits(cpf);

  if (digits.length !== 11) {
    return cpf;
  }

  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
};

const formatPhone = (phone: string) => {
  const digits = onlyDigits(phone).slice(0, 14);

  if (digits.length === 13 && digits.startsWith("55")) {
    return digits.replace(/(\d{2})(\d{2})(\d{5})(\d{4})/, "+$1 ($2) $3-$4");
  }

  if (digits.length === 12 && digits.startsWith("55")) {
    return digits.replace(/(\d{2})(\d{2})(\d{4})(\d{4})/, "+$1 ($2) $3-$4");
  }

  if (digits.length === 11) {
    return digits.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  }

  if (digits.length === 10) {
    return digits.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
  }

  return digits;
};

const getInitials = (name: string) => {
  const nameParts = name.trim().split(/\s+/).filter(Boolean);

  if (nameParts.length === 0) {
    return "?";
  }

  if (nameParts.length === 1) {
    return nameParts[0].slice(0, 2).toUpperCase();
  }

  return `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase();
};

const getProfileErrorMessage = (error: unknown, fallbackMessage: string) => {
  if (!(error instanceof ProfileRequestError)) {
    return fallbackMessage;
  }

  if (error.status === 403) {
    return "Você não tem permissão para acessar estes dados.";
  }

  if (error.isConnectionError) {
    return "Não foi possível conectar ao servidor.";
  }

  return fallbackMessage;
};

export default function PerfilScreen() {
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const { signOut, token } = useAuth();
  const [formError, setFormError] = useState("");
  const [editingField, setEditingField] =
    useState<EditableProfileField | null>(null);
  const [savingField, setSavingField] =
    useState<EditableProfileField | null>(null);
  const [fullNameDraft, setFullNameDraft] = useState("");
  const [phoneDraft, setPhoneDraft] = useState("");
  const [isSigningOut, setIsSigningOut] = useState(false);
  const fullNameRef = useRef<TextInput | null>(null);
  const phoneRef = useRef<TextInput | null>(null);
  const {
    data: profile = null,
    error: profileQueryError,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: queryKeys.profile,
    queryFn: () => getMe(token ?? ""),
    enabled: Boolean(token),
  });
  const updateProfileMutation = useMutation({
    mutationFn: (data: UpdateProfileData) => updateMe(token ?? "", data),
    onSuccess: async (updatedProfile) => {
      queryClient.setQueryData<Profile>(queryKeys.profile, updatedProfile);
      setFullNameDraft(updatedProfile.name);
      setPhoneDraft(formatPhone(updatedProfile.phone));
      setEditingField(null);
      await queryClient.invalidateQueries({ queryKey: queryKeys.profile });
    },
  });

  useEffect(() => {
    if (
      profileQueryError instanceof ProfileRequestError &&
      profileQueryError.status === 401
    ) {
      void signOut();
    }
  }, [profileQueryError, signOut]);

  useEffect(() => {
    if (profile && !editingField && !savingField) {
      setFullNameDraft(profile.name);
      setPhoneDraft(formatPhone(profile.phone));
    }
  }, [editingField, profile, savingField]);

  const loadError = profileQueryError
    ? getProfileErrorMessage(
        profileQueryError,
        "Não foi possível carregar o perfil.",
      )
    : "";
  const profilePhotoUrl = normalizeImageUrl(profile?.photoUrl);

  const startEditing = (
    field: EditableProfileField,
    ref: React.RefObject<TextInput | null>,
  ) => {
    if (!profile) {
      return;
    }

    setFullNameDraft(profile.name);
    setPhoneDraft(formatPhone(profile.phone));
    setFormError("");
    setEditingField(field);
    setTimeout(() => {
      ref.current?.focus();
    }, 100);
  };

  const cancelEditing = () => {
    if (profile) {
      setFullNameDraft(profile.name);
      setPhoneDraft(formatPhone(profile.phone));
    }

    setFormError("");
    setEditingField(null);
  };

  const saveField = async (field: EditableProfileField) => {
    if (!token || !profile || savingField) {
      return;
    }

    const trimmedName = fullNameDraft.trim();
    const normalizedPhone = onlyDigits(phoneDraft);

    if (field === "fullName" && !trimmedName) {
      setFormError("O nome completo não pode ser vazio.");
      return;
    }

    if (field === "phone" && !normalizedPhone) {
      setFormError("O telefone não pode ser vazio.");
      return;
    }

    if (
      field === "phone" &&
      (normalizedPhone.length < 10 || normalizedPhone.length > 14)
    ) {
      setFormError("Informe um telefone válido com 10 a 14 dígitos.");
      return;
    }

    const hasChanged =
      field === "fullName"
        ? trimmedName !== profile.name
        : normalizedPhone !== onlyDigits(profile.phone);

    if (!hasChanged) {
      cancelEditing();
      return;
    }

    setSavingField(field);
    setFormError("");

    try {
      await updateProfileMutation.mutateAsync(
        field === "fullName"
          ? { name: trimmedName }
          : { phone: normalizedPhone },
      );
    } catch (error) {
      if (error instanceof ProfileRequestError && error.status === 401) {
        await signOut();
        return;
      }

      setFormError(
        getProfileErrorMessage(error, "Não foi possível atualizar o perfil."),
      );
    } finally {
      setSavingField(null);
    }
  };

  const handleSignOut = async () => {
    setIsSigningOut(true);

    try {
      await signOut();
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <SafeAreaView style={styles.root} edges={["top"]}>
      <StatusBar
        backgroundColor={colors.surface}
        style="dark"
        translucent={false}
      />

      <PageHeader
        title="Perfil"
        showBackButton
        onBackPress={() => router.back()}
        rightContent={
          <HeaderHelpButton
            title="Como usar Perfil"
            message="Nesta tela você pode visualizar seus dados pessoais e editar apenas nome completo e telefone."
          />
        }
      />

      <ScrollView
        style={[globalStyles.body, styles.body]}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: getTabBarContentPadding(insets.bottom) + 24 },
        ]}
      >
        {isLoading ? (
          <View style={styles.feedbackContainer}>
            <ActivityIndicator color={PROFILE_PRIMARY} size="large" />
            <Text style={styles.feedbackText}>Carregando perfil...</Text>
          </View>
        ) : loadError ? (
          <View style={styles.feedbackContainer}>
            <Text style={styles.errorText}>{loadError}</Text>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => void refetch()}
              style={styles.retryButton}
            >
              <Text style={styles.retryButtonText}>Tentar novamente</Text>
            </TouchableOpacity>
          </View>
        ) : profile ? (
          <>
            <View style={styles.profileIntro}>
              <View style={styles.avatar}>
                {profilePhotoUrl ? (
                  <Image
                    resizeMode="cover"
                    source={{ uri: profilePhotoUrl }}
                    style={styles.avatarImage}
                  />
                ) : (
                  <Text style={styles.avatarText}>
                    {getInitials(profile.name)}
                  </Text>
                )}
              </View>

              <Text style={styles.profileName}>{profile.name}</Text>
              <Text style={styles.profileRole}>
                {profile.department ?? "Não informado"}
              </Text>
            </View>

            {formError ? (
              <Text accessibilityRole="alert" style={styles.formErrorText}>
                {formError}
              </Text>
            ) : null}

            <ProfileField
              label="Nome completo"
              value={
                editingField === "fullName" ? fullNameDraft : profile.name
              }
              editable
              isEditing={editingField === "fullName"}
              isSaving={savingField === "fullName"}
              inputRef={fullNameRef}
              onChangeText={setFullNameDraft}
              onEditPress={() => startEditing("fullName", fullNameRef)}
              onSavePress={() => void saveField("fullName")}
              onCancelPress={cancelEditing}
              onSubmitEditing={() => void saveField("fullName")}
            />
            <ProfileField label="CPF" value={formatCpf(profile.cpf)} />
            <ProfileField label="Email" value={profile.email} />
            <ProfileField
              label="Telefone"
              value={
                editingField === "phone"
                  ? phoneDraft
                  : formatPhone(profile.phone)
              }
              editable
              isEditing={editingField === "phone"}
              isSaving={savingField === "phone"}
              keyboardType="phone-pad"
              inputRef={phoneRef}
              onChangeText={(phone) => setPhoneDraft(formatPhone(phone))}
              onEditPress={() => startEditing("phone", phoneRef)}
              onSavePress={() => void saveField("phone")}
              onCancelPress={cancelEditing}
              onSubmitEditing={() => void saveField("phone")}
            />
            <ProfileField label="CNH" value={profile.cnh ?? "Não informado"} />
            <ProfileField
              label="Secretaria/Departamento"
              value={profile.department ?? "Não informado"}
            />

            <View style={styles.actions}>
              <ProfileActionButton
                title={isSigningOut ? "Saindo..." : "Sair"}
                icon={
                  isSigningOut ? (
                    <ActivityIndicator color={colors.danger} size="small" />
                  ) : (
                    <LogOut color="#EF4444" size={18} strokeWidth={2.2} />
                  )
                }
                variant="danger"
                onPress={() => void handleSignOut()}
              />
            </View>
          </>
        ) : null}
      </ScrollView>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.surface,
  },

  body: {
    backgroundColor: colors.background,
  },

  content: {
    paddingHorizontal: SCREEN_PADDING,
    paddingTop: 20,
  },

  profileIntro: {
    alignItems: "center",
    marginBottom: 24,
  },

  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: PROFILE_PRIMARY,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 4,
    overflow: "hidden",
  },

  avatarImage: {
    width: "100%",
    height: "100%",
  },

  avatarText: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "800",
  },

  profileName: {
    marginTop: 14,
    color: "#0D1B2A",
    fontSize: 18,
    fontWeight: "800",
  },

  profileRole: {
    marginTop: 3,
    color: colors.textSecondary,
    fontSize: 13,
  },

  fieldGroup: {
    marginBottom: CARD_SPACING,
  },

  fieldLabel: {
    marginBottom: 8,
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
  },

  fieldBox: {
    ...baseCard,
    minHeight: 48,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },

  fieldValue: {
    flex: 1,
    color: "#0D1B2A",
    fontSize: 16,
    padding: 0,
  },

  fieldActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  readOnlyFieldValue: {
    color: colors.textSecondary,
  },

  editFieldButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E6F3F5",
  },

  editFieldButtonActive: {
    backgroundColor: PROFILE_PRIMARY,
  },

  cancelFieldButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },

  feedbackContainer: {
    minHeight: 320,
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
    paddingHorizontal: 24,
  },

  feedbackText: {
    color: colors.textSecondary,
    fontSize: 14,
  },

  errorText: {
    color: colors.danger,
    fontSize: 14,
    textAlign: "center",
  },

  formErrorText: {
    marginBottom: 14,
    color: colors.danger,
    fontSize: 13,
    textAlign: "center",
  },

  retryButton: {
    minHeight: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: PROFILE_PRIMARY,
    paddingHorizontal: 18,
  },

  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },

  actions: {
    gap: 10,
    marginTop: 10,
  },

  actionButton: {
    minHeight: 52,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },

  actionText: {
    fontSize: 16,
    fontWeight: "700",
  },

  dangerButton: {
    backgroundColor: "#FCE7EA",
  },

  dangerButtonText: {
    color: "#EF4444",
  },
});
