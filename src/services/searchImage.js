import { NETWORK_CONFIG } from '../config/network.js';

export async function searchImage(baseUrl = NETWORK_CONFIG.BACKEND_URL, fileUri, lat, lng, maxKm) {
  const form = new FormData();
  // @ts-expect-error RN FormData file
  form.append("file", { uri: fileUri, name: "query.jpg", type: "image/jpeg" });
  const q = new URLSearchParams({ top_k: "10" });
  if (lat !== undefined && lng !== undefined && maxKm) {
    q.set("lat", String(lat));
    q.set("lng", String(lng));
    q.set("max_km", String(maxKm));
  }
  const res = await fetch(`${baseUrl}/embeddings/search_image?${q.toString()}`, { 
    method: "POST", 
    body: form,
    timeout: 30000 // 30 segundos de timeout
  });
  if (!res.ok) {
    const errorText = await res.text().catch(() => 'Error desconocido');
    throw new Error(`Error del servidor (${res.status}): ${errorText}`);
  }
  return await res.json();
}
