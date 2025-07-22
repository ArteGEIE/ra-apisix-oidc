import { fetchUtils, type Options } from "ra-core";

export const httpClient = (storage: Storage = localStorage) => (url: string, options: Options = {}) => {
  const token = storage.getItem("access_token");
  return fetchUtils.fetchJson(url, {
    ...options,
    user: { authenticated: !!token, token: `Bearer ${token}` },
  });
};
