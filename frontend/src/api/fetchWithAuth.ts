import { refreshAccessToken } from "./auth";

// Обгортка для fetch з автоматичним оновленням access токена
export async function fetchWithAuth(input: RequestInfo, init: RequestInit = {}) {
  let token = localStorage.getItem("token");
  //  Authorization заголовок
  const headers = new Headers(init.headers || {});
  if (token) headers.set("Authorization", `Bearer ${token}`);

  let response = await fetch(input, { ...init, headers });

  // Якщо токен протерміновано — оновити
  if (response.status === 401) {
    try {
      token = await refreshAccessToken();
      headers.set("Authorization", `Bearer ${token}`);
      response = await fetch(input, { ...init, headers });
    } catch {
      // Якщо refresh не вдався — повертаємо 401
      return response;
    }
  }

  return response;
}