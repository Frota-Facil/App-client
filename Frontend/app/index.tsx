import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Platform,
} from "react-native";
import * as AuthSession from "expo-auth-session";
import * as Crypto from "expo-crypto";
import * as WebBrowser from "expo-web-browser";
import { Eye, EyeClosed } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Svg, { Path } from "react-native-svg";

import { colors } from "../constants/colors";
import { useAuth } from "../contexts/AuthContext";
import { AuthRequestError } from "../services/auth";

WebBrowser.maybeCompleteAuthSession();

const GOOGLE_AUTH_SCOPES = ["openid", "profile", "email"];
const GOOGLE_MISSING_CLIENT_ID = "missing-google-client-id";
const GOOGLE_REDIRECT_URI = AuthSession.makeRedirectUri({
  scheme: "frontend-app",
  path: "auth/google",
});
const GOOGLE_DISCOVERY = {
  authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
  tokenEndpoint: "https://oauth2.googleapis.com/token",
};

const getGoogleClientId = () => {
  if (Platform.OS === "android") {
    return (
      process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID ||
      process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID ||
      ""
    );
  }

  if (Platform.OS === "ios") {
    return (
      process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ||
      process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID ||
      ""
    );
  }

  return (
    process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ||
    process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID ||
    ""
  );
};

const getGoogleApiErrorMessage = (error: unknown) => {
  if (!(error instanceof AuthRequestError)) {
    return "Não foi possível entrar com Google";
  }

  if (!error.status) {
    return "Não foi possível conectar ao servidor";
  }

  if (error.status === 400) {
    return "Token do Google inválido";
  }

  if (error.status === 401) {
    return error.message.includes("Token do Google")
      ? "Token do Google inválido"
      : "Usuário não autorizado";
  }

  if (error.status === 403) {
    return "Usuário não autorizado";
  }

  if (error.status === 503) {
    return "Não foi possível validar token do Google";
  }

  return error.message || "Erro da API ao autenticar com Google";
};

const GoogleIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 18 18">
    <Path
      d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.91c1.7-1.57 2.69-3.88 2.69-6.62Z"
      fill="#4285F4"
    />
    <Path
      d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.91-2.26c-.8.54-1.84.86-3.05.86-2.34 0-4.33-1.58-5.04-3.71H.96v2.33A9 9 0 0 0 9 18Z"
      fill="#34A853"
    />
    <Path
      d="M3.96 10.71a5.41 5.41 0 0 1 0-3.42V4.96H.96a9 9 0 0 0 0 8.08l3-2.33Z"
      fill="#FBBC05"
    />
    <Path
      d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.96l3 2.33C4.67 5.16 6.66 3.58 9 3.58Z"
      fill="#EA4335"
    />
  </Svg>
);

export default function LoginScreen() {
  const router = useRouter();
  const { signIn, signInWithGoogle } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setLoading] = useState(false);
  const [isGoogleLoading, setGoogleLoading] = useState(false);
  const googleClientId = useMemo(getGoogleClientId, []);
  const googleAuthNonce = useMemo(() => Crypto.randomUUID(), []);
  const isGoogleWebAuth = Platform.OS === "web";
  const [googleRequest, , promptGoogleAsync] = AuthSession.useAuthRequest(
    {
      clientId: googleClientId || GOOGLE_MISSING_CLIENT_ID,
      redirectUri: GOOGLE_REDIRECT_URI,
      responseType: isGoogleWebAuth
        ? AuthSession.ResponseType.IdToken
        : AuthSession.ResponseType.Code,
      scopes: GOOGLE_AUTH_SCOPES,
      prompt: AuthSession.Prompt.SelectAccount,
      usePKCE: !isGoogleWebAuth,
      extraParams: isGoogleWebAuth ? { nonce: googleAuthNonce } : undefined,
    },
    GOOGLE_DISCOVERY
  );

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

  const getGoogleIdToken = async (
    result: AuthSession.AuthSessionResult
  ) => {
    if (result.type !== "success") {
      return "";
    }

    const idToken =
      result.params.id_token ?? result.authentication?.idToken ?? "";

    if (idToken) {
      return idToken;
    }

    const code = result.params.code;

    if (!code || !googleRequest?.codeVerifier) {
      return "";
    }

    const tokenResponse = await AuthSession.exchangeCodeAsync(
      {
        clientId: googleClientId,
        code,
        redirectUri: GOOGLE_REDIRECT_URI,
        scopes: GOOGLE_AUTH_SCOPES,
        extraParams: {
          code_verifier: googleRequest.codeVerifier,
        },
      },
      GOOGLE_DISCOVERY
    );

    return tokenResponse.idToken ?? "";
  };

  const handleGoogleLogin = async () => {
    setErrorMessage("");

    if (!googleClientId) {
      setErrorMessage("Login com Google não configurado");
      return;
    }

    if (!googleRequest) {
      setErrorMessage("Login com Google ainda não está pronto");
      return;
    }

    try {
      setGoogleLoading(true);

      const result = await promptGoogleAsync();

      if (result.type === "cancel" || result.type === "dismiss") {
        setErrorMessage("Login com Google cancelado");
        return;
      }

      if (result.type !== "success") {
        setErrorMessage("Não foi possível autenticar com Google");
        return;
      }

      const idToken = await getGoogleIdToken(result);

      if (!idToken) {
        setErrorMessage("Token do Google inválido");
        return;
      }

      await signInWithGoogle(idToken);
      router.replace("/home");
    } catch (error) {
      setErrorMessage(getGoogleApiErrorMessage(error));
    } finally {
      setGoogleLoading(false);
    }
  };

  const isAnyLoginLoading = isLoading || isGoogleLoading;

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
          disabled={isAnyLoginLoading}
          style={{
            backgroundColor: isAnyLoginLoading
              ? colors.textSecondary
              : colors.primary,
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

        <TouchableOpacity
          onPress={handleGoogleLogin}
          disabled={isAnyLoginLoading || !googleRequest}
          style={{
            height: 48,
            marginTop: 12,
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: "#DADCE0",
            borderRadius: 4,
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "row",
            opacity: isAnyLoginLoading || !googleRequest ? 0.7 : 1,
          }}
        >
          {isGoogleLoading ? (
            <ActivityIndicator color={colors.textSecondary} />
          ) : (
            <>
              <View style={{ position: "absolute", left: 14 }}>
                <GoogleIcon />
              </View>

              <Text
                style={{
                  color: "#3C4043",
                  fontSize: 14,
                  fontWeight: "600",
                }}
              >
                Continuar com Google
              </Text>
            </>
          )}
        </TouchableOpacity>
        
      </View>
      <View style={{ height: 100 }}></View>
    </SafeAreaView>
  );
}
