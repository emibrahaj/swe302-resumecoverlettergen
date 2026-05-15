const API_BASE =
  process.env.NEXT_PUBLIC_API_URL;

export async function getTemplates() {
  const response = await fetch(
    `${API_BASE}/templates/`,
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch templates");
  }

  return response.json();
}