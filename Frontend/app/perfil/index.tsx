import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Bell, ChevronDown, Lock, LogOut, Save } from "lucide-react-native";

import { PageHeader } from "../../components/layout/PageHeader";
import { getTabBarContentPadding, TabBar } from "../../components/layout/TabBar";
import { colors } from "../../constants/colors";
import { SCREEN_PADDING, styles as globalStyles } from "../../styles/globalStyles";

const PROFILE_PRIMARY = "#005C6B";

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

type ProfileFieldProps = {
  label: string;
  value: string;
  select?: boolean;
};

type ProfileActionButtonProps = {
  title: string;
  icon: React.ReactNode;
  variant?: "primary" | "secondary" | "danger";
  onPress: () => void;
};

function ProfileField({ label, value, select }: ProfileFieldProps) {
  const Content = select ? TouchableOpacity : View;

  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>

      <Content
        activeOpacity={select ? 0.7 : undefined}
        style={styles.fieldBox}
      >
        <Text style={styles.fieldValue}>{value}</Text>

        {select && <ChevronDown color="#111827" size={20} strokeWidth={2.4} />}
      </Content>
    </View>
  );
}

function ProfileActionButton({
  title,
  icon,
  variant = "secondary",
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

  return (
    <SafeAreaView style={globalStyles.root} edges={["top"]}>
      <PageHeader
        title="Perfil"
        showBackButton
        onBackPress={() => router.back()}
      />

      <ScrollView
        style={globalStyles.body}
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

          <Text style={styles.profileName}>{user.name}</Text>
          <Text style={styles.profileRole}>{user.role}</Text>
        </View>

        <ProfileField label="Nome completo" value={user.fullName} />
        <ProfileField label="Matrícula" value={user.registration} />
        <ProfileField label="CPF" value={user.cpf} />
        <ProfileField label="Email" value={user.email} />
        <ProfileField label="Telefone" value={user.phone} />
        <ProfileField label="CNH" value={user.cnh} />
        <ProfileField
          label="Secretaria/Departamento"
          value={user.department}
          select
        />

        <View style={styles.actions}>
          <ProfileActionButton
            title="Salvar alterações"
            icon={<Save color="#FFFFFF" size={18} strokeWidth={2.4} />}
            variant="primary"
            onPress={() => console.log("Salvar alterações")}
          />

          <ProfileActionButton
            title="Alterar senha"
            icon={<Lock color="#111827" size={18} strokeWidth={2.2} />}
            onPress={() => console.log("Alterar senha")}
          />

          <ProfileActionButton
            title="Configurar notificações"
            icon={<Bell color="#111827" size={18} strokeWidth={2.2} />}
            onPress={() => console.log("Configurar notificações")}
          />

          <ProfileActionButton
            title="Sair"
            icon={<LogOut color="#EF4444" size={18} strokeWidth={2.2} />}
            variant="danger"
            onPress={() => router.replace("/")}
          />
        </View>
      </ScrollView>

      <TabBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
    marginBottom: 16,
  },

  fieldLabel: {
    marginBottom: 8,
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
  },

  fieldBox: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  fieldValue: {
    flex: 1,
    color: "#0D1B2A",
    fontSize: 16,
  },

  actions: {
    gap: 10,
    marginTop: 10,
  },

  actionButton: {
    minHeight: 52,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },

  actionText: {
    fontSize: 16,
    fontWeight: "700",
  },

  primaryButton: {
    backgroundColor: PROFILE_PRIMARY,
  },

  primaryButtonText: {
    color: "#FFFFFF",
  },

  secondaryButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },

  secondaryButtonText: {
    color: "#111827",
  },

  dangerButton: {
    backgroundColor: "#FCE7EA",
  },

  dangerButtonText: {
    color: "#EF4444",
  },
});
