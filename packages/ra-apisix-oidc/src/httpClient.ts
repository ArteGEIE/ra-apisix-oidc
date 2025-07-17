import { fetchUtils, type Options } from "ra-core";

export const httpClient = (url: string, options: Options = {}) => {
  const token = localStorage.getItem("access_token");
  return fetchUtils.fetchJson(url, {
    ...options,
    user: { authenticated: !!token, token: `Bearer ${token}` },
  });
};
