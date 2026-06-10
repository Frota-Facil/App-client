import React, { useRef, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { LogOut, Pencil } from "lucide-react-native";

import { PageHeader } from "../../components/layout/PageHeader";
import { HeaderHelpButton } from "../../components/layout/HeaderHelpButton";
import { getTabBarContentPadding } from "../../components/layout/TabBar";
import { colors } from "../../constants/colors";
import {
  baseCard,
  CARD_SPACING,
  SCREEN_PADDING,
  styles as globalStyles,
} from "../../styles/globalStyles";

const PROFILE_PRIMARY = colors.primary;

const user = {
  initials: "CM",
  name: "Carlos Mendes",
  role: "Secretaria de Obras",
  fullName: "Carlos Mendes",
  registration: "MUN-04823",
  cpf: "123.456.789-00",
  email: "carlos.mendes@municipio.gov.br",
  phone: "(11) 98765-4321",
  cnh: "01234567890",
  department: "Secretaria de Obras",
};

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
  onBlur?: () => void;
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
  onBlur,
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
          onBlur={onBlur}
          style={[styles.fieldValue, !editable && styles.readOnlyFieldValue]}
          placeholderTextColor={colors.textMuted}
        />

        {editable && (
          <TouchableOpacity
            accessibilityLabel={`Editar ${label}`}
            activeOpacity={0.7}
            onPress={onEditPress}
            style={[
              styles.editFieldButton,
              isEditing && styles.editFieldButtonActive,
            ]}
          >
            <Pencil
              color={isEditing ? "#FFFFFF" : PROFILE_PRIMARY}
              size={16}
              strokeWidth={2.4}
            />
          </TouchableOpacity>
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

export default function PerfilScreen() {
  const insets = useSafeAreaInsets();
  const [profile, setProfile] = useState({
    fullName: user.fullName,
    phone: user.phone,
  });
  const [editingField, setEditingField] =
    useState<EditableProfileField | null>(null);
  const fullNameRef = useRef<TextInput | null>(null);
  const phoneRef = useRef<TextInput | null>(null);

  const startEditing = (
    field: EditableProfileField,
    ref: React.RefObject<TextInput | null>,
  ) => {
    setEditingField(field);
    setTimeout(() => {
      ref.current?.focus();
    }, 100);
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
        <View style={styles.profileIntro}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user.initials}</Text>
          </View>

          <Text style={styles.profileName}>{profile.fullName}</Text>
          <Text style={styles.profileRole}>{user.role}</Text>
        </View>

        <ProfileField
          label="Nome completo"
          value={profile.fullName}
          editable
          isEditing={editingField === "fullName"}
          inputRef={fullNameRef}
          onChangeText={(fullName) =>
            setProfile((currentProfile) => ({
              ...currentProfile,
              fullName,
            }))
          }
          onEditPress={() => startEditing("fullName", fullNameRef)}
          onBlur={() => setEditingField(null)}
        />
        <ProfileField label="Matrícula" value={user.registration} />
        <ProfileField label="CPF" value={user.cpf} />
        <ProfileField label="Email" value={user.email} />
        <ProfileField
          label="Telefone"
          value={profile.phone}
          editable
          isEditing={editingField === "phone"}
          keyboardType="phone-pad"
          inputRef={phoneRef}
          onChangeText={(phone) =>
            setProfile((currentProfile) => ({
              ...currentProfile,
              phone,
            }))
          }
          onEditPress={() => startEditing("phone", phoneRef)}
          onBlur={() => setEditingField(null)}
        />
        <ProfileField label="CNH" value={user.cnh} />
        <ProfileField
          label="Secretaria/Departamento"
          value={user.department}
        />

        <View style={styles.actions}>
          <ProfileActionButton
            title="Sair"
            icon={<LogOut color="#EF4444" size={18} strokeWidth={2.2} />}
            variant="danger"
            onPress={() => router.replace("/")}
          />
        </View>
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
