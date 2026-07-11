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

import { useAuth } from "../contexts/AuthContext";
import { AuthRequestError } from "../services/auth";

const inputTextColor = "#111827";
const inputPlaceholderColor = "#6B7280";
const inputSelectionColor = "#1B3A5C";

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
        backgroundColor: "#F3F4F6",
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
          backgroundColor: "#fff",
          borderRadius: 20,
          padding: 20,
          shadowColor: "#000",
          shadowOpacity: 0.05,
          shadowRadius: 10,
          elevation: 5,
        }}
      >
        {/* EMAIL */}
        <Text style={{ marginBottom: 6, color: "#374151" }}>
          Email institucional
        </Text>

        <TextInput
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          placeholder="nome@sif.com"
          placeholderTextColor={inputPlaceholderColor}
          selectionColor={inputSelectionColor}
          cursorColor={inputSelectionColor}
          style={{
            backgroundColor: "#F9FAFB",
            borderRadius: 12,
            padding: 14,
            borderWidth: 1,
            borderColor: "#E5E7EB",
            color: inputTextColor,
            marginBottom: 16,
          }}
        />

        {/* SENHA */}
        <Text style={{ marginBottom: 6, color: "#374151" }}>
          Senha
        </Text>

        <View style={{ position: "relative", marginBottom: 20 }}>
          <TextInput
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            placeholder="Digite sua senha"
            placeholderTextColor={inputPlaceholderColor}
            selectionColor={inputSelectionColor}
            cursorColor={inputSelectionColor}
            style={{
              backgroundColor: "#F9FAFB",
              borderRadius: 12,
              padding: 14,
              paddingRight: 48,
              borderWidth: 1,
              borderColor: "#E5E7EB",
              color: inputTextColor,
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
              <EyeClosed size={22} color="#6B7280" />
            ) : (
              <Eye size={22} color="#6B7280" />
            )}
          </TouchableOpacity>
        </View>

        {errorMessage ? (
          <Text
            style={{
              color: "#B91C1C",
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
            backgroundColor: isLoading ? "#6B7280" : "#1B3A5C",
            padding: 16,
            borderRadius: 14,
            alignItems: "center",
          }}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={{ color: "#fff", fontWeight: "bold" }}>
              Entrar
            </Text>
          )}
        </TouchableOpacity>
        
      </View>
      <View style={{ height: 100 }}></View>
    </SafeAreaView>
  );
}
