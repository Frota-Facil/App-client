import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import { Eye, EyeClosed } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { colors } from "../constants/colors";
import { useAuth } from "../contexts/AuthContext";
import { AuthRequestError } from "../services/auth";

export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setLoading] = useState(false);

  const handleLogin = async () => {
    const trimmedEmail = email.trim();

    setErrorMessage("");

    if (!trimmedEmail || !password) {
      setErrorMessage("Preencha email e senha");
      return;
    }

    try {
      setLoading(true);
      await signIn(trimmedEmail, password);
      router.replace("/home");
    } catch (error) {
      if (error instanceof AuthRequestError && error.status === 401) {
        setErrorMessage("Credenciais inválidas");
        return;
      }

      setErrorMessage("Não foi possível conectar ao servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: colors.background,
        justifyContent: "space-around",
        padding: 20,
      }}
      edges={["top"]}
    >

      <Image
        source={require("../assets/images/logo.png")}
        style={{
          width: 300,
          height: 150,
          alignSelf: "center",
          
          
        }}
      />
      {/* CARD */}
      <View
        style={{
          backgroundColor: colors.card,
          borderRadius: 20,
          padding: 20,
          borderWidth: 1,
          borderColor: colors.border,
        }}
      >
        {/* EMAIL */}
        <Text style={{ marginBottom: 6, color: colors.textSecondary }}>
          Email institucional
        </Text>

        <TextInput
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          placeholder="nome@sif.com"
          placeholderTextColor={colors.textMuted}
          selectionColor={colors.primary}
          cursorColor={colors.primary}
          style={{
            backgroundColor: colors.backgroundSoft,
            borderRadius: 12,
            padding: 14,
            borderWidth: 1,
            borderColor: colors.border,
            color: colors.textPrimary,
            marginBottom: 16,
          }}
        />

        {/* SENHA */}
        <Text style={{ marginBottom: 6, color: colors.textSecondary }}>
          Senha
        </Text>

        <View style={{ position: "relative", marginBottom: 20 }}>
          <TextInput
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            placeholder="Digite sua senha"
            placeholderTextColor={colors.textMuted}
            selectionColor={colors.primary}
            cursorColor={colors.primary}
            style={{
              backgroundColor: colors.backgroundSoft,
              borderRadius: 12,
              padding: 14,
              paddingRight: 48,
              borderWidth: 1,
              borderColor: colors.border,
              color: colors.textPrimary,
            }}
          />

          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={{
              position: "absolute",
              right: 14,
              top: 0,
              bottom: 0,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {showPassword ? (
              <EyeClosed size={22} color={colors.textSecondary} />
            ) : (
              <Eye size={22} color={colors.textSecondary} />
            )}
          </TouchableOpacity>
        </View>

        {errorMessage ? (
          <Text
            style={{
              color: colors.dangerText,
              marginBottom: 14,
              textAlign: "center",
            }}
          >
            {errorMessage}
          </Text>
        ) : null}

        {/* BOTÃO */}
        <TouchableOpacity
          onPress={handleLogin}
          disabled={isLoading}
          style={{
            backgroundColor: isLoading ? colors.textSecondary : colors.primary,
            padding: 16,
            borderRadius: 14,
            alignItems: "center",
          }}
        >
          {isLoading ? (
            <ActivityIndicator color={colors.textLight} />
          ) : (
            <Text style={{ color: colors.textLight, fontWeight: "bold" }}>
              Entrar
            </Text>
          )}
        </TouchableOpacity>
        
      </View>
      <View style={{ height: 100 }}></View>
    </SafeAreaView>
  );
}
