"use client"

// Stub cliente para GitHub Pages (sin backend). Simula carga y guarda en localStorage.
export async function uploadLogo(formData: FormData) {
  const file = formData.get("file") as File | null
  if (!file) {
    return { success: false, error: "No se proporcionó ningún archivo" }
  }
  // Crear URL local temporal
  const objectUrl = URL.createObjectURL(file)
  try {
    localStorage.setItem("logoUrl", objectUrl)
  } catch {}
  return { success: true, url: objectUrl }
}
