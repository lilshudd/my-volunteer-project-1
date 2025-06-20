// Функція для оновлення access токена через refresh токен (зберігається у httpOnly cookie)
export async function refreshAccessToken(): Promise<string> {
  const response = await fetch("/api/auth/refresh", {
    method: "POST",
    credentials: "include", // дозволяє надсилати cookie
  });

  if (!response.ok) {
    throw new Error("Не вдалося оновити токен");
  }

  const data = await response.json();
  if (data.accessToken) {
    localStorage.setItem("token", data.accessToken);
    return data.accessToken;
  }
  throw new Error("Відповідь не містить accessToken");
}