import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

export default function LoginScreen() {
  const router = useRouter();

  const [email, setEmail] = useState("carlos.mendes@municipio.gov.br");
  const [password, setPassword] = useState("123456");

  const handleLogin = () => {
    // depois conectar com backend
    router.replace("/home");
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
          style={{
            backgroundColor: "#F9FAFB",
            borderRadius: 12,
            padding: 14,
            borderWidth: 1,
            borderColor: "#E5E7EB",
            marginBottom: 16,
          }}
        />

        {/* SENHA */}
        <Text style={{ marginBottom: 6, color: "#374151" }}>
          Senha
        </Text>

        <TextInput
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={{
            backgroundColor: "#F9FAFB",
            borderRadius: 12,
            padding: 14,
            borderWidth: 1,
            borderColor: "#E5E7EB",
            marginBottom: 20,
          }}
        />

        {/* BOTÃO */}
        <TouchableOpacity
          onPress={handleLogin}
          style={{
            backgroundColor: "#0F766E",
            padding: 16,
            borderRadius: 14,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "bold" }}>
            Entrar
          </Text>
        </TouchableOpacity>
        
      </View>
      <View style={{ height: 100 }}></View>
    </SafeAreaView>
  );
}