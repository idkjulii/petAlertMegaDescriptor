// src/lib/sessionStorage.js
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "auth_token";
const REFRESH_KEY = "refresh_token";
const PROFILE_KEY = "user_profile"; // non-sensitive, large → AsyncStorage

export async function saveTokens({ access_token, refresh_token }) {
  if (access_token) await SecureStore.setItemAsync(TOKEN_KEY, access_token);
  if (refresh_token) await SecureStore.setItemAsync(REFRESH_KEY, refresh_token);
}

export async function getTokens() {
  const access_token = await SecureStore.getItemAsync(TOKEN_KEY);
  const refresh_token = await SecureStore.getItemAsync(REFRESH_KEY);
  return { access_token, refresh_token };
}

export async function clearTokens() {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
  await SecureStore.deleteItemAsync(REFRESH_KEY);
}

export async function saveUserProfile(profile) {
  // store non-sensitive / large payloads here
  await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile ?? {}));
}

export async function getUserProfile() {
  const raw = await AsyncStorage.getItem(PROFILE_KEY);
  return raw ? JSON.parse(raw) : null;
}

export async function clearUserProfile() {
  await AsyncStorage.removeItem(PROFILE_KEY);
}

