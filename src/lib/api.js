// src/lib/api.js
import { NETWORK_CONFIG } from '../config/network.js';

export const API_URL = process.env.EXPO_PUBLIC_API_URL || NETWORK_CONFIG.BACKEND_URL;

export async function postImage(endpoint, { uri, name = "photo.jpg", type = "image/jpeg" }) {
  const form = new FormData();
  form.append("file", { uri, name, type });
  // Don't set Content-Type manually; fetch will add the multipart boundary.
  const res = await fetch(`${API_URL}${endpoint}`, { method: "POST", body: form });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Upload failed ${res.status}: ${text}`);
  }
  return res.json();
}
