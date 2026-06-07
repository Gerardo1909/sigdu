// Token management en localStorage

export const getToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
};

export const setToken = (token: string): void => {
  localStorage.setItem("access_token", token);
};

export const removeToken = (): void => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
};
