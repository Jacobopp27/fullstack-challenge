const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

// Wrapper de fetch que siempre incluye las cookies y maneja errores de forma consistente
export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: 'include', // necesario para enviar cookies al backend
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      (error as any).message ?? `Error ${response.status}: ${response.statusText}`,
    );
  }

  // 204 No Content no tiene body
  if (response.status === 204) return undefined as T;

  return response.json();
}
