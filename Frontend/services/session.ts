import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const TOKEN_KEY = "auth.token";
const USER_KEY = "auth.user";

type WebStorage = {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
};

type GlobalWithLocalStorage = typeof globalThis & {
  localStorage?: WebStorage;
};

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: "driver" | "admin";
};

export type AuthSession = {
  token: string;
  user: AuthUser;
};

const getWebStorage = () =>
  (globalThis as GlobalWithLocalStorage).localStorage;

const getItem = async (key: string) => {
  if (Platform.OS === "web") {
    return getWebStorage()?.getItem(key) ?? null;
  }

  return SecureStore.getItemAsync(key);
};

const setItem = async (key: string, value: string) => {
  if (Platform.OS === "web") {
    getWebStorage()?.setItem(key, value);
    return;
  }

  await SecureStore.setItemAsync(key, value);
};

const removeItem = async (key: string) => {
  if (Platform.OS === "web") {
    getWebStorage()?.removeItem(key);
    return;
  }

  await SecureStore.deleteItemAsync(key);
};

export const saveSession = async ({ token, user }: AuthSession) => {
  await Promise.all([
    setItem(TOKEN_KEY, token),
    setItem(USER_KEY, JSON.stringify(user)),
  ]);
};

export const getSession = async (): Promise<AuthSession | null> => {
  const [token, rawUser] = await Promise.all([
    getItem(TOKEN_KEY),
    getItem(USER_KEY),
  ]);

  if (!token || !rawUser) {
    return null;
  }

  try {
    return {
      token,
      user: JSON.parse(rawUser) as AuthUser,
    };
  } catch {
    await clearSession();
    return null;
  }
};

export const clearSession = async () => {
  await Promise.all([removeItem(TOKEN_KEY), removeItem(USER_KEY)]);
};
