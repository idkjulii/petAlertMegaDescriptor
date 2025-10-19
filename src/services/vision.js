import { buildUrl } from '../config/backend.js';

async function analyzeImage(fileUri) {
  const formData = new FormData();
  formData.append("file", {
    uri: fileUri,
    type: "image/jpeg",
    name: "photo.jpg",
  });

  const response = await fetch(buildUrl('ANALYZE_IMAGE'), {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Error al analizar la imagen");
  }

  const data = await response.json();
  return data.labels; // Ej: [{label: "dog", score: 98.5}, ...]
}

const visionService = {
  analyzeImage,
};

export { visionService };


